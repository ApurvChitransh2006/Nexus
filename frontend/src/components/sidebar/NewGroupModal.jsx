import React, { useState } from 'react';
import { Users, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

/**
 * Proper group creation modal — replaces all prompt() / confirm() calls.
 */
export default function NewGroupModal({ isOpen, onClose, usersList, currentUserId, onCreate }) {
  const [groupName,   setGroupName]   = useState('');
  const [selected,    setSelected]    = useState(new Set());
  const [isCreating,  setIsCreating]  = useState(false);

  const toggle = (userId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.size < 2) return;
    setIsCreating(true);
    const participantIds = [currentUserId, ...Array.from(selected)];
    const convo = await onCreate(groupName.trim(), participantIds);
    setIsCreating(false);
    if (convo) {
      setGroupName('');
      setSelected(new Set());
      onClose?.();
    }
  };

  const canCreate = groupName.trim().length > 0 && selected.size >= 2;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat" maxWidth="max-w-md">
      <div className="px-6 pt-4 pb-6 flex flex-col gap-4">
        {/* Group name input */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Design Team, Study Group..."
            className="w-full px-4 py-3 rounded-xl bg-overlay border border-border-soft
                       text-text-primary text-sm outline-none caret-electric
                       focus:border-border-accent focus:shadow-glow-sm transition-all duration-150
                       placeholder-text-muted"
          />
        </div>

        {/* Members selector */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
            Add Members{selected.size > 0 && ` (${selected.size} selected)`}
          </label>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-border-faint divide-y divide-border-faint">
            {usersList.map(u => {
              const isSelected = selected.has(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggle(u._id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-100
                    ${isSelected ? 'bg-electric/10' : 'hover:bg-overlay'}`}
                >
                  <Avatar src={u.imageUrl} name={u.username} size="sm" isOnline={u.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{u.username}</p>
                    <p className="text-xs text-text-muted truncate">{u.email}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      transition-all duration-150
                      ${isSelected ? 'bg-electric border-electric' : 'border-border-mid'}`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selected.size < 2 && (
          <p className="text-xs text-text-muted text-center">Select at least 2 members to create a group</p>
        )}

        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={!canCreate}
          loading={isCreating}
          icon={<Users size={16} />}
          className="w-full justify-center"
        >
          Create Group
        </Button>
      </div>
    </Modal>
  );
}
