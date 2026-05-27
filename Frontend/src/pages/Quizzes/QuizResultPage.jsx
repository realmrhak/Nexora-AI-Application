import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from 'lucide-react';

const QuizResultPage = () => {
  const { quizId } = useParams();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error('Failed to fetch quiz results.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg text-slate-600">
          No results found.
        </p>
      </div>
    );
  }

  // API Data
  const quiz = results?.data?.quiz || {};
  const detailedResults = results?.data?.result || [];

  // Stats
  const score = quiz?.score || 0;

  const totalQuestions = detailedResults.length;

  const correctAnswers = detailedResults.filter(
    (r) => r.isCorrect
  ).length;

  const incorrectAnswers =
    totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80)
      return 'from-emerald-500 to-teal-500';

    if (score >= 60)
      return 'from-amber-500 to-orange-500';

    return 'from-rose-500 to-red-500';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good work!';
    if (score >= 60) return 'Not bad!';

    return 'Keep practicing!';
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to={
            quiz?.document?._id
              ? `/documents/${quiz.document._id}`
              : '/documents'
          }
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />

          Back to Document
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={`${quiz?.title || 'Quiz'} Results`}
      />

      {/* Score Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 mb-10">
        <div className="text-center">
          {/* Trophy */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-emerald-100 to-teal-100 mb-6">
            <Trophy className="w-9 h-9 text-emerald-600" />
          </div>

          {/* Score */}
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Your Score
          </p>

          <div
            className={`text-6xl font-extrabold bg-linear-to-r ${getScoreColor(
              score
            )} bg-clip-text text-transparent`}
          >
            {score}%
          </div>

          <p className="text-xl font-medium text-slate-700 mt-2">
            {getScoreMessage(score)}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50">
              <Target className="w-4 h-4 text-slate-600" />

              <span className="text-sm font-medium text-slate-700">
                {totalQuestions} Total
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              <span className="text-sm font-medium text-emerald-700">
                {correctAnswers} Correct
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-rose-200 bg-rose-50">
              <XCircle className="w-4 h-4 text-rose-600" />

              <span className="text-sm font-medium text-rose-700">
                {incorrectAnswers} Incorrect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-slate-700" />

          <h2 className="text-2xl font-bold text-slate-800">
            Detailed Review
          </h2>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex =
            result.options.findIndex(
              (opt) =>
                opt === result.selectedAnswer
            );

          const correctAnswerIndex =
            result.options.findIndex(
              (opt) =>
                opt === result.correctAnswer
            );

          const isCorrect = result.isCorrect;

          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Question {index + 1}
                  </span>

                  <h3 className="text-xl font-semibold text-slate-800 mt-4 leading-8">
                    {result.question}
                  </h3>
                </div>

                {/* Status Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${isCorrect
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-rose-50 border-rose-200'
                    }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600" />
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {result.options.map(
                  (option, optIndex) => {
                    const isCorrectOption =
                      optIndex ===
                      correctAnswerIndex;

                    const isUserAnswer =
                      optIndex ===
                      userAnswerIndex;

                    const isWrongAnswer =
                      isUserAnswer &&
                      !isCorrect;

                    return (
                      <div
                        key={optIndex}
                        className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 ${isCorrectOption
                            ? 'bg-emerald-50 border-emerald-300'
                            : isWrongAnswer
                              ? 'bg-rose-50 border-rose-300'
                              : 'bg-white border-slate-200'
                          }`}
                      >
                        <span className="text-slate-700 font-medium">
                          {option}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Correct Badge */}
                          {isCorrectOption && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                              Correct
                            </span>
                          )}

                          {/* Wrong Badge */}
                          {isWrongAnswer && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Explanation */}
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-slate-500" />

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Explanation
                  </p>
                </div>

                <p className="text-sm leading-7 text-slate-700">
                  {result.explanation ||
                    'No explanation available for this question.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Button */}
      <div className="flex justify-center mt-8">
        <Link
          to={
            quiz?.document?._id
              ? `/documents/${quiz.document._id}`
              : '/documents'
          }>
            <button className="group relative px-8 h-12 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200">
              <span className="relative z-10 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Return to Document
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;