import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="text-neutral-700 text-sm sm:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 mb-2" {...props} />
          ),

          h2: ({ ...props }) => (
            <h2 className="text-lg sm:text-xl font-bold mt-3 sm:mt-4 mb-2" {...props} />
          ),

          h3: ({ ...props }) => (
            <h3 className="text-base sm:text-lg font-bold mt-2 sm:mt-3 mb-1 sm:mb-2" {...props} />
          ),

          h4: ({ ...props }) => (
            <h4 className="text-sm sm:text-base font-bold mt-2 sm:mt-3 mb-1" {...props} />
          ),

          p: ({ ...props }) => (
            <p className="mb-2 sm:mb-3 leading-relaxed" {...props} />
          ),

          a: ({ ...props }) => (
            <a
              className="text-emerald-500 hover:underline wrap-break-words"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),

          ul: ({ ...props }) => (
            <ul className="list-disc pl-4 sm:pl-6 mb-2 sm:mb-3" {...props} />
          ),

          ol: ({ ...props }) => (
            <ol className="list-decimal pl-4 sm:pl-6 mb-2 sm:mb-3" {...props} />
          ),

          li: ({ ...props }) => (
            <li className="mb-1" {...props} />
          ),

          strong: ({ ...props }) => (
            <strong className="font-bold" {...props} />
          ),

          em: ({ ...props }) => (
            <em className="italic" {...props} />
          ),

          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-neutral-300 pl-3 sm:pl-4 italic text-neutral-600 my-3 sm:my-4"
              {...props}
            />
          ),

          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            return match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                className="text-xs sm:text-sm rounded-lg"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-neutral-100 px-1 py-0.5 rounded text-xs sm:text-sm font-mono wrap-break-words"
                {...props}
              >
                {children}
              </code>
            );
          },

          pre: ({ ...props }) => (
            <pre
              className="bg-neutral-900 text-white p-3 sm:p-4 rounded-lg overflow-x-auto my-3 sm:my-4 text-xs sm:text-sm"
              {...props}
            />
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;