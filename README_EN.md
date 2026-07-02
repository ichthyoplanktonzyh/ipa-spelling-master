# IPA Spelling Master — American English IPA Training

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-3178C6.svg)](https://www.typescriptlang.org)

An interactive training tool for learning American English IPA (International Phonetic Alphabet) with two modes: **Spelling Mode** (listen and transcribe) and **Training Mode** (targeted listening practice by phoneme). Uses browser-native speech synthesis for pronunciation, with a built-in IPA keyboard and instant feedback.

## Features

- **Dual Training Modes**: Spelling mode (listen & transcribe) + Training mode (see word + IPA, targeted listening by phoneme)
- **Phoneme-focused Listening**: 40 phoneme categories for targeted ear training on weak sounds, with Space key binding for replay
- **Listen & Transcribe**: Uses the browser Web Speech API to pronounce words, building a direct mapping between speech sounds and IPA symbols
- **Built-in IPA Keyboard**: Full American English IPA input keyboard (vowels / consonants / stress marks) — no external input methods or symbol memorization needed
- **Three Difficulty Levels**: Basic / Intermediate / Advanced, graded by COCA word frequency
- **Smart Voice Selection**: Automatically picks the highest-quality English voice available (Samantha on macOS, Google US English on Chrome), with manual override
- **Instant Feedback**: Immediate correct/incorrect judgement with the correct IPA and word shown after each answer
- **Zero Dependencies**: No external APIs, no backend, no API keys required

## Prerequisites

- **Node.js** >= 18
- **Browser**: Latest Chrome / Edge / Safari / Firefox (Web Speech API support required)

## Setup & Usage

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ichthyoplanktonzyh/ipa-spelling-master.git
cd ipa-spelling-master

# 2. Install dependencies
npm install

# 3. Start the dev server (default: http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Build to dist/
npm run build

# Preview the production build locally
npm run preview
```

The build output is pure static files (`dist/` directory), deployable to any static hosting service.

## User Guide

### Mode Switching

Toggle between modes using the "拼写 / 训练" (Spelling / Training) buttons in the header:

- **Spelling Mode**: Traditional listen-and-transcribe practice — hear a word, type its IPA transcription
- **Training Mode**: Targeted phoneme listening — see the word and IPA while focusing on sound recognition

### Spelling Mode Workflow

1. **Choose Difficulty**: Click "基础 / 进阶 / 挑战" in the header to switch levels. Each switch resets the quiz with new words.
2. **Listen**: Click the circular speaker button 🔊 to hear the current word pronounced in American English (repeatable).
3. **Transcribe**: Use the IPA keypad below to click symbols and build your transcription, or type directly into the input field.
4. **Check**: Click "Check Answer" — your input is compared against the standard American IPA transcription.
5. **Review**: The current word is always shown. Incorrect answers display the correct American IPA for comparison.
6. **Next**: Click "Next Challenge" to proceed through all 10 words in the round.
7. **Refresh**: Click "New Word Set" at the bottom to draw 10 new random words.

### Training Mode Workflow

1. **Switch Mode**: Click the "训练" (Training) button in the header.
2. **Select Phoneme**: Choose a target phoneme from the Phoneme dropdown (e.g., `/eɪ/`, `/θ/`) — 40 phonemes available. Select "All" to use the full word bank.
3. **View & Listen**: The current word and its American IPA transcription are displayed. Click the play button or press the **Space key** to hear the pronunciation.
4. **Repeat Listening**: Replay as many times as needed to study the relationship between spelling, IPA symbols, and actual pronunciation.
5. **Next Word**: Click "Next Word" to proceed through all words in the round.
6. **Refresh**: Click "New Word Set" at the bottom to draw 10 new random words.

### Phoneme Filtering

The Phoneme dropdown in the header filters the word bank by phoneme. When a specific phoneme is selected, both Spelling and Training modes only use words containing that phoneme. The count next to each phoneme shows how many words are available for practice.

### Voice Selection

Use the Voice dropdown in the header to switch between available English voices. The system auto-selects the best quality voice by default (Samantha on macOS, Google US English on Chrome). Your choice is persisted in localStorage.

### IPA Keypad

The keypad is expanded by default and organized into three sections:

| Section | Symbols |
|---------|---------|
| Vowels | i ɪ eɪ ɛ æ ɑ ɔ oʊ ʊ u ʌ ɚ ə aɪ aʊ ɔɪ |
| Consonants | p b t d k ɡ f v θ ð s z ʃ ʒ h m n ŋ l r j w tʃ dʒ |
| Marks & Stress | ˈ (primary stress) ˌ (secondary stress) . (syllable break) ␣ (space) |

Click "Hide Keypad" to collapse it and free up screen space.

## Word Bank

Based on the [COCA (Corpus of Contemporary American English)](https://www.english-corpora.org/coca/) top 5,000 frequency list. Contains **4,088** deduplicated English items, each with American IPA as the primary transcription and British IPA as an alternate transcription.

| Level | COCA Rank | Count | Examples (American IPA) |
|-------|-----------|-------|--------------------------|
| Basic | 1–1,200 | 881 | say /se/, time /taɪm/ |
| Intermediate | 1,201–3,000 | 1,527 | method /ˈmɛθəd/, surface /ˈsɜ:rfɪs/ |
| Advanced | 3,001–5,000 | 1,680 | composition /ˌkɑ:mpəˈzɪʃn/ |

Word bank data sourced from [llt22/coca-vocabulary-20000](https://github.com/llt22/coca-vocabulary-20000). The parser script is at `.coca_raw/parse.py`.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Speech | Web Speech API (SpeechSynthesis) |
| Font | Noto Sans (Google Fonts) |

## Project Structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Main application component (mode switching, state)
├── index.css                # Global styles + IPA font definition
├── types.ts                 # Type definitions
├── components/
│   ├── IPAKeypad.tsx        # Interactive IPA keyboard component
│   └── TrainingView.tsx     # Listening training mode component
├── data/
│   └── wordBank.ts          # Local English word bank (4,088 items)
└── utils/
    ├── voice.ts             # Voice management (smart selection + localStorage)
    ├── ipaParser.ts         # IPA parser (phoneme tokenizer)
    └── phonemeGroups.ts     # Phoneme grouping (word classification by phoneme)
```

## Deployment

The build output is pure static files — no server required. Deploy to any static hosting platform.

### GitHub Pages

Push the code to a GitHub repository, then enable Pages in Settings. Build command: `npm run build`, output directory: `dist`.

### Vercel / Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. No environment variables needed

### Local File

The built `dist/index.html` can be opened directly in a browser (Web Speech API works over `file://` protocol).

## FAQ

**Q: No sound when clicking the play button?**
A: Make sure your browser supports the Web Speech API (Chrome, Edge, and Safari all do). On macOS, check that system audio is not muted.

**Q: IPA symbols show as boxes?**
A: The project loads Noto Sans from Google Fonts, which requires internet access. For offline use, pre-download the font files.

**Q: The voice sounds bad / not like American English?**
A: Use the Voice dropdown in the header to switch voices. Samantha (macOS) and Google US English (Chrome) offer the best quality.

## License

[Apache License 2.0](LICENSE)
