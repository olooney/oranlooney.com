// --- Gameplay ---
const GAME_SECONDS = 120;
const TICK_RATE = 1000 / 60;
const GAME_FRAMES = GAME_SECONDS * 60;
const GAME_OVER_DELAY = 3 * 60;
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
const HIGH_SCORE_COOKIE = 'typerBHighScore';
const HIGH_SCORE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const KEYPRESS_SOUNDS = [
    '../whack/resources/dragon-studio-single-key-press-393908.mp3',
    '../whack/resources/freesound_community-mech-keyboard-02-102918.mp3',
    '../whack/resources/koiroylers-keyboard-press-351952.mp3',
];
const DING_SOUND = '../font-wars/resources/sounds/91924__Benboncan__Till_With_Bell.ogg';

// --- Colors ---
const COLOR_BG = '#ffffff';
const COLOR_TEXT = '#000000';
const COLOR_DIM = '#555555';
const COLOR_GOOD = '#22cc22';
const COLOR_BAD = '#cc0000';
const COLOR_PANEL = '#eeeeee';
const COLOR_BAR = '#222222';
const COLOR_BAR_EMPTY = '#bbbbbb';
const HIGHLIGHT_ALPHA = 0.5;

function hasModifierKey(e) {
    return e.ctrlKey || e.altKey || e.metaKey;
}

function isPrintableKey(e) {
    return e.key.length === 1;
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

    play() {
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

    async loadSentences() {
        try {
            const response = await fetch('sentences.txt', { cache: 'no-store' });

            if (!response.ok) throw new Error(`sentences.txt returned ${response.status}`);

            const text = await response.text();
            const sentences = text.split('\n').map(line => line.trim()).filter(Boolean);

            this.sentences = shuffle(sentences);
            this.loading = false;
        } catch (e) {
            this.loading = false;
            this.loadError = true;
        }
    }

    reset() {
        this.frame = 0;
        this.titleScreen = true;
        this.gameOver = false;
        this.gameOverFrame = 0;
        this.startIndex = 0;
        this.streamText = '';
        this.streamSentenceIndexes = [];
        this.streamNextSentenceIndex = 0;
        this.lineStart = 0;
        this.typedLine = '';
        this.completedCorrectChars = 0;
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

        this.incorrectWords += countWordsWithMistakes(this.typedLine, lines.current.text);
        this.completedCorrectChars += countCreditedCharacters(this.typedLine, lines.current.text);
        this.lineStart = lines.next.start;
        this.typedLine = '';
        this.ensureStreamLength(this.lineStart);
        dingSound.play();
    }

    computeWpm() {
        const playFrames = this.gameOver ? Math.min(this.gameOverFrame, GAME_FRAMES) : Math.min(this.frame, GAME_FRAMES);
        const minutes = Math.max(playFrames / 60 / 60, 1 / 60);
        const lineText = this.visibleLines().current.text;
        const currentCorrectChars = countCreditedCharacters(this.typedLine, lineText);

        return Math.round(((this.completedCorrectChars + currentCorrectChars) / KEYS_PER_WORD) / minutes);
    }

    timeLeftFrames() {
        return Math.max(GAME_FRAMES - this.frame, 0);
    }

    currentErrorCount() {
        return countWordsWithMistakes(this.typedLine, this.visibleLines().current.text);
    }

    displayErrorCount() {
        return this.incorrectWords + this.currentErrorCount();
    }

    update() {
        this.frame++;

        if (this.loading || this.loadError || this.titleScreen || this.gameOver) return;

        if (this.frame >= GAME_FRAMES) {
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
        const errors = this.gameOver ? this.incorrectWords : this.displayErrorCount();
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
        const errorText = `ERRORS: ${errors}`;

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

        for (let i = start; i < end; i++) {
            const expected = line[i];
            const actual = typed[i];
            const letterWidth = this.ctx.measureText(expected).width;

            if (actual !== expected) {
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
        this.ctx.font = `${fontSize}px monospace`;
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

            this.ctx.fillStyle = active ? COLOR_TEXT : COLOR_DIM;
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
        const panelY = 14;
        const panelW = this.width - panelX * 2;
        const panelH = 76;
        const textInset = this.ctx.measureText('M').width / 2;

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
        const rightX = this.width - 72;
        let y = this.height / 2 - scoreFont * 2.4;
        const framesSinceOver = this.frame - this.gameOverFrame;

        this.ctx.font = `${scoreFont}px monospace`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_TEXT;
        this.ctx.fillText(`WPM: ${this.finalWpm}`, rightX, y);
        y += scoreFont * 1.4;
        this.ctx.fillText(`ERRORS: ${this.incorrectWords}`, rightX, y);
        y += scoreFont * 1.4;
        this.ctx.fillStyle = COLOR_DIM;
        this.ctx.fillText(`PREVIOUS BEST: ${this.previousHighScore}`, rightX, y);

        if (this.newHighScore) {
            y += scoreFont * 1.6;
            this.ctx.fillStyle = COLOR_GOOD;
            this.ctx.fillText('NEW HIGH SCORE!', rightX, y);
        }

        if (framesSinceOver >= GAME_OVER_DELAY) {
            this.ctx.font = `${scoreFont * 0.9}px monospace`;
            this.ctx.fillStyle = COLOR_DIM;
            this.ctx.globalAlpha = promptThrobAlpha(framesSinceOver);
            this.ctx.fillText('Press space to restart', rightX, this.height - 32);
        }

        this.ctx.restore();
    }

    draw() {
        this.drawBackground();

        if (this.loading) {
            this.drawCenteredTitle('Typer-B', 'Loading sentences...');
        } else if (this.loadError) {
            this.drawCenteredTitle('Typer-B', 'Could not load sentences.txt');
        } else if (this.titleScreen) {
            this.drawCenteredTitle('Typer-B', 'Press space to start');
        } else if (this.gameOver) {
            this.drawGameOver();
        } else {
            this.drawGame();
            this.drawHud();
        }
    }

    keydown(e) {
        if (hasModifierKey(e)) return;

        if (this.loading || this.loadError) return;

        if (this.titleScreen) {
            if (e.key === ' ') {
                e.preventDefault();
                this.startGame();
            }
            return;
        }

        if (this.gameOver) {
            const framesSinceOver = this.frame - this.gameOverFrame;

            if (framesSinceOver >= GAME_OVER_DELAY && e.key === ' ') {
                e.preventDefault();
                this.startGame();
            }
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            this.typedLine = this.typedLine.slice(0, -1);
            return;
        }

        const currentText = this.visibleLines().current.text;

        if (this.typedLine.length >= currentText.length && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            this.advanceLine();
            return;
        }

        if (!isPrintableKey(e)) return;

        e.preventDefault();
        keypressSounds.play();

        if (this.typedLine.length >= currentText.length) return;

        this.typedLine += e.key;
    }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keypressSounds = new SoundPool(KEYPRESS_SOUNDS, KEYPRESS_SOUND_CHANNELS, KEYPRESS_SOUND_VOLUME);
const dingSound = new SoundPool([DING_SOUND], DING_SOUND_CHANNELS, DING_SOUND_VOLUME);
const game = new Game(ctx, canvas.clientWidth, canvas.clientHeight);
if (new URLSearchParams(location.search).has('debug')) {
    globalThis.typerBGame = game;
}
document.addEventListener('keydown', (e) => game.keydown(e));

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