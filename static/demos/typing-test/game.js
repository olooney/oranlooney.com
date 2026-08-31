// --- Gameplay ---
const TITLE = 'Typing Test';
const GAME_SECONDS = 120;
const TICK_RATE = 1000 / 60;
const GAME_FRAMES = GAME_SECONDS * 60;
const GAME_OVER_DELAY = 2 * 60;
const PROMPT_THROB_SECONDS = 1.5;
const KEYS_PER_WORD = 5;
const LINE_TARGET_CHARS = 80;
const LINE_FONT_SIZE = 16;
const STREAM_LOOKAHEAD_CHARS = LINE_TARGET_CHARS * 8;
const WPM_BAR_MAX = 200;
const WPM_TICK = 60;
const KEYPRESS_SOUND_CHANNELS = 4;
const KEYPRESS_SOUND_VOLUME = 0.7;
const DING_SOUND_CHANNELS = 2;
const DING_SOUND_VOLUME = 0.75;
const ERROR_SOUND_CHANNELS = 1;
const ERROR_SOUND_VOLUME = 1.0;
const HIGH_SCORE_COOKIE = 'typerBHighScore';
const HIGH_SCORE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const SOUND_MUTED_COOKIE = 'typerBSoundMuted';
const SOUND_BUTTON_WIDTH = 132;
const SOUND_BUTTON_HEIGHT = 32;
const SOUND_BUTTON_MARGIN = 16;
const KEYPRESS_SOUNDS = [
    '../whack/resources/dragon-studio-single-key-press-393908.mp3',
    '../whack/resources/freesound_community-mech-keyboard-02-102918.mp3',
    '../whack/resources/koiroylers-keyboard-press-351952.mp3',
];
const DING_SOUND = '../font-wars/resources/sounds/91924__Benboncan__Till_With_Bell.ogg';
const ERROR_SOUND = '../font-wars/resources/sounds/476177__unadamlar__wrong-choice.wav';
const SENTENCE_FILES = Array.from({ length: 20 }, (_, i) => `data/sentences-${String(i + 1).padStart(2, '0')}.txt`);
// --- Colors ---
const COLOR_BG = '#ffffff';
const COLOR_TEXT = '#000000';
const COLOR_DIM = '#555555';
const COLOR_INACTIVE = '#888888';
const COLOR_GOOD = '#22cc22';
const COLOR_BAD = '#cc0000';
const COLOR_PANEL = '#eeeeee';
const COLOR_BAR = '#222222';
const COLOR_BAR_EMPTY = '#bbbbbb';
const HIGHLIGHT_ALPHA = 0.5;
const PAUSE_OVERLAY_ALPHA = 0.35;
const MISSING_CHARACTER = ' ';

function hasModifierKey(e) {
    return e.ctrlKey || e.altKey || e.metaKey;
}

function isPrintableKey(e) {
    return e.key.length === 1;
}

function isResumeKey(e) {
    return isPrintableKey(e) || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Escape';
}

function readHighScore() {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    const prefix = `${HIGH_SCORE_COOKIE}=`;
    const cookie = cookies.find(c => c.startsWith(prefix));

    if (!cookie) return 0;

    const value = parseInt(decodeURIComponent(cookie.slice(prefix.length)), 10);

    return Number.isFinite(value) ? value : 0;
}

