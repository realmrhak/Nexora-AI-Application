import React from 'react'

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className='w-full'>
      {/* ✅ FIXED: Better scroll with snap points */}
      <div className="relative border-b-2 border-slate-100 overflow-x-auto scrollbar-hide scroll-smooth snap-x">
        <nav className="flex gap-1 sm:gap-2 min-w-max px-1">
          {tabs.map((tab) => (
            <button 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative pb-3 sm:pb-4 px-2 sm:px-4 md:px-6 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 snap-start rounded-t-lg ${
                activeTab === tab.name
                  ? 'text-emerald-600 bg-emerald-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-2 right-2 sm:left-0 sm:right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* ✅ FULL WIDTH content area - No card wrapper */}
      <div className="w-full mt-3 sm:mt-4">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div key={tab.name} className='animate-in fade-in duration-300 w-full'>
                {tab.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  )
};

export default Tabs;