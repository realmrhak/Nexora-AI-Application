import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_PUBLIC_SEGMENT = '/uploads/documents/';

/** DB stores a public URL; delete needs the on-disk path under uploads/documents */
const resolveStoredFileDiskPath = (storedFilePath) => {
    if (!storedFilePath) return null;
    const i = storedFilePath.indexOf(UPLOADS_PUBLIC_SEGMENT);
    if (i !== -1) {
        const filename = decodeURIComponent(
            storedFilePath.slice(i + UPLOADS_PUBLIC_SEGMENT.length).split('?')[0],
        );
        return path.join(__dirname, '..', 'uploads', 'documents', filename);
    }
    if (!/^https?:\/\//i.test(storedFilePath)) {
        return path.isAbsolute(storedFilePath)
            ? storedFilePath
            : path.join(__dirname, '..', storedFilePath);
    }
    return null;
};

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            // Delete uploaded file if no title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        const baseUrl =
            process.env.BACKEND_PUBLIC_URL?.replace(/\/$/, '') ||
            `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/documents/${encodeURIComponent(req.file.filename)}`;

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl, // Store the URL instead of the local path
            fileSize: req.file.size,
            status: 'processing'
        });

        // Process PDF in background (in production, use a queue like Bull)
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });
        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {
        // Clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};


// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);

        if (!text.trim()) {
            await Document.findByIdAndUpdate(documentId, {
                $set: {
                    extractedText: '',
                    chunks: [],
                    status: 'failed',
                    processingError:
                        'No extractable text in this PDF. It may be image-only or scanned; OCR would be needed.',
                },
            });
            return;
        }

        const chunks = chunkText(text, 500, 50);

        await Document.findByIdAndUpdate(documentId, {
            $set: {
                extractedText: text,
                chunks,
                status: 'ready',
            },
            $unset: { processingError: 1 },
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);

        const msg =
            error instanceof Error ? error.message : 'PDF processing failed';

        await Document.findByIdAndUpdate(documentId, {
            $set: {
                status: 'failed',
                processingError: msg,
            },
        });
    }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
}


// @desc Get single document with chunks 
// @route  GET /api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });


        // Update last accessed 
        document.lastAccessed = Date.now();
        await document.save();

        // Combine document data with counts 
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (error) {
        next(error);
    }
};
// @desc     Delete document
// @route    DELETE /api/documents/:id 
// @access   Private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
        return res.status(404).json({
            success: false,
            error: 'Document not found',
            statusCode: 404
        });
    }
        const diskPath = resolveStoredFileDiskPath(document.filePath);
        if (diskPath) {
            await fs.unlink(diskPath).catch(() => {});
        }

        // Delete document
        await document.deleteOne();

        res.status(200).json({
            success : true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

