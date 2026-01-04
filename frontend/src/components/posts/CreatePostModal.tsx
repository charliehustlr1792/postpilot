// components/posts/CreatePostModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Calendar as CalendarIcon, Clock, Send, Smile } from 'lucide-react';
import { Platform } from '@/types/post';
import { PLATFORM_COLORS } from '@/lib/constants';
import { getCharacterLimit } from '@/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postData: any) => void;
  editPost?: any; // For editing existing posts
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSave, editPost }) => {
  const [content, setContent] = useState(editPost?.content || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(editPost?.platforms || ['twitter']);
  const [selectedDate, setSelectedDate] = useState(editPost?.scheduledAt || '');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [images, setImages] = useState<string[]>(editPost?.images || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const platforms: { id: Platform; name: string }[] = [
    { id: 'twitter', name: 'Twitter' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'pinterest', name: 'Pinterest' },
  ];

  const commonEmojis = ['😊', '🎉', '🚀', '💡', '✨', '👍', '❤️', '🔥', '💪', '🌟', '📱', '💼'];

  if (!isOpen) return null;

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const getMaxCharacters = () => {
    if (selectedPlatforms.length === 0) return 280;
    return Math.min(...selectedPlatforms.map(p => getCharacterLimit(p)));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Mock image upload - in real app, upload to cloud storage
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const postData = {
      content,
      platforms: selectedPlatforms,
      scheduledAt: selectedDate ? new Date(`${selectedDate}T${selectedTime}`) : null,
      images,
    };
    onSave(postData);
  };

  const maxChars = getMaxCharacters();
  const charsRemaining = maxChars - content.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAE7E4]">
          <div>
            <h2 className="text-xl font-bold text-[#181817]">
              {editPost ? 'Edit Post' : 'Create New Post'}
            </h2>
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
          {/* Platform Selection */}
          <div>
            <label className="block text-[#181817] font-semibold text-sm mb-3">
              Select Platforms
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-[#FF9B4F] bg-[#FF9B4F]/5'
                      : 'border-[#EAE7E4] hover:border-[#FFD4B2]'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: PLATFORM_COLORS[platform.id] }}
                  >
                    {/* {PLATFORM_ICONS[platform.id]} */}
                  </div>
                  <span className="text-sm font-medium text-[#181817]">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
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
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#EAE7E4] rounded-xl cursor-pointer hover:border-[#FF9B4F] hover:bg-[#F3EFEC]/50 transition-all">
                <ImageIcon className="w-10 h-10 text-[#4D4946]/40 mb-3" />
                <span className="text-[#4D4946] text-sm font-medium">
                  Click to upload images
                </span>
                <span className="text-[#4D4946]/60 text-xs mt-1">
                  PNG, JPG up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
              onClick={() => {
                // Save as draft
                handleSave();
              }}
              disabled={!content.trim() || selectedPlatforms.length === 0}
              className="px-6 py-2.5 bg-white border-2 border-[#EAE7E4] text-[#4D4946] font-semibold rounded-lg hover:border-[#FF9B4F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || selectedPlatforms.length === 0 || isOverLimit}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {selectedDate ? 'Schedule Post' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;