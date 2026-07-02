/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Main application — now fully profile-driven.
 * Supports multiple target languages (L2) and L1-aware smart recommendations.
 * All language-specific behavior is delegated to LanguageProfile,
 * so the UI code is language-agnostic.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2, CheckCircle2, XCircle, RefreshCw, Trophy, Keyboard,
  ArrowRight, ChevronDown, Headphones, Pencil, Globe, Settings,
  AlertTriangle,
} from 'lucide-react';
import { TrainingView } from './components/TrainingView';
import { PhoneticKeypad } from './components/PhoneticKeypad';
import { SmartRecommend } from './components/SmartRecommend';
import { OnboardingView } from './components/OnboardingView';
import type { Difficulty, JudgeResult, LanguageProfile } from './types';
import { getProfile, SUPPORTED_L1 } from './profiles';
import { getPhonemeStats } from './utils/phonemeGroups';
import { refreshSession, type SessionState, type TrainingConfig } from './utils/trainingSession';
import { getVoicesForLang, selectBestVoice, saveVoicePreference } from './utils/voice';

// ── LocalStorage keys ──────────────────────────────────────────

const LS_L1 = 'ipa-spelling-l1';
const LS_L2 = 'ipa-spelling-l2';

function loadL1(): string | null {
  try { return localStorage.getItem(LS_L1); } catch { return null; }
}
function loadL2(): string | null {
  try { return localStorage.getItem(LS_L2); } catch { return null; }
}
function saveLanguagePreferences(l1: string | null, l2: string) {
  try {
    localStorage.setItem(LS_L2, l2);
    if (l1) {
      localStorage.setItem(LS_L1, l1);
    } else {
      localStorage.removeItem(LS_L1);
    }
  } catch { /* ignore */ }
}

function isTextEntryTarget(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable
    || target.tagName === 'INPUT'
    || target.tagName === 'SELECT'
    || target.tagName === 'TEXTAREA';
}

interface SpeechIssue {
  title: string;
  detail: string;
  diagnostics: string[];
}

