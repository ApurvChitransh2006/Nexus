import React from 'react';

export default function TypingIndicator({ username }) {
  if (!username) return null;
  return (
    <div className="self-start flex flex-col items-start mt-3 animate-fade-up">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-elevated border border-border-soft rounded-2xl rounded-bl-sm">
        <span className="w-2 h-2 rounded-full bg-electric animate-typing-1" />
        <span className="w-2 h-2 rounded-full bg-electric animate-typing-2" />
        <span className="w-2 h-2 rounded-full bg-electric animate-typing-3" />
      </div>
      <span className="text-2xs text-text-muted mt-1 ml-1 italic">{username} is typing...</span>
    </div>
  );
}
