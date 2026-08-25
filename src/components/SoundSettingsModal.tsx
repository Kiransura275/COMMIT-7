import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, Upload, Play, Square, Check, Bell, Clock, Music, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { SoundSettings } from '../types';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundType: 'notification' | 'alarm';
  soundSettings: SoundSettings;
  onSave: (settings: Partial<SoundSettings>) => void;
}

export function SoundSettingsModal({
  isOpen,
  onClose,
  soundType,
  soundSettings,
  onSave,
}: SoundSettingsModalProps) {
  const isAlarm = soundType === 'alarm';

  const [selectedType, setSelectedType] = useState<'default' | 'custom'>(
    isAlarm ? soundSettings.alarmType : soundSettings.notificationType
  );
  const [customUrl, setCustomUrl] = useState<string>(
    isAlarm ? soundSettings.alarmCustomUrl || '' : soundSettings.notificationCustomUrl || ''
  );
  const [customName, setCustomName] = useState<string>(
    isAlarm ? soundSettings.alarmCustomName || '' : soundSettings.notificationCustomName || ''
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(isAlarm ? soundSettings.alarmType : soundSettings.notificationType);
      setCustomUrl(
        isAlarm ? soundSettings.alarmCustomUrl || '' : soundSettings.notificationCustomUrl || ''
      );
      setCustomName(
        isAlarm ? soundSettings.alarmCustomName || '' : soundSettings.notificationCustomName || ''
      );
      setIsPlaying(false);
    }
  }, [isOpen, isAlarm, soundSettings]);

  if (!isOpen) return null;

  const handleStopPreview = () => {
    if (isAlarm) {
      soundManager.stopAlarm();
    } else {
      soundManager.stopNotification();
    }
    setIsPlaying(false);
  };

  const handlePlayPreview = (type: 'default' | 'custom') => {
    handleStopPreview();
    setIsPlaying(true);

    if (isAlarm) {
      const urlToPlay = type === 'custom' ? customUrl : undefined;
      soundManager.playAlarmSound(urlToPlay, () => {
        setIsPlaying(false);
      });
    } else {
      const urlToPlay = type === 'custom' ? customUrl : undefined;
      soundManager.playNotificationSound(urlToPlay, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert('Please select a valid audio file (MP3, WAV, AAC, OGG, etc.).');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert('Audio file is too large. Please choose a file smaller than 8MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomUrl(result);
          setCustomName(file.name);
          setSelectedType('custom');
          // Preview custom upload
          handleStopPreview();
          setIsPlaying(true);
          if (isAlarm) {
            soundManager.playAlarmSound(result, () => setIsPlaying(false));
          } else {
            soundManager.playNotificationSound(result, () => setIsPlaying(false));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    handleStopPreview();
    if (isAlarm) {
      onSave({
        alarmType: selectedType,
        alarmCustomUrl: selectedType === 'custom' ? customUrl : '',
        alarmCustomName: selectedType === 'custom' ? customName : '',
      });
    } else {
      onSave({
        notificationType: selectedType,
        notificationCustomUrl: selectedType === 'custom' ? customUrl : '',
        notificationCustomName: selectedType === 'custom' ? customName : '',
      });
    }
    soundManager.playPop();
    onClose();
  };

  const handleClose = () => {
    handleStopPreview();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isAlarm
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isAlarm ? <Clock className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {isAlarm ? 'Alarm Sound' : 'Notification Sound'}
              </h2>
              <p className="text-xs text-zinc-500">
                {isAlarm
                  ? 'Rings for 30s (loops if shorter) until OK tapped'
                  : 'Plays for 1–5 seconds (max 5s, no repeat)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-5">
          {/* Option 1: Default Embedded Sound */}
          <div
            onClick={() => setSelectedType('default')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedType === 'default'
                ? isAlarm
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-2xs'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-2xs'
                : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedType === 'default'
                      ? isAlarm
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-zinc-400 dark:border-zinc-600'
                  }`}
                >
                  {selectedType === 'default' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Default {isAlarm ? 'Alarm Sound' : 'Notification Chime'}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {isAlarm
                      ? 'Synthesizer chime loop (30s)'
                      : 'Crisp synthesizer notification ping'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPlaying && selectedType === 'default') {
                    handleStopPreview();
                  } else {
                    setSelectedType('default');
                    handlePlayPreview('default');
                  }
                }}
                className={`p-2 rounded-xl flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                  isPlaying && selectedType === 'default'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : isAlarm
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                }`}
                title={isPlaying && selectedType === 'default' ? 'Stop' : 'Play Preview'}
              >
                {isPlaying && selectedType === 'default' ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Add from Device */}
          <div
            onClick={() => {
              if (customUrl) setSelectedType('custom');
              else fileInputRef.current?.click();
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedType === 'custom'
                ? isAlarm
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-2xs'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-2xs'
                : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedType === 'custom'
                      ? isAlarm
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-zinc-400 dark:border-zinc-600'
                  }`}
                >
                  {selectedType === 'custom' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>Add from Device</span>
                    {customName && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md truncate max-w-[140px]">
                        {customName}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {customUrl ? 'Custom audio file loaded' : 'Choose MP3 / WAV / OGG from phone or PC'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {customUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying && selectedType === 'custom') {
                        handleStopPreview();
                      } else {
                        setSelectedType('custom');
                        handlePlayPreview('custom');
                      }
                    }}
                    className={`p-2 rounded-xl flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      isPlaying && selectedType === 'custom'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : isAlarm
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                    }`}
                    title={isPlaying && selectedType === 'custom' ? 'Stop' : 'Play Preview'}
                  >
                    {isPlaying && selectedType === 'custom' ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Test</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Select File"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{customUrl ? 'Change' : 'Upload'}</span>
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Note on Duration Rules */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 mb-5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {isAlarm ? (
              <span>
                <b>Alarm rules:</b> Plays for <b>30 seconds</b> (repeats automatically if under 30s). When triggered on timetable tasks or reminders, an <b>OK button</b> popup appears to turn off the alarm, or it turns off after 30s.
              </span>
            ) : (
              <span>
                <b>Notification rules:</b> Plays for <b>1 to max 5 seconds</b> (if audio file exceeds 5s, it cuts at 5s, no repeat).
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-colors cursor-pointer ${
              isAlarm
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            Save Sound
          </button>
        </div>
      </div>
    </div>
  );
}
