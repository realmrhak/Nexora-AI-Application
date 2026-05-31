import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import moment from 'moment';

const FlashcardSetCard = ({ flashcardSet }) => {

    const navigate = useNavigate();

    const handleStudyNow = () => {
        if (!flashcardSet?.documentId?._id) return;
        navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
    };

    const reviewCount = flashcardSet.cards.filter(card => card.lastReviewed).length;
    const totalCards = flashcardSet.cards.length;
    const progressPercentage = totalCards > 0 ? Math.round((reviewCount / totalCards) * 100) : 0;

    return (
        <div 
            className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between" 
            onClick={handleStudyNow}
        >
            <div className="space-y-3 sm:space-y-4">
                {/* Icon and Title */}
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 mb-1"
                            title={flashcardSet?.documentId?.title || "Untitled Flashcards"}
                        >
                            {flashcardSet?.documentId?.title || "Untitled Flashcards"}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Created {moment(flashcardSet.createdAt).fromNow()}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                    <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-xs sm:text-sm font-semibold text-slate-700">
                            {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
                        </span>
                    </div>
                    {reviewCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" strokeWidth={2.5} />
                            <span className="text-xs sm:text-sm font-semibold text-emerald-700">
                                {progressPercentage}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {totalCards > 0 && (
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600">
                                Progress
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                                {reviewCount}/{totalCards} reviewed
                            </span>
                        </div>
                        <div className="relative h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Study Button */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100">
                <button 
                    className='group/btn relative w-full h-9 sm:h-11 bg-linear-to-r from-emerald-50 to-teal-100 hover:from-emerald-600 hover:to-teal-600 text-emerald-700 hover:text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95 overflow-hidden'
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStudyNow();
                    }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                        Study Now
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                </button>
            </div>
        </div>
    );
};

export default FlashcardSetCard;