function getUserAgentSummary(): string {
  const ua = navigator.userAgent;
  if (/MicroMessenger/i.test(ua)) return 'WeChat WebView';
  if (/QQ\//i.test(ua)) return 'QQ WebView';
  if (/FBAN|FBAV|Instagram|Line\//i.test(ua)) return 'In-app WebView';
  if (/CriOS/i.test(ua)) return 'Chrome on iOS';
  if (/FxiOS/i.test(ua)) return 'Firefox on iOS';
  if (/EdgiOS/i.test(ua)) return 'Edge on iOS';
  if (/iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua)) return 'Safari on iOS';
  if (/Android/i.test(ua) && /SamsungBrowser/i.test(ua)) return 'Samsung Internet on Android';
  if (/Android/i.test(ua) && /Chrome/i.test(ua)) return 'Chrome on Android';
  if (/Android/i.test(ua) && /Firefox/i.test(ua)) return 'Firefox on Android';
  return 'Unknown browser';
}

function buildSpeechDiagnostics(profile: LanguageProfile, voices: SpeechSynthesisVoice[]): string[] {
  const synth = window.speechSynthesis;
  const targetLangPrefix = profile.ttsLang.split('-')[0];
  const matchingVoices = voices.filter(v => v.lang.startsWith(targetLangPrefix));

  return [
    `Browser: ${getUserAgentSummary()}`,
    `speechSynthesis: ${synth ? 'available' : 'missing'}`,
    `target language: ${profile.ttsLang}`,
    `loaded voices: ${voices.length}`,
    `matching voices: ${matchingVoices.length}`,
    `userAgent: ${navigator.userAgent}`,
  ];
}

// ── App ─────────────────────────────────────────────────────────

export default function App() {
  // ── L1 / L2 state ────────────────────────────────────────────
  const [l1, setL1] = useState<string | null>(loadL1());
  const [l2, setL2] = useState<string | null>(loadL2());
  const [showOnboarding, setShowOnboarding] = useState(!loadL2());

  const profile: LanguageProfile | undefined = l2 ? getProfile(l2) : undefined;
  const effectiveL1 = profile && l1 === profile.code ? null : l1;

  // ── Training state ────────────────────────────────────────────
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [items, setItems] = useState<SessionState['items']>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'neutral'>('neutral');
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);
  const [selectedPhoneme, setSelectedPhoneme] = useState<string | null>(null);
  const [mode, setMode] = useState<'spelling' | 'training'>('spelling');
  const [wordCount, setWordCount] = useState(10);
  const topicSelectRef = useRef<HTMLSelectElement | null>(null);

  // ── Voice management ──────────────────────────────────────────
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechIssue, setSpeechIssue] = useState<SpeechIssue | null>(null);

  // ── Phoneme stats (profile-driven) ────────────────────────────
  const phonemeStats = useMemo(
    () => profile ? getPhonemeStats(profile) : [],
    [profile],
  );

  const applySession = (session: SessionState) => {
    setItems(session.items);
    setCurrentIndex(session.currentIndex);
    setScore(session.score);
    setFeedback(session.feedback);
    setUserInput(session.userInput);
    setJudgeResult(null);
  };

  type SessionOverrides = Partial<Omit<TrainingConfig, 'profile'>>;

  const startFreshSession = useCallback((overrides: SessionOverrides = {}) => {
    if (!profile) return;

    const session = refreshSession({
      profile,
      difficulty: overrides.difficulty ?? difficulty,
      phoneme: overrides.phoneme ?? selectedPhoneme,
      wordCount: overrides.wordCount ?? wordCount,
      mode: overrides.mode ?? mode,
    });

    applySession(session);
  }, [profile, difficulty, selectedPhoneme, wordCount, mode]);

  // ── Initialize word set when profile changes ─────────────────
  useEffect(() => {
    startFreshSession();
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load voices for current language ──────────────────────────
  useEffect(() => {
    if (!profile) return;

    const loadVoices = () => {
      const available = getVoicesForLang(profile.ttsLang);
      setVoices(available);
      if (available.length > 0) {
        const best = selectBestVoice(available, profile.ttsLang);
        if (best) setSelectedVoice(best);
      } else {
        setSelectedVoice(null);
      }
    };

    loadVoices();
    const synth = window.speechSynthesis;
    if (synth) {
      synth.addEventListener('voiceschanged', loadVoices);
    }
    return () => {
      if (synth) synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, [profile]);

  // ── Callbacks ─────────────────────────────────────────────────

  const handleOnboardingComplete = (newL1: string | null, newL2: string) => {
    const safeL1 = newL1 === newL2 ? null : newL1;
    const languageChanged = newL2 !== l2;

    setL1(safeL1);
    setL2(newL2);
    saveLanguagePreferences(safeL1, newL2);
    if (languageChanged) {
      setSelectedPhoneme(null);
    }
    setShowOnboarding(false);
  };

  const handleVoiceChange = (voiceURI: string) => {
    if (!profile) return;
    const voice = voices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      setSelectedVoice(voice);
      saveVoicePreference(voice, profile.ttsLang);
    }
  };

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    startFreshSession({ difficulty: d });
  };

  const newWordSet = () => {
    startFreshSession();
  };

  const handlePhonemeChange = (phoneme: string | null) => {
    setSelectedPhoneme(phoneme);
    startFreshSession({ phoneme });
  };

  const handleSmartPhonemeSelect = (phoneme: string) => {
    setSelectedPhoneme(phoneme);
    setMode('spelling');
    startFreshSession({ phoneme, mode: 'spelling' });
  };

  const handleModeChange = (nextMode: 'spelling' | 'training') => {
    setMode(nextMode);
    startFreshSession({ mode: nextMode });
  };

  const handleWordCountChange = (value: string) => {
    const nextWordCount = Math.max(1, Math.min(50, parseInt(value) || 1));
    setWordCount(nextWordCount);
    startFreshSession({ wordCount: nextWordCount });
  };

  const currentItem = items[currentIndex];

  const playAudio = useCallback(() => {
    if (!currentItem || !profile || isPlaying) return;

    const synth = window.speechSynthesis;
    if (!synth) {
      setSpeechIssue({
        title: '当前浏览器暂时不能播放语音',
        detail: '请尝试用 Safari、Chrome 或 Samsung Internet 直接打开网页，避免微信、QQ、飞书等应用内浏览器。',
        diagnostics: buildSpeechDiagnostics(profile, voices),
      });
      return;
    }

    setSpeechIssue(null);
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(currentItem.display);
    utterance.lang = profile.ttsLang;
    utterance.rate = 0.9;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setSpeechIssue(null);
      setIsPlaying(true);
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      setIsPlaying(false);
      setSpeechIssue({
        title: '语音播放失败',
        detail: `浏览器返回了 ${event.error || 'unknown'}。请确认系统文字转语音已启用，并尝试换用 Safari/Chrome 后重新点击播放。`,
        diagnostics: buildSpeechDiagnostics(profile, voices),
      });
    };

    synth.speak(utterance);
  }, [currentItem, profile, isPlaying, selectedVoice, voices]);

  const handleCharInsert = (char: string) => {
    if (feedback !== 'neutral') return;
    setUserInput(prev => prev + char);
  };

  const handleDelete = () => {
    if (feedback !== 'neutral') return;
    setUserInput(prev => prev.slice(0, -1));
  };

  const checkAnswer = () => {
    if (!currentItem || !profile || feedback !== 'neutral') return;

    const result = profile.judge(userInput, currentItem.pronunciation);
    setJudgeResult(result);

    if (result.correct) {
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else if (result.nearMatch) {
      // Near match: count as correct but show hint
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      setFeedback('incorrect');
    }
  };

  const nextWord = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback('neutral');
      setJudgeResult(null);
    } else {
      const msg = `本轮结束！得分: ${score + (feedback === 'correct' ? 0 : 0)}/${items.length}`;
      alert(msg);
      newWordSet();
    }
  };

  const nextTrainingWord = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert('本轮训练结束！');
      newWordSet();
    }
  };

  const prevTrainingWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (!profile || showOnboarding || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = isTextEntryTarget(e.target);
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;

      if (hasModifier) return;

      if (isTyping) {
        if (mode === 'spelling' && e.key === 'Enter') {
          e.preventDefault();
          if (feedback === 'neutral' && userInput.trim()) {
            checkAnswer();
          } else if (feedback !== 'neutral') {
            nextWord();
          }
        }
        if (mode === 'spelling' && e.key === 'Escape' && feedback === 'neutral') {
          e.preventDefault();
          setUserInput('');
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        playAudio();
        return;
      }

      if (mode === 'spelling' && e.code === 'Enter') {
        e.preventDefault();
        if (feedback === 'neutral' && userInput.trim()) {
          checkAnswer();
        } else if (feedback !== 'neutral') {
          nextWord();
        }
        return;
      }

      if (mode === 'spelling' && e.code === 'Backspace' && feedback === 'neutral') {
        e.preventDefault();
        handleDelete();
        return;
      }

      if (mode === 'spelling' && e.code === 'Escape' && feedback === 'neutral') {
        e.preventDefault();
        setUserInput('');
        return;
      }

      if (mode === 'training' && e.code === 'ArrowRight') {
        e.preventDefault();
        nextTrainingWord();
        return;
      }

      if (mode === 'training' && e.code === 'ArrowLeft') {
        e.preventDefault();
        prevTrainingWord();
        return;
      }

      if (e.code === 'KeyN') {
        e.preventDefault();
        newWordSet();
        return;
      }

      if (e.code === 'Digit1') {
        e.preventDefault();
        changeDifficulty('basic');
        return;
      }

      if (e.code === 'Digit2') {
        e.preventDefault();
        changeDifficulty('intermediate');
        return;
      }

      if (e.code === 'Digit3') {
        e.preventDefault();
        changeDifficulty('advanced');
        return;
      }

      if (e.code === 'KeyS') {
        e.preventDefault();
        handleModeChange('spelling');
        return;
      }

      if (e.code === 'KeyT') {
        e.preventDefault();
        handleModeChange('training');
        return;
      }

      if (mode === 'spelling' && e.code === 'KeyK') {
        e.preventDefault();
        setShowKeypad(prev => !prev);
        return;
      }

      if (e.code === 'Slash') {
        e.preventDefault();
        topicSelectRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    profile,
    showOnboarding,
    items.length,
    mode,
    feedback,
    userInput,
    playAudio,
    currentIndex,
    difficulty,
    selectedPhoneme,
    wordCount,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────

  // Onboarding screen
  if (showOnboarding || !profile) {
    return (
      <OnboardingView
        currentL1={l1}
        currentL2={l2}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Empty word set
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans tracking-tight">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <RefreshCw className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-slate-600 font-medium text-sm">该音素在当前难度下没有匹配单词</p>
          <button
            onClick={() => handlePhonemeChange(null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            显示全部单词
          </button>
        </div>
      </div>
    );
  }

  // L1 label for header
  const l1Label = effectiveL1
    ? (SUPPORTED_L1.find(l => l.code === effectiveL1)?.label ?? effectiveL1)
    : '直接训练';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-12 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <span className="text-white font-bold text-lg">/ə/</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PhoneticMaster</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {profile.displayName} {profile.notationName} Training
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* L1 / L2 Indicator */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {l1Label} → {profile.displayName}
            </span>
            <button
              onClick={() => setShowOnboarding(true)}
              className="ml-1 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="更改语言设置"
            >
              <Settings className="w-3 h-3 text-slate-300" />
            </button>
          </div>

          <div className="h-10 w-px bg-slate-100"></div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => handleModeChange('spelling')}
              title="拼写模式 (S)"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                mode === 'spelling'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Pencil className="w-3 h-3" />
              拼写
            </button>
            <button
              onClick={() => handleModeChange('training')}
              title="训练模式 (T)"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                mode === 'training'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Headphones className="w-3 h-3" />
              训练
            </button>
          </div>

          <div className="h-10 w-px bg-slate-100"></div>

          {/* Voice Selector */}
          {voices.length > 0 && (
            <>
              <div className="relative flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Voice</span>
                <div className="relative">
                  <select
                    value={selectedVoice?.voiceURI || ''}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="appearance-none bg-slate-100 border-none rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] text-slate-600 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {voices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="h-10 w-px bg-slate-100"></div>
            </>
          )}

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['basic', 'intermediate', 'advanced'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => changeDifficulty(d)}
                title={`${d === 'basic' ? '基础' : d === 'intermediate' ? '进阶' : '挑战'} (${d === 'basic' ? '1' : d === 'intermediate' ? '2' : '3'})`}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  difficulty === d
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {d === 'basic' ? '基础' : d === 'intermediate' ? '进阶' : '挑战'}
              </button>
            ))}
          </div>

          <div className="h-10 w-px bg-slate-100"></div>

          {/* Phoneme Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Topic</span>
            <div className="relative">
              <select
                ref={topicSelectRef}
                value={selectedPhoneme ?? ''}
                onChange={(e) => handlePhonemeChange(e.target.value || null)}
                title="选择训练主题 (/)"
                className="appearance-none bg-slate-100 border-none rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] text-slate-600 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 max-w-[140px]"
              >
                <option value="">
                  All ({profile.wordBank.basic.length + profile.wordBank.intermediate.length + profile.wordBank.advanced.length})
                </option>
                {phonemeStats.map(({ phoneme, count }) => (
                  <option key={phoneme} value={phoneme}>
                    {profile.notationName === 'Pinyin' ? phoneme : `/${phoneme}/`} ({count})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="h-10 w-px bg-slate-100"></div>

          {/* Word Count */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Words</span>
            <input
              type="number"
              min={1}
              max={50}
              value={wordCount}
              onChange={(e) => handleWordCountChange(e.target.value)}
              className="w-12 bg-slate-100 border-none rounded-lg px-1.5 py-1 text-[11px] text-slate-600 font-medium text-center focus:outline-none focus:ring-2 focus:ring-indigo-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="h-10 w-px bg-slate-100"></div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">Progress</span>
            <div className="flex gap-1">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-1.5 rounded-full transition-colors ${i <= currentIndex ? 'bg-indigo-600' : 'bg-indigo-100'}`}
                />
              ))}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          {mode === 'spelling' && (
            <div className="text-right">
              <div className="text-sm font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Score: {score}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Accuracy: {items.length > 0 ? Math.round((score / (currentIndex || 1)) * 100) : 0}%
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex gap-8 p-8 overflow-y-auto">
        {/* Left: Smart Recommendations (sidebar) */}
        {effectiveL1 && (
          <aside className="w-72 shrink-0">
            <SmartRecommend
              l1={effectiveL1}
              l2={profile.code}
              profile={profile}
              onSelectPhoneme={handleSmartPhonemeSelect}
            />
          </aside>
        )}

        {/* Center: Training / Spelling */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence>
            {speechIssue && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full max-w-3xl mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-bold">{speechIssue.title}</h2>
                        <p className="mt-1 text-xs leading-5 text-amber-800">{speechIssue.detail}</p>
                      </div>
                      <button
                        onClick={() => setSpeechIssue(null)}
                        className="text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-700 transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                    <details className="mt-3 text-[11px] text-amber-700">
                      <summary className="cursor-pointer font-bold uppercase tracking-widest">诊断信息</summary>
                      <pre className="mt-2 whitespace-pre-wrap break-words font-mono leading-5">
                        {speechIssue.diagnostics.join('\n')}
                      </pre>
                    </details>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {mode === 'training' ? (
            <TrainingView
              items={items}
              currentIndex={currentIndex}
              profile={profile}
              onPrev={prevTrainingWord}
              onNext={nextTrainingWord}
              onPlayAudio={playAudio}
              isPlaying={isPlaying}
              onNewWordSet={newWordSet}
            />
          ) : (
            <div className="w-full max-w-3xl space-y-10">
              {/* Challenge Card */}
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-12 flex flex-col items-center gap-10">

                  {/* Audio Prompt */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={playAudio}
                      disabled={isPlaying}
                      title="播放发音 (Space)"
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isPlaying ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-50 text-indigo-600 hover:bg-white shadow-sm border border-indigo-100'
                      }`}
                    >
                      {isPlaying ? (
                        <div className="flex gap-1 items-end h-8">
                          {[1, 2, 3, 2, 1].map((h, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 bg-indigo-600 rounded-full"
                              animate={{ height: ['20%', '100%', '20%'] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Volume2 className="w-10 h-10" />
                      )}
                    </motion.button>
                    <div>
                      <h2 className="text-2xl font-light text-slate-400">
                        {profile.notationName === 'Pinyin' ? '点击听发音' : 'Click to hear the word'}
                      </h2>
                      {feedback !== 'neutral' && (
                        <p className="mt-2 text-slate-800 font-mono text-lg">
                          <span className={feedback === 'correct' ? 'text-green-600' : 'text-red-600'}>
                            {feedback === 'correct' ? '✓ ' : '✗ '}
                          </span>
                          {profile.notationName === 'Pinyin' ? '词语: ' : 'Word: '}
                          <span className="font-bold underline decoration-indigo-200 uppercase tracking-widest">
                            {currentItem?.display}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transcription Input */}
                  <div className="w-full relative px-12">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => {
                        if (feedback !== 'neutral') return;
                        setUserInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && feedback === 'neutral' && userInput.trim()) {
                          checkAnswer();
                        } else if (e.key === 'Enter' && feedback !== 'neutral') {
                          nextWord();
                        }
                      }}
                      placeholder={
                        profile.notationName === 'Pinyin'
                          ? '输入拼音 (如 ni3 hao3)...'
                          : 'Enter IPA symbols...'
                      }
                      className={`${
                        profile.notationName === 'Pinyin' ? '' : 'ipa-text'
                      } w-full text-center text-5xl font-light py-8 border-b-2 focus:outline-none transition-colors placeholder:text-slate-100 ${
                        feedback === 'correct' ? 'border-green-500 text-green-600' :
                        feedback === 'incorrect' ? 'border-red-500 text-red-600' :
                        'border-slate-200 focus:border-indigo-600 text-slate-800'
                      }`}
                      disabled={feedback !== 'neutral'}
                    />

                    <AnimatePresence>
                      {feedback !== 'neutral' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -top-10 left-0 right-0 flex justify-center"
                        >
                          {feedback === 'correct' ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-5 py-2 rounded-full text-xs font-bold border border-green-100 uppercase tracking-widest">
                              <CheckCircle2 className="w-4 h-4" />
                              {judgeResult?.nearMatch ? 'Almost Correct' : "That's Correct"}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-5 py-2 rounded-full text-xs font-bold border border-red-100 uppercase tracking-widest">
                              <XCircle className="w-4 h-4" />
                              Correct:{' '}
                              <span className={profile.notationName === 'Pinyin' ? '' : 'ipa-text'}>
                                {profile.notationName === 'Pinyin'
                                  ? (currentItem?.pronunciationAlt || currentItem?.pronunciation)
                                  : `/${currentItem?.pronunciation}/`
                                }
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Lower Controls: Keypad */}
                  <div className="w-full max-w-lg">
                    <AnimatePresence>
                      {showKeypad && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pb-4"
                        >
                          <PhoneticKeypad profile={profile} onInsert={handleCharInsert} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Footer Action Bar */}
                <footer className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setShowKeypad(!showKeypad)}
                    title={showKeypad ? '隐藏键盘 (K)' : '显示键盘 (K)'}
                    className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    <Keyboard className="w-5 h-5 flex-shrink-0" />
                    {showKeypad ? 'Hide Keypad' : 'Show Keypad'}
                  </button>

                  <div className="flex gap-4">
                    {feedback === 'neutral' ? (
                      <>
                        <button
                          onClick={handleDelete}
                          title="删除最后一个字符 (Backspace)"
                          className="px-8 py-3 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          onClick={checkAnswer}
                          disabled={!userInput.trim()}
                          title="提交答案 (Enter)"
                          className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:shadow-none uppercase text-xs tracking-widest cursor-pointer"
                        >
                          Check Answer
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={nextWord}
                        title="下一题 (Enter)"
                        className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest cursor-pointer"
                      >
                        {currentIndex < items.length - 1 ? 'Next Challenge' : 'Complete Session'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </footer>
              </div>

              <div className="flex justify-between items-center px-4">
                <button
                  onClick={newWordSet}
                  title="换一组题 (N)"
                  className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  New Word Set
                </button>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                  {profile.notationName} Practice • {currentIndex + 1} / {items.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
