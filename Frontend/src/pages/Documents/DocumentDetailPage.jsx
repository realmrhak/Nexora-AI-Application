import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentDetails();
  }, [id]);

  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;
    const filePath = document.data.filePath;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const isMobile = useMemo(() => {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (!document || !document.data || !document.data.filePath) {
      return <div className="text-center p-8">PDF not available.</div>;
    }
    const pdfUrl = getPdfUrl();
    const viewerUrl = isMobile
      ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`
      : pdfUrl;

    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <span className="text-sm font-medium text-gray-700">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Open in new tab</span>
          </a>
        </div>
        <div className="flex-1 min-h-0 bg-gray-100 p-1">
          {isMobile ? (
            <div className="w-full h-full bg-white rounded border border-gray-200 flex flex-col overflow-hidden">
              <iframe
                src={viewerUrl}
                className="w-full flex-1"
                title="PDF Viewer"
                frameBorder="0"
              />
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium text-sm transition-colors shrink-0"
              >
                Open PDF in Browser
              </a>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full bg-white rounded border border-gray-200"
              title="PDF Viewer"
              frameBorder="0"
              style={{ colorScheme: 'Light' }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderChat = () => <ChatInterface />;
  const renderAIActions = () => <AIActions />;
  const renderFlashcardsTab = () => <FlashcardManager documentId={id} />;
  const renderQuizzesTab = () => <QuizManager documentId={id} />;

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() }
  ];

  if (loading) return <Spinner />;
  if (!document) return <div className='text-center p-8'>Document not found.</div>;

  return (
    // ✅ FIXED: h-screen instead of h-dvh, overflow-hidden on root
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
      {/* Fixed height layout: calc(100vh - 0) with no outer scroll */}
      <div className="w-full h-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col">
        {/* Back Link - fixed */}
        <div className="shrink-0 mb-3 sm:mb-4">
          <Link to="/documents" className='inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 transition-colors'>
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            Back to Documents
          </Link>
        </div>

        {/* Title - fixed */}
        <div className="shrink-0">
          <PageHeader title={document.data.title} />
        </div>

        {/* Tabs - takes remaining height, no overflow here */}
        <div className="flex-1 min-h-0 mt-3 sm:mt-4">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;