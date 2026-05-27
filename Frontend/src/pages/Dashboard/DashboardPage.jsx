import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  BrainCircuit,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await progressService.getDashboardData();
        setDashboardData(res?.data || null);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-brrom-slate-50 via-white to-slate-100 px-3 sm:px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            No dashboard data available
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData?.overview?.totalDocuments || 0,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      label: "Total Flashcards",
      value: dashboardData?.overview?.totalFlashcardSets || 0,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      label: "Total Quizzes",
      value: dashboardData?.overview?.totalQuizzes || 0,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
    },
  ];

  const activities = [
    ...(dashboardData?.recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      description: doc.title,
      timestamp: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      type: "document",
    })),
    ...(dashboardData?.recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      description: quiz.title,
      timestamp: quiz.lastAttempted,
      link: `/quizzes/${quiz._id}`,
      type: "quiz",
    })),
  ].sort(
    (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
  );

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[14px_14px] sm:bg-size-[16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">

        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-slate-900 mb-1">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your learning progress and activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6 mb-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">
                  {stat.label}
                </span>

                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mt-2 sm:mt-3">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-6 lg:p-8">

          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium text-slate-900">
              Recent Activity
            </h3>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "document"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                        }`}
                      />

                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                        {activity.type === "document"
                          ? "Accessed Document: "
                          : "Attempted Quiz: "}
                        <span className="text-slate-700">
                          {activity.description}
                        </span>
                      </p>
                    </div>

                    <p className="text-[10px] sm:text-xs text-slate-500 pl-4">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleString()
                        : "No date"}
                    </p>
                  </div>

                  {/* ✅ FIXED NAVIGATION BUTTON */}
                  {activity.link && (
                    <button
                      onClick={() => navigate(activity.link)}
                      className="self-start sm:self-auto px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      View
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 mb-4">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                No recent activity yet.
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                Start learning to see your progress here
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;