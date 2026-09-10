"use client";

interface AssistantMessageBubbleProps {
  content: string;
}

export default function AssistantMessageBubble({ content }: AssistantMessageBubbleProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-zinc-900/80 border border-white/6 text-zinc-300 px-4 py-3 rounded-2xl rounded-bl-md max-w-[90%] text-[13px] whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}
