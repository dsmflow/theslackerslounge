import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TutorialPage: React.FC = () => {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/${tutorialId}.md`);
        if (!response.ok) {
          throw new Error('Tutorial not found');
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError('Failed to load tutorial content');
        console.error(err);
      }
    };

    fetchContent();
  }, [tutorialId]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-red-500">{error}</div>
        <Link to="/" className="text-accent hover:text-cream">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="prose prose-invert prose-lg max-w-none">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => (
              <h1 className="text-5xl font-display text-gold mb-8 pb-4 border-b-2 border-gold/30" {...props} />
            ),
            h2: ({node, ...props}) => (
              <h2 className="text-3xl font-display text-accent mt-12 mb-6" {...props} />
            ),
            h3: ({node, ...props}) => (
              <h3 className="text-2xl font-display text-cream/90 mt-8 mb-4" {...props} />
            ),
            p: ({node, ...props}) => (
              <p className="text-cream/80 mb-4 leading-relaxed" {...props} />
            ),
            ul: ({node, ...props}) => (
              <ul className="list-disc list-inside space-y-2 mb-6 text-cream/80" {...props} />
            ),
            li: ({node, ...props}) => (
              <li className="ml-4" {...props} />
            ),
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="relative">
                  <div className="absolute top-0 right-0 text-xs text-cream/50 px-2 py-1">
                    {match[1].toUpperCase()}
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg border border-accent/30 !bg-dark/50 !my-6"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="px-1.5 py-0.5 rounded bg-dark/50 text-accent font-mono text-sm" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="mt-12 border-t border-gold/30 pt-8">
        <Link 
          to="/" 
          className="inline-block px-4 py-2 rounded-md border-2 border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300 hover:shadow-gold text-shadow-gold"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default TutorialPage;
