import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardsService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardsSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        console.log('fetchFlashcards__', response.data);
        setFlashcardSets(response.data);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardsSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="px-3 sm:px-4">
          <EmptyState 
            title='No Flashcard Sets Found'
            description="You haven't generated any flashcards yet. Go to a document to create your first flashcard set."
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <PageHeader 
        title='All Flashcard Sets' 
        subtitle={`${flashcardSets.length} ${flashcardSets.length === 1 ? 'set' : 'sets'} available`}
      />
      <div className="mt-4 sm:mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default FlashcardsListPage;