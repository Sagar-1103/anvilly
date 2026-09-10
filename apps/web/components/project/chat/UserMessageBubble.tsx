"use client";

interface UserMessageBubbleProps {
  content: string;
}

export default function UserMessageBubble({ content }: UserMessageBubbleProps) {
  return (
    <div className="flex justify-end">
      <div className="bg-white/[0.07] border border-white/6 text-zinc-200 px-4 py-2.5 rounded-2xl rounded-br-md max-w-[85%] text-[13px] whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}
