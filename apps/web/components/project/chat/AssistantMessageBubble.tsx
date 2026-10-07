"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AssistantMessageBubbleProps {
  content: string;
}

export default function AssistantMessageBubble({ content }: AssistantMessageBubbleProps) {
  return (
    <div className="flex justify-start w-full my-1">
      <div className="bg-[#202024]/60 border border-white/[0.06] text-zinc-300 px-4 py-3.5 rounded-2xl max-w-full text-[13px] leading-[1.65] break-words shadow-xs">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2.5 last:mb-0 leading-[1.65] text-zinc-300">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
            ul: ({ children }) => (
              <ul className="my-2.5 ml-4 list-disc space-y-1.5 text-zinc-300 marker:text-zinc-500">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2.5 ml-4 list-decimal space-y-1.5 text-zinc-300 marker:text-zinc-500">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-[1.65] pl-0.5">{children}</li>,
            h1: ({ children }) => (
              <h1 className="text-[15.5px] font-semibold text-white mt-3.5 mb-2 first:mt-0 tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-[14.5px] font-semibold text-white mt-3 mb-1.5 first:mt-0 tracking-tight">
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
              <blockquote className="border-l-2 border-[#5856d6]/70 pl-3 my-2 text-zinc-400 italic">
                {children}
              </blockquote>
            ),
            code: ({ inline, className, children, ...props }: any) => {
              const isInline = inline || !className;
              if (isInline) {
                return (
                  <code
                    className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-[#2a2a30] border border-[#3b3b44] text-zinc-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-2.5 rounded-xl bg-[#141417] border border-[#2c2c34] p-3 overflow-x-auto">
                  <code className="font-mono text-[12px] text-zinc-200 block" {...props}>
                    {children}
                  </code>
                </div>
              );
            },
            hr: () => <hr className="my-3 border-white/[0.08]" />,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#818cf8] underline decoration-indigo-400/40 hover:text-indigo-300 transition-colors"
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
