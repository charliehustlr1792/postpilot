// components/posts/CreatePostModal.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { X, Image as ImageIcon, Calendar as CalendarIcon, Clock, Send, Smile, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Platform, Post } from '@/types/post';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { getCharacterLimit } from '@/lib/utils';
import { useAccounts } from '@/hooks/useAccounts';
import { api } from '@/lib/api';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { PostPreview } from '@/components/posts/PostPreview';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Called after a post is successfully created (and scheduled, if a date was set).
  onSave: (post: Post) => void;
  editPost?: { content?: string; images?: string[] };
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSave, editPost }) => {
  const { getToken } = useAuth();
  const { accounts, isLoading: accountsLoading, error: accountsError } = useAccounts();

  const [content, setContent] = useState(editPost?.content || '');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [images, setImages] = useState<string[]>(editPost?.images || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // The selected account to attribute a platform's preview to.
  const accountForPlatform = (platform: Platform) =>
    accounts.find((a) => selectedAccountIds.includes(a.id) && a.platform === platform);

  const commonEmojis = ['😊', '🎉', '🚀', '💡', '✨', '👍', '❤️', '🔥', '💪', '🌟', '📱', '💼'];

  if (!isOpen) return null;

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  // Character limit is the strictest among the platforms of the selected accounts.
  const selectedPlatforms: Platform[] = accounts
    .filter((a) => selectedAccountIds.includes(a.id))
    .map((a) => a.platform);

  const getMaxCharacters = () => {
    if (selectedPlatforms.length === 0) return 280;
    return Math.min(...selectedPlatforms.map((p) => getCharacterLimit(p)));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    // Reset the input so the same file can be re-selected after removal.
    e.target.value = '';

    setUploading(true);
    try {
      const token = await getToken();
      const uploaded = await Promise.all(selected.map((file) => api.uploadImage(file, token)));
      setImages((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const maxChars = getMaxCharacters();
  const charsRemaining = maxChars - content.length;
  const isOverLimit = charsRemaining < 0;

  const canSubmit = content.trim().length > 0 && selectedAccountIds.length > 0 && !isOverLimit && !saving && !uploading;

  const handleSubmit = async (mode: 'draft' | 'schedule') => {
    const scheduledAt =
      mode === 'schedule' && selectedDate
        ? new Date(`${selectedDate}T${selectedTime}`).toISOString()
        : undefined;

    if (mode === 'schedule' && scheduledAt && new Date(scheduledAt) <= new Date()) {
      toast.error('Scheduled time must be in the future.');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      const { post } = await api.createPost(
        { content, images, socialAccountIds: selectedAccountIds, scheduledAt },
        token,
      );

      // createPost already marks the targets SCHEDULED; this enqueues the jobs.
      if (scheduledAt) {
        await api.schedulePost(post.id, { scheduledAt }, token);
      }

      toast.success(scheduledAt ? 'Post scheduled' : 'Draft saved');
      onSave(post);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const hasAccounts = accounts.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAE7E4]">
          <div>
            <h2 className="text-xl font-bold text-[#181817]">Create New Post</h2>
            <p className="text-[#4D4946] text-sm mt-1">
              Share your content across multiple platforms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#4D4946]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Account Selection */}
          <div>
            <label className="block text-[#181817] font-semibold text-sm mb-3">
              Select Accounts
            </label>

            {accountsLoading ? (
              <div className="flex items-center gap-2 text-[#4D4946] text-sm p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your connected accounts...
              </div>
            ) : accountsError ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {accountsError}
              </div>
            ) : !hasAccounts ? (
              <div className="border-2 border-dashed border-[#EAE7E4] rounded-xl p-6 text-center">
                <p className="text-[#4D4946] text-sm mb-3">
                  You haven&apos;t connected any social accounts yet.
                </p>
                <Link
                  href="/accounts"
                  className="inline-block px-5 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Connect an account
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedAccountIds.includes(account.id)
                        ? 'border-[#FF9B4F] bg-[#FF9B4F]/5'
                        : 'border-[#EAE7E4] hover:border-[#FFD4B2]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: PLATFORM_COLORS[account.platform] }}
                    >
                      <PlatformIcon platform={account.platform} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-[#181817] truncate">
                        {PLATFORM_LABELS[account.platform]}
                      </span>
                      <span className="block text-xs text-[#4D4946]/70 truncate">
                        @{account.username}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#181817] font-semibold text-sm">
                Post Content
              </label>
              <span className={`text-sm font-medium ${
                isOverLimit ? 'text-red-600' : charsRemaining < 20 ? 'text-yellow-600' : 'text-[#4D4946]/60'
              }`}>
                {charsRemaining} characters
              </span>
            </div>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                className={`w-full p-4 border-2 rounded-xl text-[#181817] placeholder-[#4D4946]/40 focus:outline-none transition-colors resize-none ${
                  isOverLimit
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-[#EAE7E4] focus:border-[#FF9B4F]'
                }`}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute bottom-3 right-3 p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-[#4D4946]" />
              </button>
            </div>

            {/* Quick Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-2 p-3 bg-[#F3EFEC] rounded-xl flex flex-wrap gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setContent(content + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[#181817] font-semibold text-sm mb-3">
              Media (Optional)
            </label>
            <div className="space-y-3">
              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#EAE7E4] rounded-xl transition-all ${
                  uploading
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:border-[#FF9B4F] hover:bg-[#F3EFEC]/50'
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-[#FF6E00] mb-3 animate-spin" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#4D4946]/40 mb-3" />
                )}
                <span className="text-[#4D4946] text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                </span>
                <span className="text-[#4D4946]/60 text-xs mt-1">
                  PNG, JPG up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-[#181817] font-semibold text-sm mb-3">
              Schedule (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4D4946]/40" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#EAE7E4] rounded-xl text-[#181817] focus:outline-none focus:border-[#FF9B4F] transition-colors"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4D4946]/40" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#EAE7E4] rounded-xl text-[#181817] focus:outline-none focus:border-[#FF9B4F] transition-colors"
                />
              </div>
            </div>
            {selectedDate && (
              <p className="text-[#4D4946]/70 text-sm mt-2">
                Post will be published on {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}
              </p>
            )}
          </div>

          {/* Per-platform Preview */}
          {selectedPlatforms.length > 0 && content.trim().length > 0 && (
            <div>
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-2 text-[#181817] font-semibold text-sm mb-3"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide preview' : 'Preview per platform'}
              </button>
              {showPreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPlatforms.map((platform) => {
                    const account = accountForPlatform(platform);
                    return (
                      <div key={platform}>
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-white"
                            style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                          >
                            <PlatformIcon platform={platform} className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium text-[#4D4946]">
                            {PLATFORM_LABELS[platform]}
                          </span>
                        </div>
                        <PostPreview
                          platform={platform}
                          content={content}
                          images={images}
                          authorName={account?.displayName || account?.username}
                          authorHandle={account?.username}
                          avatarUrl={account?.profileImage}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#EAE7E4] bg-[#F3EFEC]/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[#4D4946] font-medium hover:bg-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-white border-2 border-[#EAE7E4] text-[#4D4946] font-semibold rounded-lg hover:border-[#FF9B4F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit('schedule')}
              disabled={!canSubmit || !selectedDate}
              title={!selectedDate ? 'Pick a date and time to schedule' : undefined}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Schedule Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
