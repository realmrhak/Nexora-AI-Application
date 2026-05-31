import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import flashcardService from '../../services/flashcardsService';
import aiService from '../../services/aiService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Flashcard from '../../components/flashcards/Flashcard';

const FlashcardsPage = () => {

  const { id: documentId } = useParams();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards."); console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };
  const handleNextCard = () => {
    handleReview(currentCardIndex)
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };


  const handlePrevCard = () => {
    handleReview(currentCardIndex)
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id == cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success("Flashcard starred status updated!");
    } catch (error) {
      toast.error("Failed to update star status.");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true)
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id)
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchFlashcards(); // Refetch to show empty state
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set.");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <Spinner />
        </div>
      );
    }

    if (flashcards.length === 0) {
      return (
        <div className="px-3 sm:px-4">
          <EmptyState
            title="No Flashcards Yet"
            description="Generate flashcards from your document to start learning."
          />
        </div>
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-4 sm:space-y-6 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button onClick={handlePrevCard} variant="secondary" disabled={flashcards.length <= 1} className="h-9 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm">
            <ChevronLeft size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span className="text-xs sm:text-sm text-neutral-600 font-medium">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button onClick={handleNextCard} variant="secondary" disabled={flashcards.length <= 1} className="h-9 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    );
  };
  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="mb-3 sm:mb-4">
        <Link to={`/documents/${documentId}`} className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
          <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
          Back to Document
        </Link>
      </div>
      <PageHeader title="Flashcards">
        <div className="flex gap-2">
          {!loading &&
            (flashcards.length > 0 ? (
              <>
                <Button onClick={() => setIsDeleteModalOpen(true)} disabled={deleting} size="sm" className="text-xs sm:text-sm">
                  <Trash2 size={14} className="sm:w-4 sm:h-4" /> 
                  <span className="hidden sm:inline">Delete Set</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </>
            ) : (
              <Button onClick={handleGenerateFlashcards} disabled={generating} size="sm" className="text-xs sm:text-sm">
                {generating ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Plus size={14} className="sm:w-4 sm:h-4" /> 
                    <span className="hidden sm:inline">Generate Flashcards</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </Button>
            ))}
        </div>
      </PageHeader>

      <div className="mt-4 sm:mt-6">
        {renderFlashcardContent()}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set">

        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-neutral-600">
            Are you sure you want to delete all flashcards for this document? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 py-2">
            <Button type='button' variant='secondary' onClick={() => setIsDeleteModalOpen(false)} disabled={deleting} size="sm">
              Cancel
            </Button>
            <Button onClick={handleDeleteFlashcardSet} disabled={deleting} size="sm" className='bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500 text-xs sm:text-sm'>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>

  )
}

export default FlashcardsPage