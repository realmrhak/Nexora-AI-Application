import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as deepseekService from '../utils/deepseek.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// ✅ FIX: Difficulty cleaner
const cleanDifficulty = (d) => {
    const val = String(d || "").toLowerCase();

    if (val.includes("easy")) return "easy";
    if (val.includes("hard")) return "hard";
    if (val.includes("medium")) return "medium";

    return "medium";
};

// @desc Generate flashcards
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count: rawCount } = req.body;
        const count = Math.min(Math.max(parseInt(rawCount, 5) || 10, 1), 50);

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or still processing',
                statusCode: 404
            });
        }

        if (!document.extractedText || !document.extractedText.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Document text could not be extracted',
                statusCode: 400
            });
        }

        const cards = await deepseekService.generateFlashcards(
            document.extractedText,
            count
        );

        // DEBUG (optional)
        console.log("AI CARDS:", cards);

        if (!cards.length) {
            return res.status(500).json({
                success: false,
                error: 'No flashcards generated',
                statusCode: 500
            });
        }

        // ✅ FIXED: sanitize + filter
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards
                .filter(card => card.question && card.answer)
                .map(card => {
                    let difficulty = "medium"; // default SAFE

                    if (card.difficulty) {
                        const d = String(card.difficulty).toLowerCase();

                        if (d.includes("easy")) difficulty = "easy";
                        else if (d.includes("hard")) difficulty = "hard";
                        else if (d.includes("medium")) difficulty = "medium";
                    }

                    return {
                        question: card.question,
                        answer: card.answer,
                        difficulty: difficulty, // ALWAYS safe now
                        reviewCount: 0,
                        isStarred: false
                    };
                })
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });

    } catch (error) {
        console.error('Generate Flashcards Error:', error.message);

        const apiStatus = typeof error?.status === 'number' ? error.status : null;

        if (apiStatus === 503 || apiStatus === 429) {
            return res.status(apiStatus).json({
                success: false,
                error: 'AI service is busy or rate-limited. Please try again.',
                statusCode: apiStatus
            });
        }

        if (apiStatus === 400 || apiStatus === 404) {
            return res.status(apiStatus).json({
                success: false,
                error: error.message || 'Request failed',
                statusCode: apiStatus
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            statusCode: 500
        });
    }
};

// @desc Generate quiz
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const questions = await deepseekService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // ✅ small safety (optional)
        const safeQuestions = questions.filter(q => q.question && q.options?.length === 4);

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions.map(q => {
                let difficulty = "medium";

                if (q.difficulty) {
                    const d = String(q.difficulty).toLowerCase();

                    if (d.includes("easy")) difficulty = "easy";
                    else if (d.includes("hard")) difficulty = "hard";
                    else if (d.includes("medium")) difficulty = "medium";
                }

                return {
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: difficulty
                };
            }),
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc Generate summary
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const summary = await deepseekService.generateSummary(document.extractedText);

        return res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully'
        });

    } catch (error) {
        next(error);
    }
};

// Balance endpoints same rehne diye
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {

            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }


        // Find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // Get or create chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }
        // Generate response using Deepseek
        const answer = await deepseekService.chatWithContext(question, relevantChunks);

        // Save conversation
        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: []
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );
        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices, chatHistoryId: chatHistory._id
            },
            message: 'Response generated successfully'
        });

    } catch (error) {
        next(error)
    }
};

export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and concept',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // Find relevant chunks for the concept
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        // Generate explanation using Deepseek
        const explanation = await deepseekService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });

    } catch (error) {
        next(error)
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('messages'); // Only retrieve the messages array

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [], // Return an empty array if no chat history found 
                message: 'No chat history found for this document'
            });
        }

        res.status(200).json({
                success: true,
                data: chatHistory.messages,
                message: 'Chat history retrieved successfully'
            })
    } catch (error) {
        next(error)
    }
};