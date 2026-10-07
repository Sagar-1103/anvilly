"use client";

interface UserMessageBubbleProps {
  content: string;
}

export default function UserMessageBubble({ content }: UserMessageBubbleProps) {
  return (
    <div className="flex justify-end my-1 w-full">
      <div className="bg-[#313136] hover:bg-[#38383e] border border-white/[0.08] text-white px-3.5 py-2 rounded-2xl max-w-[85%] text-[13px] whitespace-pre-wrap leading-relaxed shadow-sm transition-colors">
        {content}
      </div>
    </div>
  );
}
