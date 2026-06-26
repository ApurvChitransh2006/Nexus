import React from 'react';
import { MessageSquare, Zap } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-chat-mesh animate-fade-in">
      {/* Floating icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-aurora-violet rounded-full blur-2xl scale-150 opacity-70" />
        <div className="relative w-24 h-24 rounded-3xl bg-electric/10 border border-border-accent
                        flex items-center justify-center animate-float shadow-glow">
          <MessageSquare size={40} className="text-electric-400" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-text-bright tracking-tight mb-3 text-center">
        Your messages live here
      </h2>
      <p className="text-sm text-text-second text-center max-w-xs leading-relaxed">
        Search for a user in the sidebar to start a direct message, or create a group chat.
      </p>

      {/* Feature pills */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {['Real-time messaging', 'HD video calls', 'Group chats', 'Read receipts', 'Typing indicators'].map(f => (
          <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-electric/8 border border-border-accent text-electric-300">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
