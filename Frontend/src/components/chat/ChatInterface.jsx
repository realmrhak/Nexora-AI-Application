import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: 'assistant',
        content: response?.data?.answer || response?.answer || "No response received",
        timestamp: new Date()
      };
      setHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      setHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: error?.message || 'Backend error occurred',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div key={index} className={`flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start gap-2 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isUser ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className='w-3 h-3 sm:w-4 sm:h-4 text-white' strokeWidth={2} />
            </div>
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 mt-0.5">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          <div className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-sm leading-relaxed wrap-break-word overflow-hidden min-w-0 ${
            isUser
              ? 'bg-emerald-500 text-white rounded-tr-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
          }`}>
            {isUser ? (
              <p className="wrap-break-word">{msg.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none overflow-x-auto">
                <MarkdownRenderer content={msg.content} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      // ✅ FIXED: h-[94%] instead of h-full
      <div className="flex flex-col h-[94%] bg-white rounded-xl items-center justify-center shadow-sm w-full">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
          <MessageSquare className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-600' strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 mt-2">Loading chat history</p>
      </div>
    );
  }

  return (
    // ✅ FIXED: h-[94%] instead of h-full
    <div className='flex flex-col h-[94%] bg-white rounded-xl shadow-sm overflow-hidden w-full'>
      {/* Messages area - ONLY THIS SCROLLS */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 w-full min-h-0">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <MessageSquare className='w-6 h-6 sm:w-7 sm:h-7 text-emerald-600' strokeWidth={2} />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">Start a conversation</h3>
            <p className="text-xs sm:text-sm text-slate-500">Ask me anything about the document!</p>
          </div>
        ) : (
          <div className="space-y-1 w-full">
            {history.map(renderMessage)}
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {loading && (
          <div className="flex w-full mb-3 justify-start">
            <div className="flex items-start gap-2 max-w-[95%]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Sparkles className='w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin' strokeWidth={2} />
              </div>
              <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl rounded-tl-sm bg-white border border-slate-200">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area - STAYS FIXED AT BOTTOM */}
      <div className="p-2 sm:p-3 border-t border-slate-200 bg-white w-full shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ask a follow-up question...'
            disabled={loading}
            className="flex-1 h-10 sm:h-11 px-3 sm:px-4 border border-slate-300 rounded-full bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white" 
          />
          <button 
            type='submit'
            disabled={loading || !message.trim()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition shrink-0"
          >
            <Send className='w-4 h-4 sm:w-5 sm:h-5' strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;