function writeHighScore(score) {
    document.cookie = `${HIGH_SCORE_COOKIE}=${encodeURIComponent(score)}; max-age=${HIGH_SCORE_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

function readSoundMuted() {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    const prefix = `${SOUND_MUTED_COOKIE}=`;

    return cookies.some(cookie => cookie === `${prefix}true`);
}

function writeSoundMuted(muted) {
    document.cookie = `${SOUND_MUTED_COOKIE}=${muted}; max-age=${HIGH_SCORE_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

function promptThrobAlpha(frame) {
    const period = Math.round(PROMPT_THROB_SECONDS * 1000 / TICK_RATE);
    const phase = (frame % period) / period;
    const eased = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);

    return 0.3 + 0.7 * eased;
}

function shuffle(items) {
    const copy = items.slice();

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function countWordsWithMistakes(typed, target) {
    const wordPattern = /\S+/g;
    let match;
    let count = 0;

    while ((match = wordPattern.exec(target)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const typedEnd = Math.min(typed.length, end);

        if (typedEnd <= start) continue;

        if (typed.slice(start, typedEnd) !== target.slice(start, typedEnd)) {
            count++;
        }
    }

    return count;
}

function completedWordHasMistake(typed, target) {
    const typedLength = typed.length;

    if (typedLength === 0 || (typedLength < target.length && target[typedLength] !== ' ')) {
        return false;
    }

    const wordStart = target.lastIndexOf(' ', typedLength - 1) + 1;

    return typed.slice(wordStart, typedLength) !== target.slice(wordStart, typedLength);
}

function countCreditedCharacters(typed, target) {
    const wordPattern = /\S+/g;
    let match;
    let count = 0;
    let lastEnd = 0;

    while ((match = wordPattern.exec(target)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const typedEnd = Math.min(typed.length, end);

        if (typed.length > lastEnd) {
            count += Math.max(0, Math.min(typed.length, start) - lastEnd);
        }

        if (typedEnd > start && typed.slice(start, typedEnd) === target.slice(start, typedEnd)) {
            count += typedEnd - start;
        }

        lastEnd = end;
    }

    if (typed.length > lastEnd) {
        count += Math.min(typed.length, target.length) - lastEnd;
    }

    return count;
}

class SoundPool {
    constructor(urls, channels, volume) {
        this.muted = false;
        this.sounds = urls.map((url) => ({
            channels: Array.from({ length: channels }, () => {
                const audio = new Audio(url);

                audio.preload = 'auto';
                audio.volume = volume;
                audio.load();

                return audio;
            }),
            nextChannel: 0,
        }));
    }

    setMuted(muted) {
        this.muted = muted;
    }

    play() {
        if (this.muted) return;

        const sound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
        const audio = sound.channels[sound.nextChannel];

        sound.nextChannel = (sound.nextChannel + 1) % sound.channels.length;
        try {
            audio.currentTime = 0;

            const playResult = audio.play();

            if (playResult) {
                playResult.catch(() => { });
            }
        } catch (e) {
            // Audio playback should never block game input.
        }
    }
}

class Game {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.sentences = [];
        this.nextGameStartIndex = 0;
        this.loading = true;
        this.loadError = false;
        this.reset();
        this.loadSentences();
    }

    loadSentences() {
        let failedFiles = 0;

        SENTENCE_FILES.forEach(async (filename) => {
            try {
                const response = await fetch(filename, { cache: 'no-store' });

                if (!response.ok) throw new Error(`${filename} returned ${response.status}`);

                const text = await response.text();
                const sentences = text.split('\n').map(line => line.trim()).filter(Boolean);

                if (sentences.length === 0) throw new Error(`${filename} is empty`);

                this.sentences.push(...shuffle(sentences));
                this.loading = false;
            } catch (e) {
                failedFiles++;

                if (failedFiles === SENTENCE_FILES.length && this.sentences.length === 0) {
                    this.loading = false;
                    this.loadError = true;
                }
            }
        });
    }

    reset() {
        this.frame = 0;
        this.playFrames = 0;
        this.timerStarted = false;
        this.titleScreen = true;
        this.gameOver = false;
        this.paused = false;
        this.gameOverFrame = 0;
        this.startIndex = 0;
        this.streamText = '';
        this.streamSentenceIndexes = [];
        this.streamNextSentenceIndex = 0;
        this.lineStart = 0;
        this.typedLine = '';
        this.completedCorrectChars = 0;
        this.keystrokeErrors = 0;
        this.incorrectWords = 0;
        this.finalWpm = 0;
        this.previousHighScore = readHighScore();
        this.newHighScore = false;
    }

    startGame() {
        if (this.sentences.length === 0) return;

        this.reset();
        this.titleScreen = false;
        this.startIndex = this.nextGameStartIndex;
        this.streamNextSentenceIndex = this.startIndex;
        this.ensureStreamLength(0);
    }

    sentenceAt(sentenceIndex) {
        return this.sentences[((sentenceIndex % this.sentences.length) + this.sentences.length) % this.sentences.length];
    }

    appendSentenceToStream() {
        const sentenceIndex = this.streamNextSentenceIndex;
        const sentence = this.sentenceAt(sentenceIndex);

        if (this.streamText.length > 0) {
            this.streamText += ' ';
            this.streamSentenceIndexes.push(sentenceIndex - 1);
        }

        this.streamText += sentence;
        this.streamSentenceIndexes.push(...Array.from({ length: sentence.length }, () => sentenceIndex));
        this.streamNextSentenceIndex++;
    }

    ensureStreamLength(fromIndex) {
        const targetLength = fromIndex + STREAM_LOOKAHEAD_CHARS;

        while (this.streamText.length < targetLength) {
            this.appendSentenceToStream();
        }
    }

    skipSpaces(index) {
        this.ensureStreamLength(index);

        while (index < this.streamText.length && this.streamText[index] === ' ') {
            index++;
        }

        return index;
    }

    lineRangeFrom(start) {
        start = this.skipSpaces(start);
        this.ensureStreamLength(start);

        const wordPattern = /\S+/g;
        wordPattern.lastIndex = start;

        let end = start;
        let match;

        while ((match = wordPattern.exec(this.streamText)) !== null) {
            const wordStart = match.index;
            const wordEnd = wordStart + match[0].length;

            if (wordStart !== start && wordEnd - start > LINE_TARGET_CHARS) break;

            end = wordEnd;
        }

        return {
            start,
            end,
            text: this.streamText.slice(start, end),
        };
    }

    visibleLines() {
        const current = this.lineRangeFrom(this.lineStart);
        const next = this.lineRangeFrom(current.end);

        return { current, next };
    }

    finishGame() {
        const lines = this.visibleLines();

        this.gameOver = true;
        this.paused = false;
        this.gameOverFrame = this.frame;
        this.finalWpm = this.computeWpm();
        this.incorrectWords += countWordsWithMistakes(this.typedLine, lines.current.text);
        this.previousHighScore = readHighScore();
        this.newHighScore = this.finalWpm > this.previousHighScore;

        if (this.newHighScore) {
            writeHighScore(this.finalWpm);
        }

        this.nextGameStartIndex = this.firstFreshSentenceIndex(lines.next.end);
    }

    firstFreshSentenceIndex(visibleEnd) {
        let lastDisplayedSentenceIndex = this.startIndex;

        for (let i = this.lineStart; i < visibleEnd; i++) {
            if (this.streamText[i] !== ' ') {
                lastDisplayedSentenceIndex = Math.max(lastDisplayedSentenceIndex, this.streamSentenceIndexes[i]);
            }
        }

        return lastDisplayedSentenceIndex + 1;
    }

    advanceLine() {
        const lines = this.visibleLines();
        const wordErrors = countWordsWithMistakes(this.typedLine, lines.current.text);

        this.incorrectWords += wordErrors;
        this.completedCorrectChars += countCreditedCharacters(this.typedLine, lines.current.text);
        this.lineStart = lines.next.start;
        this.typedLine = '';
        this.ensureStreamLength(this.lineStart);
        dingSound.play();
    }

    currentWordRange(text) {
        const cursor = this.typedLine.length;
        const start = text.lastIndexOf(' ', Math.max(cursor - 1, 0)) + 1;
        const space = text.indexOf(' ', cursor);

        return {
            start,
            end: space === -1 ? text.length : space,
        };
    }

    completeCurrentWord(text) {
        const range = this.currentWordRange(text);
        const wasMistyped = this.typedLine.length >= range.end && completedWordHasMistake(this.typedLine, text);

        this.typedLine += MISSING_CHARACTER.repeat(Math.max(range.end - this.typedLine.length, 0));

        const isMistyped = completedWordHasMistake(this.typedLine, text);

        if (isMistyped && !wasMistyped) {
            errorSound.play();
        }

        return {
            isMistyped,
            isLastWord: range.end === text.length,
        };
    }

    hasErroneousSpace(range) {
        return this.typedLine.slice(range.start, range.end).includes(MISSING_CHARACTER);
    }

    nextWordFirstCharacter(text, range) {
        if (range.end < text.length) {
            return text[range.end + 1];
        }

        return this.visibleLines().next.text[0];
    }

    jumpToNextWord(text, range, key) {
        if (range.end === text.length) {
            this.advanceLine();
            this.typedLine = key;
            return;
        }

        const nextWordStart = range.end + 1;

        this.typedLine += MISSING_CHARACTER.repeat(nextWordStart - this.typedLine.length) + key;
    }

    advanceWord(text) {
        const completed = this.completeCurrentWord(text);

        if (completed.isLastWord) {
            this.advanceLine();
        } else {
            this.typedLine += ' ';
        }
    }

    computeWpm() {
        const playFrames = Math.min(this.playFrames, GAME_FRAMES);
        const minutes = Math.max(playFrames / 60 / 60, 1 / 60);
        const lineText = this.visibleLines().current.text;
        const currentCorrectChars = countCreditedCharacters(this.typedLine, lineText);

        return Math.round(((this.completedCorrectChars + currentCorrectChars) / KEYS_PER_WORD) / minutes);
    }

    timeLeftFrames() {
        return Math.max(GAME_FRAMES - this.playFrames, 0);
    }

    currentErrorCount() {
        return countWordsWithMistakes(this.typedLine, this.visibleLines().current.text);
    }

    displayErrorCount() {
        return this.incorrectWords + this.currentErrorCount();
    }

    pauseGame() {
        if (this.loading || this.loadError || this.titleScreen || this.gameOver || this.paused) return;

        this.paused = true;
    }

    resumeGame() {
        if (!this.paused) return;

        this.paused = false;
    }

    update() {
        this.frame++;

        if (this.loading || this.loadError || this.titleScreen || this.gameOver || this.paused) return;

        if (!this.timerStarted) return;

        this.playFrames++;

        if (this.playFrames >= GAME_FRAMES) {
            this.finishGame();
        }
    }

    drawBackground() {
        this.ctx.fillStyle = COLOR_BG;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawCenteredTitle(title, prompt) {
        this.ctx.save();

        const bigFont = Math.min(this.width / 8, this.height / 4);
        const smallFont = bigFont * 0.35;

        this.ctx.font = `bold ${bigFont}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.fillText(title, this.width / 2, this.height / 2 - bigFont * 0.4);

        this.ctx.font = `${smallFont}px monospace`;
        this.ctx.fillStyle = COLOR_DIM;
        this.ctx.globalAlpha = promptThrobAlpha(this.frame);
        this.ctx.fillText(prompt, this.width / 2, this.height / 2 + bigFont * 0.6);

        this.ctx.restore();
    }

    drawHud() {
        const wpm = this.gameOver ? this.finalWpm : this.computeWpm();
        const secondsLeft = Math.ceil(this.timeLeftFrames() / 60);
        const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
        const secs = String(secondsLeft % 60).padStart(2, '0');
        const wordErrors = this.gameOver ? this.incorrectWords : this.displayErrorCount();
        const barX = 48;
        const barW = this.width - barX * 2;
        const barH = 10;
        const wpmBarY = this.height - 78;
        const timeBarY = this.height - 54;
        const textY = this.height - 12;
        const timeFraction = this.gameOver ? 0 : this.timeLeftFrames() / GAME_FRAMES;
        const wpmFraction = Math.min(wpm / WPM_BAR_MAX, 1);
        const tickX = barX + barW * (WPM_TICK / WPM_BAR_MAX);
        const wpmText = `WPM: ${String(wpm).padEnd(3, ' ')}`;
        const timeText = `TIME: ${mins}:${secs}`;
        const errorText = `KEY ERR: ${this.keystrokeErrors}  WORD ERR: ${wordErrors}`;

        this.ctx.save();

        this.ctx.fillStyle = COLOR_BAR_EMPTY;
        this.ctx.fillRect(barX, wpmBarY, barW, barH);
        this.ctx.fillStyle = COLOR_BAR;
        this.ctx.fillRect(barX, wpmBarY, Math.round(barW * wpmFraction), barH);
        this.ctx.fillStyle = COLOR_BAD;
        this.ctx.fillRect(Math.round(tickX) - 1, wpmBarY - 4, 2, barH + 8);

        this.ctx.fillStyle = COLOR_BAR_EMPTY;
        this.ctx.fillRect(barX, timeBarY, barW, barH);
        this.ctx.fillStyle = COLOR_BAR;
        this.ctx.fillRect(barX, timeBarY, Math.round(barW * timeFraction), barH);

        this.ctx.font = 'bold 22px monospace';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(wpmText, barX, textY);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(timeText, this.width / 2, textY);
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(errorText, this.width - barX, textY);

        this.ctx.restore();
    }

    fillHighlight(color, x, y, width, height) {
        this.ctx.save();
        this.ctx.globalAlpha = HIGHLIGHT_ALPHA;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }

    drawLetterErrorHighlights(line, typed, start, end, x, y, fontSize) {
        let letterX = x;
        console.log(typed);

        for (let i = start; i < end; i++) {
            const expected = line[i];
            const actual = typed[i];
            const letterWidth = this.ctx.measureText(expected).width;

            if (actual !== expected) {
                // show actual mistyped character above the line
                this.ctx.save();
                this.ctx.fillStyle = COLOR_BAD;
                this.ctx.fillText(actual, letterX, y-fontSize-3);
                this.ctx.restore();

                // red highlight around individual error
                this.fillHighlight(COLOR_BAD, letterX, y - 2, letterWidth, fontSize + 2);
            }

            letterX += letterWidth;
        }
    }

    drawTextLine(line, typed, x, y, active) {
        const fontSize = LINE_FONT_SIZE;
        const lineHeight = fontSize * 1.4;
        const halfLetter = this.ctx.measureText('M').width / 2;
        const tokens = [];
        const pattern = /\S+|\s+/g;
        let match;

        while ((match = pattern.exec(line)) !== null) {
            tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
        }

        this.ctx.save();
        this.ctx.font = `${fontSize}px "SFMono-Regular", Consolas, Menlo, monospace`;
                        
        this.ctx.textBaseline = 'top';

        let cursorX = x;
        let cursorY = y;
        const maxX = this.width - x;

        for (const token of tokens) {
            const tokenWidth = this.ctx.measureText(token.text).width;
            const isSpace = /^\s+$/.test(token.text);

            if (!isSpace && cursorX + tokenWidth > maxX && cursorX > x) {
                cursorX = x;
                cursorY += lineHeight;
            }

            if (!isSpace && active && typed.length >= token.end) {
                const typedToken = typed.slice(token.start, token.end);
                const isCorrect = typedToken === token.text;

                this.fillHighlight(isCorrect ? COLOR_GOOD : COLOR_BAD, cursorX - halfLetter, cursorY - 2, tokenWidth + halfLetter * 2, fontSize + 2);

                if (!isCorrect) {
                    this.drawLetterErrorHighlights(line, typed, token.start, token.end, cursorX, cursorY, fontSize);
                }
            } else if (!isSpace && active && typed.length > token.start) {
                const end = Math.min(typed.length, token.end);

                this.drawLetterErrorHighlights(line, typed, token.start, end, cursorX, cursorY, fontSize);
            }

            this.ctx.fillStyle = active ? COLOR_TEXT : COLOR_INACTIVE;
            this.ctx.fillText(token.text, cursorX, cursorY);
            cursorX += tokenWidth;
        }

        if (active) {
            const cursor = this.cursorPositionForText(line, typed.length, x, y, fontSize, lineHeight);

            this.ctx.fillStyle = COLOR_TEXT;
            this.ctx.fillRect(Math.round(cursor.x), cursor.y + 1, 1, fontSize);
        }

        this.ctx.restore();
    }

    cursorPositionForText(line, charIndex, x, y, fontSize, lineHeight) {
        this.ctx.save();
        this.ctx.font = `${fontSize}px monospace`;

        const maxX = this.width - x;
        let cursorX = x;
        let cursorY = y;
        let index = 0;
        const pattern = /\S+|\s+/g;
        let match;

        while ((match = pattern.exec(line)) !== null) {
            const token = match[0];
            const tokenWidth = this.ctx.measureText(token).width;
            const isSpace = /^\s+$/.test(token);

            if (!isSpace && cursorX + tokenWidth > maxX && cursorX > x) {
                cursorX = x;
                cursorY += lineHeight;
            }

            for (let i = 0; i < token.length; i++) {
                if (index === charIndex) {
                    this.ctx.restore();
                    return { x: cursorX, y: cursorY };
                }
                cursorX += this.ctx.measureText(token[i]).width;
                index++;
            }
        }

        this.ctx.restore();
        return { x: cursorX, y: cursorY };
    }

    drawGame() {
        const lines = this.visibleLines();
        const panelX = 0;
        const panelY = 70;
        const panelW = this.width - panelX * 2;
        const panelH = 76;
        const textInset = 20;

        this.ctx.save();
        this.ctx.fillStyle = COLOR_PANEL;
        this.ctx.fillRect(panelX, panelY, panelW, panelH);
        this.ctx.restore();

        this.drawTextLine(lines.current.text, this.typedLine, panelX + textInset, panelY + textInset, true);
        this.drawTextLine(lines.next.text, '', panelX + textInset, panelY + textInset + 24, false);
    }

    drawGameOver() {
        this.ctx.save();

        const scoreFont = 28;
    const scoreBoxRight = this.width / 2 + 160;
        let y = this.height / 2 - scoreFont * 2.4;
        const framesSinceOver = this.frame - this.gameOverFrame;

        this.ctx.font = `${scoreFont}px monospace`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.fillText(`WPM: ${this.finalWpm}`, scoreBoxRight, y);
        y += scoreFont * 1.4;
        this.ctx.fillText(`KEY ERRORS: ${this.keystrokeErrors}`, scoreBoxRight, y);
        y += scoreFont * 1.4;
        this.ctx.fillText(`WORD ERRORS: ${this.incorrectWords}`, scoreBoxRight, y);
        y += scoreFont * 1.4;
        this.ctx.fillStyle = COLOR_DIM;
        this.ctx.fillText(`PREVIOUS BEST: ${this.previousHighScore}`, scoreBoxRight, y);

        if (this.newHighScore) {
            y += scoreFont * 1.6;
            this.ctx.fillStyle = COLOR_GOOD;
            this.ctx.fillText('NEW HIGH SCORE!', scoreBoxRight, y);
        }

        if (framesSinceOver >= GAME_OVER_DELAY) {
            this.ctx.font = `${scoreFont * 0.9}px monospace`;
            this.ctx.fillStyle = COLOR_DIM;
            this.ctx.globalAlpha = promptThrobAlpha(framesSinceOver);
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press space to restart', this.width / 2, this.height - 32);
        }

        this.ctx.restore();
    }

    drawPauseOverlay() {
        this.ctx.save();

        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.globalAlpha = PAUSE_OVERLAY_ALPHA;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = 1;

        const boxWidth = Math.min(this.width - 96, 420);
        const boxHeight = 120;
        const boxX = (this.width - boxWidth) / 2;
        const boxY = (this.height - boxHeight) / 2;

        this.ctx.fillStyle = COLOR_BG;
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.strokeStyle = COLOR_TEXT;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxWidth - 1, boxHeight - 1);

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.font = 'bold 30px monospace';
        this.ctx.fillText('Paused', this.width / 2, boxY + 42);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.fillText('Press any key to resume', this.width / 2, boxY + 82);

        this.ctx.restore();
    }

    soundButtonBounds() {
        return {
            x: this.width - SOUND_BUTTON_WIDTH - SOUND_BUTTON_MARGIN,
            y: SOUND_BUTTON_MARGIN,
            width: SOUND_BUTTON_WIDTH,
            height: SOUND_BUTTON_HEIGHT,
        };
    }

    drawSoundToggle(muted) {
        const bounds = this.soundButtonBounds();

        this.ctx.save();
        this.ctx.fillStyle = COLOR_BG;
        this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.strokeStyle = COLOR_TEXT;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width - 1, bounds.height - 1);
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.fillText(muted ? 'Unmute Sound' : 'Mute Sound', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        this.ctx.restore();
    }

    isSoundToggleAt(x, y) {
        const bounds = this.soundButtonBounds();

        return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
    }

    draw() {
        this.drawBackground();

        if (this.loading) {
            this.drawCenteredTitle(TITLE, 'Loading sentences...');
        } else if (this.loadError) {
            this.drawCenteredTitle(TITLE, 'Could not load sentences');
        } else if (this.titleScreen) {
            this.drawCenteredTitle(TITLE, 'Press space to start');
        } else if (this.gameOver) {
            this.drawGameOver();
        } else {
            this.drawGame();
            this.drawHud();

            if (this.paused) {
                this.drawSoundToggle(soundMuted);
                this.drawPauseOverlay();
            }
        }

        if (!this.paused) {
            this.drawSoundToggle(soundMuted);
        }
    }

    keydown(e) {
        if (hasModifierKey(e)) return;

        if (this.loading || this.loadError) return;

        if (this.paused) {
            if (!isResumeKey(e)) return;

            e.preventDefault();
            this.resumeGame();
            return;
        }

        if (this.titleScreen) {
            if (e.key === ' ') {
                e.preventDefault();
                this.startGame();
            }
            return;
        }

        if (this.gameOver) {
            const framesSinceOver = this.frame - this.gameOverFrame;

            if (e.key === ' ') {
                e.preventDefault();
                if (framesSinceOver >= GAME_OVER_DELAY) {
                    this.startGame();
                }
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            this.pauseGame();
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            this.typedLine = this.typedLine.slice(0, -1);
            return;
        }

        const currentText = this.visibleLines().current.text;

        if (e.key === 'Enter') {
            e.preventDefault();

            if (this.currentWordRange(currentText).end === currentText.length) {
                this.timerStarted = true;
                this.advanceWord(currentText);
            }
            return;
        }

        if (!isPrintableKey(e)) return;

        e.preventDefault();

        const range = this.currentWordRange(currentText);
        const nextWordFirstCharacter = this.nextWordFirstCharacter(currentText, range);

        if (this.hasErroneousSpace(range) && e.key === nextWordFirstCharacter) {
            this.timerStarted = true;
            this.jumpToNextWord(currentText, range, e.key);
            keypressSounds.play();
            return;
        }

        if (this.typedLine.length >= range.end) {
            this.timerStarted = true;

            if (e.key === ' ') {
                if (range.end === currentText.length) {
                    this.advanceLine();
                } else {
                    this.typedLine += ' ';
                    keypressSounds.play();
                }
            } else {
                this.keystrokeErrors++;
                errorSound.play();
            }
            return;
        }

        if (e.key !== currentText[this.typedLine.length]) {
            this.keystrokeErrors++;
        }

        const typedLine = this.typedLine + e.key;

        if (completedWordHasMistake(typedLine, currentText)) {
            errorSound.play();
        } else {
            keypressSounds.play();
        }

        this.timerStarted = true;
        this.typedLine = typedLine;
    }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keypressSounds = new SoundPool(KEYPRESS_SOUNDS, KEYPRESS_SOUND_CHANNELS, KEYPRESS_SOUND_VOLUME);
const dingSound = new SoundPool([DING_SOUND], DING_SOUND_CHANNELS, DING_SOUND_VOLUME);
const errorSound = new SoundPool([ERROR_SOUND], ERROR_SOUND_CHANNELS, ERROR_SOUND_VOLUME);
let soundMuted = readSoundMuted();

keypressSounds.setMuted(soundMuted);
dingSound.setMuted(soundMuted);
errorSound.setMuted(soundMuted);

const game = new Game(ctx, canvas.clientWidth, canvas.clientHeight);
if (new URLSearchParams(location.search).has('debug')) {
    globalThis.typerBGame = game;
}
document.addEventListener('keydown', (e) => game.keydown(e));
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;

    if (!game.isSoundToggleAt(x, y)) return;

    soundMuted = !soundMuted;
    keypressSounds.setMuted(soundMuted);
    dingSound.setMuted(soundMuted);
    errorSound.setMuted(soundMuted);
    writeSoundMuted(soundMuted);
});
window.addEventListener('blur', () => game.pauseGame());
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.pauseGame();
    }
});

let lastTime = performance.now();
let accumulator = 0;

function mainLoop(now) {
    const delta = now - lastTime;

    lastTime = now;
    accumulator += delta;

    while (accumulator >= TICK_RATE) {
        game.update();
        accumulator -= TICK_RATE;
    }

    game.draw();
    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);