import React from 'react';
import { Video, Phone, Info, Users } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function ChatHeader({ convo, currentUserId, onVideoCall }) {
  const otherUser   = convo.isGroup ? null : convo.participants.find(p => p._id !== currentUserId);
  const displayName = convo.isGroup ? convo.name : (otherUser?.username || 'Chat');
  const avatarSrc   = convo.isGroup ? null : otherUser?.imageUrl;
  const isOnline    = otherUser?.isOnline;
  const subLabel    = convo.isGroup
    ? `${convo.participants.length} members`
    : (isOnline ? 'Online' : `Offline`);

  return (
    <div className="flex items-center justify-between px-6 header-blur border-b border-border-faint flex-shrink-0 h-[66px]">
      {/* User info */}
      <div className="flex items-center gap-3">
        <Avatar
          src={avatarSrc}
          name={displayName}
          size="sm"
          isOnline={convo.isGroup ? undefined : isOnline}
        />
        <div>
          <p className="font-bold text-text-bright text-sm tracking-tight leading-tight">{displayName}</p>
          <p className={`text-xs font-medium leading-tight ${isOnline && !convo.isGroup ? 'text-emerald' : 'text-text-muted'}`}>
            {subLabel}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!convo.isGroup && (
          <button
            onClick={onVideoCall}
            title="Start Video Call"
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       bg-electric/10 border border-border-accent text-electric-400
                       hover:bg-electric hover:text-white hover:border-electric hover:shadow-glow-sm
                       transition-all duration-200"
          >
            <Video size={17} />
          </button>
        )}
        {convo.isGroup && (
          <button
            title="Group Members"
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       bg-overlay border border-border-soft text-text-muted
                       hover:bg-hover hover:text-text-primary hover:border-border-mid
                       transition-all duration-150"
          >
            <Users size={17} />
          </button>
        )}
        <button
          title="Conversation Info"
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     bg-overlay border border-border-soft text-text-muted
                     hover:bg-hover hover:text-text-primary hover:border-border-mid
                     transition-all duration-150"
        >
          <Info size={17} />
        </button>
      </div>
    </div>
  );
}
