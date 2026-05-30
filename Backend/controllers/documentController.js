import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary'; // ✅ Cloudinary SDK Import kiya

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a PDF file",
                statusCode: 400,
            });
        }

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
                statusCode: 400,
            });
        }

        // ✅ Cloudinary URL (SAFE fallback included)
        const fileUrl = req.file.path;

        console.log("📄 Uploaded file:", req.file);
        console.log("🌐 Public File URL:", fileUrl);

        if (!fileUrl) {
            return res.status(500).json({
                success: false,
                error: "Cloudinary upload failed (file URL missing)",
                statusCode: 500,
            });
        }

        // ✅ STEP ADDED: Generate Signed URL for secure backend fetching
        let fetchUrl = fileUrl; // Default to public URL
        if (req.file.filename) {
            fetchUrl = cloudinary.url(req.file.filename, {
                resource_type: "raw", // PDF ke liye zaroori hai
                type: "upload",       
                sign_url: true,       // Secret token add karega
                secure: true,         // HTTPS URL dega
                expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
            });
            console.log("🔑 Signed URL generated for PDF extraction");
        }

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl, // Frontend ke liye hum public URL save karenge
            fileSize: req.file.size,
            status: "processing",
        });

        // Process PDF (async) - ✅ Ab Signed URL (fetchUrl) bhej rahe hain
        processPDF(document._id, fetchUrl).catch((err) => {
            console.error("PDF processing error:", err);
        });

        return res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully. Processing in progress...",
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        next(error);
    }
};

// Helper function to process PDF
const processPDF = async (documentId, pdfUrl) => { // ✅ Parameter name change kiya for clarity

    try {

        const { text } = await extractTextFromPDF(pdfUrl); // ✅ Signed URL use ho raha hai

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
                status: 'ready', // ✅ Ab yahan ready aayega
            },
            $unset: { processingError: 1 },
        });

        console.log(`✅ Document ${documentId} processed successfully`);

    } catch (error) {

        console.error(`❌ Error processing document ${documentId}:`, error);

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
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id)
                }
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
                $sort: {
                    uploadDate: -1
                }
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
};

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

        // Get counts
        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.user._id
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id
        });

        // Update last accessed
        document.lastAccessed = Date.now();

        await document.save();

        // Combine data
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

        // Delete document from DB
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};