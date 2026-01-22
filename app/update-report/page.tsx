'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function UpdateReportPage() {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 사이드에서 Markdown 파일을 읽어옵니다
    fetch('/UPDATE_REPORT_2026_01_17_2026_01_22.md')
      .then((res) => res.text())
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load markdown:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <style jsx global>{`
            .markdown-content {
              line-height: 1.8;
              color: #374151;
            }
            .markdown-content h1 {
              font-size: 2rem;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 1.5rem;
              color: #111827;
            }
            .markdown-content h2 {
              font-size: 1.5rem;
              font-weight: 700;
              margin-top: 2rem;
              margin-bottom: 1rem;
              color: #111827;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #e5e7eb;
            }
            .markdown-content h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              color: #1f2937;
            }
            .markdown-content p {
              margin-bottom: 1rem;
              line-height: 1.8;
            }
            .markdown-content ul,
            .markdown-content ol {
              margin-bottom: 1rem;
              padding-left: 1.5rem;
            }
            .markdown-content li {
              margin-bottom: 0.5rem;
            }
            .markdown-content strong {
              font-weight: 600;
              color: #111827;
            }
            .markdown-content code {
              background-color: #f3f4f6;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              font-family: 'Courier New', monospace;
            }
            .markdown-content pre {
              background-color: #1f2937;
              color: #f9fafb;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin-bottom: 1rem;
            }
            .markdown-content pre code {
              background-color: transparent;
              padding: 0;
              color: inherit;
            }
            .markdown-content a {
              color: #2563eb;
              text-decoration: none;
            }
            .markdown-content a:hover {
              text-decoration: underline;
            }
            .markdown-content hr {
              border: none;
              border-top: 1px solid #e5e7eb;
              margin: 2rem 0;
            }
            .markdown-content blockquote {
              border-left: 4px solid #d1d5db;
              padding-left: 1rem;
              margin-left: 0;
              font-style: italic;
              color: #6b7280;
            }
          `}</style>
          <article className="markdown-content">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
