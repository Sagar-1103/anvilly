"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AssistantMessageBubbleProps {
  content: string;
}

export default function AssistantMessageBubble({ content }: AssistantMessageBubbleProps) {
  return (
    <div className="flex justify-start w-full">
      <div className="bg-zinc-900/80 border border-white/6 text-zinc-300 px-4 py-3 rounded-2xl rounded-bl-md max-w-[95%] sm:max-w-[90%] text-[13px] leading-relaxed break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-300">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-zinc-100">{children}</strong>
            ),
            em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
            ul: ({ children }) => (
              <ul className="my-2 ml-4 list-disc space-y-1.5 text-zinc-300">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2 ml-4 list-decimal space-y-1.5 text-zinc-300">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
            h1: ({ children }) => (
              <h1 className="text-[15px] font-bold text-zinc-100 mt-3 mb-1.5 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-[14px] font-bold text-zinc-100 mt-3 mb-1.5 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[13.5px] font-semibold text-zinc-100 mt-2.5 mb-1 first:mt-0">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-[13px] font-semibold text-zinc-100 mt-2 mb-1 first:mt-0">
                {children}
              </h4>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-white/20 pl-3 my-2 text-zinc-400 italic">
                {children}
              </blockquote>
            ),
            code: ({ inline, className, children, ...props }: any) => {
              const isInline = inline || !className;
              if (isInline) {
                return (
                  <code
                    className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/8 text-zinc-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-2 rounded-lg bg-black/60 border border-white/8 p-3 overflow-x-auto">
                  <code className="font-mono text-[12px] text-zinc-200 block" {...props}>
                    {children}
                  </code>
                </div>
              );
            },
            hr: () => <hr className="my-3 border-white/8" />,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 underline decoration-zinc-500 hover:text-white transition-colors"
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
