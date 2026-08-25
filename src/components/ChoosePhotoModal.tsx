import React, { useRef } from 'react';
import { X, Upload, Camera, Sparkles, Trash2, User } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ChoosePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  onSelectPhoto: (url: string) => void;
  soundEnabled: boolean;
}

const PRESET_AVATARS = [
  { id: 'avatar_lion', emoji: '🦁', label: 'Lion', bg: 'from-amber-400 to-orange-600' },
  { id: 'avatar_rocket', emoji: '🚀', label: 'Rocket', bg: 'from-blue-500 to-indigo-600' },
  { id: 'avatar_fox', emoji: '🦊', label: 'Fox', bg: 'from-orange-500 to-rose-600' },
  { id: 'avatar_flash', emoji: '⚡', label: 'Flash', bg: 'from-yellow-400 to-amber-600' },
  { id: 'avatar_target', emoji: '🎯', label: 'Focus', bg: 'from-emerald-400 to-teal-600' },
  { id: 'avatar_gem', emoji: '💎', label: 'Diamond', bg: 'from-cyan-400 to-blue-600' },
  { id: 'avatar_crown', emoji: '👑', label: 'Crown', bg: 'from-purple-500 to-fuchsia-600' },
  { id: 'avatar_sprout', emoji: '🌿', label: 'Sprout', bg: 'from-lime-500 to-emerald-600' },
  { id: 'avatar_owl', emoji: '🦉', label: 'Owl', bg: 'from-slate-500 to-zinc-700' },
  { id: 'avatar_trophy', emoji: '🏆', label: 'Trophy', bg: 'from-amber-500 to-yellow-600' },
];

export function ChoosePhotoModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSelectPhoto,
  soundEnabled,
}: ChoosePhotoModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please select an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onSelectPhoto(result);
          if (soundEnabled) soundManager.playPop();
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (presetEmoji: string, presetBg: string) => {
    // Encapsulate avatar as a formatted string preset:emoji|gradient
    const encoded = `preset:${presetEmoji}|${presetBg}`;
    onSelectPhoto(encoded);
    if (soundEnabled) soundManager.playPop();
    onClose();
  };

  const handleResetDefault = () => {
    onSelectPhoto('');
    if (soundEnabled) soundManager.playPop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Choose Profile Photo
              </h2>
              <p className="text-xs text-zinc-500">
                Upload from device or pick a styled avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Button */}
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Upload Photo from Device
          </button>
        </div>

        {/* Preset Avatars Gallery */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Avatar Presets
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {PRESET_AVATARS.map((preset) => {
              const encoded = `preset:${preset.emoji}|${preset.bg}`;
              const isSelected = currentAvatarUrl === encoded;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.emoji, preset.bg)}
                  className={`aspect-square rounded-2xl bg-gradient-to-tr ${preset.bg} flex flex-col items-center justify-center text-xl sm:text-2xl shadow-sm hover:scale-105 transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105'
                      : 'border-white/20'
                  }`}
                  title={preset.label}
                >
                  <span>{preset.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset to Default */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-xs font-semibold text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset to Default
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
