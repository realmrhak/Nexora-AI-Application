import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    Trash2,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

import flashcardService from '../../services/flashcardsService';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Flashcard from './Flashcard';
import Modal from '../common/Modal';

const FlashcardManager = ({ documentId }) => {

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error('Failed to fetch flashcard sets.')
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true)
        try {
            await aiService.generateFlashcards(documentId);
            toast.success('Flashcards generated successfully!');
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || 'Failed to generate flashcards.');
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id, index);
            toast.success('Flashcard reviewed!')
        } catch (error) {
            toast.error('Failed to review flashcard.')
        }
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                    );
                    return { ...set, cards: updatedCards };
                }
                return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
            toast.success("Flashcard starred status updated!");
        } catch (error) {
            toast.error("Failed to update star status.");

        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {

        if (!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully!");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set.");
        } finally {
            setDeleting(false);
        }
    }

    const handleSelectedSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className="space-y-4 sm:space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedSet(null)}
                    className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200" >
                    <ArrowLeft
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2} />
                    Back to Sets
                </button>

                {/* Flashcard Display */}
                <div className="flex flex-col items-center space-y-4 sm:space-y-8">
                    <div className="w-full max-w-2xl px-2 sm:px-0">
                        <Flashcard
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar} />
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button
                            onClick={handlePrevCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 h-9 sm:h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100" >
                            <ChevronLeft
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                                strokeWidth={2.5}
                            />
                            <span className="hidden sm:inline">Previous</span>
                        </button>
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-xs sm:text-sm font-semibold text-slate-700">
                                {currentCardIndex + 1}{""}
                                <span className="text-slate-400 font-normal">/</span>{" "}
                                {selectedSet.cards.length}
                            </span>
                        </div>

                        <button
                            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 h-9 sm:h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
                            onClick={handleNextCard}
                            disabled={selectedSet.cards.length <= 1} >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className='w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 sm:py-20">
                    <Spinner />
                </div>
            );
        }

        if (flashcardSets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-4 sm:mb-6">
                        <Brain className='w-6 h-6 sm:w-8 sm:h-8 text-emerald-600' strokeWidth={2} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                        No Flashcards Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 text-center max-w-sm">
                        Generate flashcards from your document to start learning and reinforce your knowledge.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-4 sm:px-6 h-10 sm:h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="hidden sm:inline">Generating...</span>
                                <span className="sm:hidden">Generating</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className='w-3.5 h-3.5 sm:w-4 sm:h-4' strokeWidth={2} />
                                <span className="hidden sm:inline">Generating Flashcards</span>
                                <span className="sm:hidden">Generate</span>
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4 sm:space-y-6">
                {/* Header with Generate Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                            Your Flashcard Sets
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                            {flashcardSets.length}{' '}
                            {flashcardSets.length === 1 ? 'set' : 'sets'} available
                        </p>
                    </div>
                    {/* ✅ FIXED: Button on right side, not full-width */}
                    <div className="flex justify-end">
                        <button
                            className="group inline-flex items-center justify-center gap-2 px-4 sm:px-5 h-9 sm:h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                            onClick={handleGenerateFlashcards}
                            disabled={generating}
                        >
                            {generating ? (
                                <>
                                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Generating...</span>
                                    <span className="sm:hidden">Generating</span>
                                </>
                            ) : (
                                <>
                                    <Plus className='w-3.5 h-3.5 sm:w-4 sm:h-4' strokeWidth={2.5} />
                                    <span className="hidden sm:inline">Generate New Set</span>
                                    <span className="sm:hidden">Generate</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Flashcard Sets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {flashcardSets.map((set) => (
                        <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                            key={set._id}
                            onClick={() => handleSelectedSet(set)}
                        >
                            {/* Delete Button - Always visible on mobile */}
                            <button onClick={(e) => handleDeleteRequest(e, set)} className='absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100' >
                                <Trash2 className='w-3.5 h-3.5 sm:w-4 sm:h-4' strokeWidth={2} />
                            </button>

                            {/* Set Content */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
                                    <Brain className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-600' strokeWidth={2} />
                                </div>

                                <div>
                                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
                                        Flashcard Set
                                    </h4>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Created {moment(set.createdAt).format("MMM D, YYYY")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                    <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <span className="text-xs sm:text-sm font-semibold text-emerald-700">
                                            {set.cards.length}{' '}
                                            {set.cards.length === 1 ? 'card' : 'cards'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        )
    };

    return (
        <>
            <div className='w-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-4 sm:p-8'>
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title='Delete Flashcard Set?' >

                <div className="space-y-4 sm:space-y-6">
                    <p className="text-xs sm:text-sm text-slate-600">
                        Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.
                    </p>
                    <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2">
                        <button className="px-4 sm:px-5 h-9 sm:h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            type='button'
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </button>
                        <button className="px-4 sm:px-5 h-9 sm:h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Deleting...</span>
                                    <span className="sm:hidden">Deleting</span>
                                </span>
                            ) : (
                                'Delete Set'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default FlashcardManager