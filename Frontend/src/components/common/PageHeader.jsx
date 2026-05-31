import React from 'react'

const PageHeader = ({title, subtitle, children}) => {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2'>
        <div>
            <h1 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight mb-1 sm:mb-2">
                {title}
            </h1>
            {subtitle && (
                <p className="text-slate-500 text-xs sm:text-sm">
                    {subtitle}
                </p>
            )}
        </div>
        {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}

export default PageHeader