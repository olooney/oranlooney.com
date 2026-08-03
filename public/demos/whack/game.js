// --- Gameplay ---
const SPAWN_INTERVAL = 30;
const MIN_SPAWN_INTERVAL = 4;

const KEY_LIFETIME = 240;
const MIN_KEY_LIFETIME = 30;

const KEY_COOLDOWN_SECONDS = 1.0;
const FLASH_DURATION = 5;
const EXPIRED_KEY_GRACE_SECONDS = 0.1;
const MISS_PENALTY = 1;
const HIT_REWARD = 1;
const TICK_RATE = 1000 / 60;
const KEY_COOLDOWN_FRAMES = Math.round(KEY_COOLDOWN_SECONDS * 1000 / TICK_RATE);
const EXPIRED_KEY_GRACE_FRAMES = Math.round(EXPIRED_KEY_GRACE_SECONDS * 1000 / TICK_RATE);
const KEYS_PER_WORD = 5;
const WPM_WINDOW_SECONDS = 10;
const MIN_WPM_SECONDS = 1;
const WPM_WINDOW_FRAMES = Math.round(WPM_WINDOW_SECONDS * 1000 / TICK_RATE);
const MIN_WPM_FRAMES = Math.round(MIN_WPM_SECONDS * 1000 / TICK_RATE);
const WPM_UPDATE_SECONDS = 1;
const WPM_UPDATE_FRAMES = Math.round(WPM_UPDATE_SECONDS * 1000 / TICK_RATE);
const DIGIT_SPAWN_WEIGHT = 0.333;
const GAME_OVER_DELAY = 2 * 60;
const DIFFICULTY_RAMP = 0.00005;
const MAX_HP = 10;
const HP_DAMAGE = 1;
const HP_HEAL_AMOUNT = 1;
const HP_HEAL_INTERVAL = 10;
const HP_HEAL_FLASH_DURATION = 50;
const LOW_HP_WARNING_THRESHOLD = 2;
const PROMPT_THROB_SECONDS = 1.5;
const KEYPRESS_SOUND_CHANNELS = 4;
const KEYPRESS_SOUND_VOLUME = 0.7;
const KEYPRESS_SOUNDS = [
    'resources/dragon-studio-single-key-press-393908.mp3',
    'resources/freesound_community-mech-keyboard-02-102918.mp3',
    'resources/koiroylers-keyboard-press-351952.mp3',
];

// --- Colors ---
const COLOR_HP_FULL = '#222222';
const COLOR_HP_EMPTY = '#666666';
const COLOR_HP_DANGER = '#cc0000';
const COLOR_HP_HEAL = '#118822';
const COLOR_BG = '#ffffff';
const COLOR_FLASH = '#ffeeee';

const COLOR_KEY_OFF = '#dddddd';
const COLOR_KEY_ON = '#222222';
const COLOR_KEY_FLASH = '#aa6666';
const COLOR_KEY_DRAIN = '#666666';

const COLOR_LETTER_OFF = '#bbbbbb';
const COLOR_LETTER_ON = '#ffffff';
const COLOR_LETTER_FLASH = '#cc0000';

const COLOR_SCORE = '#000000';
const COLOR_GAME_OVER = '#000000';
const COLOR_CONTINUE = '#555555';
const HIGH_SCORE_COOKIE = 'whackHighScore';
const HIGH_SCORE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// --- QWERTY keyboard layout - letters and numbers only ---
const KEYBOARD = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];
const KEYBOARD_ROW_OFFSETS = [0.1, 0.4, 0.8, 1.3];

// separate letters and digits
const DIGITS = KEYBOARD[0];
const LETTERS = KEYBOARD.slice(1).flat();
const ALL_KEYS = KEYBOARD.flat();

class KeypressSounds {
    constructor() {
        this.sounds = KEYPRESS_SOUNDS.map((url) => ({
            channels: Array.from({ length: KEYPRESS_SOUND_CHANNELS }, () => {
                const audio = new Audio(url);

                audio.preload = 'auto';
                audio.volume = KEYPRESS_SOUND_VOLUME;
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

function isControlKey(key) {
    return key === ' ' || key === 'ENTER';
}

function hasModifierKey(e) {
    return e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
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

function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

function mixColor(a, b, amount) {
    const colorA = hexToRgb(a);
    const colorB = hexToRgb(b);
    const mix = (from, to) => Math.round(from + (to - from) * amount);

    return `rgb(${mix(colorA.r, colorB.r)}, ${mix(colorA.g, colorB.g)}, ${mix(colorA.b, colorB.b)})`;
}

// game logic for whack-a-key
class Game {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.reset();
    }

    // call each time a new game begins
    reset() {
        this.score = 0;
        this.frame = 0;
        this.flashUntil = 0;
        this.difficulty = 1.0;
        this.gameOver = false;
        this.gameOverFrame = 0;
        this.finalWpm = 0;
        this.displayWpm = 0;
        this.lastWpmUpdateFrame = -Infinity;
        this.previousHighScore = readHighScore();
        this.newHighScore = false;
        this.hitTimestamps = [];
        this.hp = MAX_HP;
        this.hpHealFlashUntil = 0;
        this.hitsSinceHeal = 0;
        this.playFrames = 0;
        this.titleScreen = true;

        this.keys = {};
        for (const k of ALL_KEYS) {
            this.keys[k] = { on: false, startFrame: 0, flashUntil: 0, graceUntil: 0, cooldownUntil: 0 };
        }
    }

    spawnKey() {
        while (true) { 
            // choose a key at random, undersampling digits
            const digitRate = DIGITS.length * DIGIT_SPAWN_WEIGHT;
            const letterRate = LETTERS.length;
            const useDigit = Math.random() < digitRate / (digitRate + letterRate);
            const pool = useDigit ? DIGITS : LETTERS;
            const key = pool[Math.floor(Math.random() * pool.length)];

            // current state of the randomly selected key
            const state = this.keys[key];

            // skip keys already on
            if (state.on) continue;

            // or if they're still flashing
            const flash = this.frame < state.flashUntil;
            if (flash) continue;

            // or if they were just cleared or drained
            const coolingDown = this.frame < state.cooldownUntil;
            if (coolingDown) continue;

            // flip the key on and start the drain animation
            state.on = true;
            state.startFrame = this.frame;
            state.graceUntil = 0;
            return;
        }
    }

    expireKeys() {
        const lifetime = this.keyLifetime();

        for (const k of ALL_KEYS) {
            const state = this.keys[k];

            // when a key expires before the user types it:
            if (state.on && this.frame - state.startFrame >= lifetime) {
                // take damage
                this.hp -= HP_DAMAGE;

                // background flash
                this.flashUntil = this.frame + FLASH_DURATION;

                // letter flash
                state.on = false;
                state.flashUntil = this.flashUntil;
                state.graceUntil = this.frame + EXPIRED_KEY_GRACE_FRAMES;
                state.cooldownUntil = this.frame + KEY_COOLDOWN_FRAMES;
            }
        }
    }

    // calculate current spawn interval based on dynamic difficulty
    spawnInterval() {
        return Math.max(
            MIN_SPAWN_INTERVAL, 
            Math.floor(SPAWN_INTERVAL / this.difficulty)
        );
    }

    // calculate current key lifetime based on dynamic difficulty
    keyLifetime() {
        return Math.max(
            MIN_KEY_LIFETIME, 
            Math.floor(KEY_LIFETIME / this.difficulty)
        );
    }

    // rolling average of WPM over last few seconds
    computeWpm() {
        if (this.hitTimestamps.length === 0) return 0;

        this.trimHitTimestamps();

        if (this.hitTimestamps.length === 0) return 0;

        const lastHitFrame = this.hitTimestamps[this.hitTimestamps.length - 1];
        const elapsed = Math.max(lastHitFrame - this.hitTimestamps[0], MIN_WPM_FRAMES);

        const minutes = elapsed / (60 * 60);

        return Math.round((this.hitTimestamps.length / KEYS_PER_WORD) / minutes);
    }

    updateDisplayedWpm(force) {
        if (!force && this.frame - this.lastWpmUpdateFrame < WPM_UPDATE_FRAMES) return;

        this.displayWpm = this.computeWpm();
        this.lastWpmUpdateFrame = this.frame;
    }

    trimHitTimestamps() {
        const windowStart = this.frame - WPM_WINDOW_FRAMES;

        while (this.hitTimestamps.length > 0 && this.hitTimestamps[0] < windowStart) {
            this.hitTimestamps.shift();
        }
    }

    checkGameOver() {
        if (this.hp <= 0) {
            this.hp = 0;
            this.gameOver = true;
            this.gameOverFrame = this.frame;
            this.finalWpm = this.displayWpm;
            this.previousHighScore = readHighScore();
            this.newHighScore = this.score > this.previousHighScore;

            if (this.newHighScore) {
                writeHighScore(this.score);
            }
        }
    }

    // updates game logic while gameplay is active
    update() {
        this.frame++;

        if (this.titleScreen || this.gameOver) return;

        this.playFrames++;
        this.difficulty += DIFFICULTY_RAMP;

        if (this.frame % this.spawnInterval() === 1) {
            this.spawnKey();
        }

        this.updateDisplayedWpm(false);
        this.expireKeys();
        this.checkGameOver();
    }

    drawBackground() {
        this.ctx.save();

        const flash = !this.gameOver && this.frame < this.flashUntil;
        this.ctx.fillStyle = flash ? COLOR_FLASH : COLOR_BG;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.restore();
    }

    // draws an active key as bold with a slowly draining progress bar
    drawOnKey(x, y, size, letter, progress) {
        this.ctx.save();

        const blackH = Math.round(size * (1 - progress));
        const grayH = size - blackH;

        this.ctx.fillStyle = COLOR_KEY_DRAIN;
        this.ctx.fillRect(x, y, size, grayH);

        this.ctx.fillStyle = COLOR_KEY_ON;
        this.ctx.fillRect(x, y + grayH, size, blackH);

        this.ctx.fillStyle = COLOR_LETTER_ON;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letter, x + size / 2, y + size / 2);

        this.ctx.restore();
    }

    // draws an inactive key in light gray, or red if flashing
    drawOffKey(x, y, size, letter, flash) {
        this.ctx.save();

        this.ctx.fillStyle = flash ? COLOR_KEY_FLASH : COLOR_KEY_OFF;
        this.ctx.fillRect(x, y, size, size);

        this.ctx.fillStyle = flash ? COLOR_LETTER_FLASH : COLOR_LETTER_OFF;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letter, x + size / 2, y + size / 2);

        this.ctx.restore();
    }

    // keyboard layout
    drawKeyboard() {
        this.ctx.save();

        const keySize = Math.min(this.width / 12, this.height / 6);
        const gap = keySize * 0.15;
        const fontSize = keySize * 0.6;
        const startY = keySize * 0.5;
        const lifetime = this.keyLifetime();

        this.ctx.font = `bold ${fontSize}px monospace`;

        for (let r = 0; r < KEYBOARD.length; r++) {
            const row = KEYBOARD[r];
            const offsetX = KEYBOARD_ROW_OFFSETS[r] * (keySize + gap);
            const y = startY + r * (keySize + gap);

            for (let c = 0; c < row.length; c++) {
                const key = row[c];
                const x = offsetX + c * (keySize + gap);
                const state = this.keys[key];

                if (state.on) {
                    const elapsed = this.frame - state.startFrame;
                    const progress = Math.min(elapsed / lifetime, 1);

                    this.drawOnKey(x, y, keySize, key, progress);
                } else {

                    const flash = !this.gameOver && this.frame < state.flashUntil;
                    this.drawOffKey(x, y, keySize, key, flash);
                }
            }
        }

        this.ctx.restore();
    }

    drawHud() {
        // calculate score metrics
        const wpm = this.gameOver ? this.finalWpm : this.displayWpm;
        const totalSec = Math.floor(this.playFrames / 60);
        const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const secs = String(totalSec % 60).padStart(2, '0');

        // fixed-width padding in case number of digits changes
        const wpmPadded = String(wpm).padEnd(3, ' ');
        const scorePadded = String(this.score).padEnd(5, ' ');

        // draw the scores centered along the bottom of the screen
        this.ctx.save();

        const fontSize = Math.min(this.width / 12, this.height / 6) * 0.6;
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = COLOR_SCORE;

        this.ctx.fillText(
            `SCORE: ${scorePadded} WPM: ${wpmPadded}  TIME: ${mins}:${secs}`,
            this.width/2,
            this.height - 10
        );

        this.ctx.restore();
    }

    // game over screen with final scores
    drawGameOver() {
        this.ctx.save();

        const bigFont = Math.min(this.width / 8, this.height / 4);

        this.ctx.font = `bold ${bigFont}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_GAME_OVER;

        this.ctx.fillText(
            'GAME OVER',
            this.width / 2,
            this.height / 2 - bigFont * 0.4
        );

        const framesSinceOver = this.frame - this.gameOverFrame;

        if (framesSinceOver >= GAME_OVER_DELAY) {
            const smallFont = bigFont * 0.35;

            this.ctx.font = `${smallFont}px monospace`;
            this.ctx.fillStyle = COLOR_CONTINUE;
            this.ctx.globalAlpha = promptThrobAlpha(this.frame - this.gameOverFrame);

            this.ctx.fillText(
                'Press any key to continue',
                this.width / 2,
                this.height / 2 + bigFont * 0.6
            );
        }

        const scoreFont = bigFont * 0.22;
        const previousBest = `PREVIOUS HIGH SCORE: ${this.previousHighScore}`;

        this.ctx.globalAlpha = 1;
        this.ctx.font = `${scoreFont}px monospace`;
        this.ctx.fillStyle = COLOR_SCORE;

        this.ctx.fillText(
            previousBest,
            this.width / 2,
            this.height / 2 + bigFont * 1.4
        );

        if (this.newHighScore) {
            this.ctx.fillText(
                'NEW HIGH SCORE!',
                this.width / 2,
                this.height / 2 + bigFont * 1.9
            );
        }

        this.ctx.restore();
    }

    // horizontal HP bar across the screen underneath the keyboard
    drawHpBar() {
        this.ctx.save();

        const keySize = Math.min(this.width / 12, this.height / 6);
        const gap = keySize * 0.15;
        const startY = keySize * 0.5;

        const barY = startY + 4 * (keySize + gap) + gap;
        const barWidth = this.width * 0.9;
        const barHeight = keySize * 0.35;
        const barX = (this.width - barWidth) / 2;

        // fill the bar based on HP percentage
        const fraction = this.hp / MAX_HP;
        const filledW = Math.round(barWidth * fraction);
        const emptyW = barWidth - filledW;
        let fillColor = COLOR_HP_FULL;

        if (!this.gameOver && this.frame < this.hpHealFlashUntil) {
            const progress = (this.hpHealFlashUntil - this.frame) / HP_HEAL_FLASH_DURATION;
            fillColor = mixColor(COLOR_HP_FULL, COLOR_HP_HEAL, progress);
        } else if (!this.gameOver && this.hp <= LOW_HP_WARNING_THRESHOLD) {
            const danger = LOW_HP_WARNING_THRESHOLD - this.hp + 1;
            const speed = 0.07 + 0.05 * danger;
            const pulse = 0.5 - 0.5 * Math.cos(this.frame * speed);
            const strength = Math.min(0.25 + 0.2 * danger + pulse * (0.2 + 0.12 * danger), 1);

            fillColor = mixColor(COLOR_HP_FULL, COLOR_HP_DANGER, strength);
        }

        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(barX, barY, filledW, barHeight);
        this.ctx.fillStyle = COLOR_HP_EMPTY;
        this.ctx.fillRect(barX + filledW, barY, emptyW, barHeight);

        // also display the numeric hp value
        const fontSize = barHeight * 0.8;

        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_LETTER_ON;

        this.ctx.fillText(
            `${this.hp}/${MAX_HP} HP`,
            barX + barWidth / 2,
            barY + barHeight / 2
        );

        this.ctx.restore();
    }

    // title card screen
    drawTitleScreen() {
        this.ctx.save();

        const bigFont = Math.min(this.width / 8, this.height / 4);

        this.ctx.font = `bold ${bigFont}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = COLOR_SCORE;

        this.ctx.fillText(
            'Whack-A-Key',
            this.width / 2,
            this.height / 2 - bigFont * 0.4
        );

        const smallFont = bigFont * 0.35;

        this.ctx.font = `${smallFont}px monospace`;
        this.ctx.fillStyle = COLOR_CONTINUE;
        this.ctx.globalAlpha = promptThrobAlpha(this.frame);

        this.ctx.fillText(
            'Press any key to start',
            this.width / 2,
            this.height / 2 + bigFont * 0.6
        );

        this.ctx.restore();
    }

    draw() {
        this.drawBackground();

        if (this.titleScreen) {
            this.drawTitleScreen();
        } else if (this.gameOver) {
            this.drawGameOver();
            this.drawHud();
        } else {
            this.drawKeyboard();
            this.drawHpBar();
            this.drawHud();
        }
    }

    keydown(e) {
        if (hasModifierKey(e)) {
            return;
        }

        // grab the key, ignore case
        const key = e.key.toUpperCase();

        // title screen state
        if (this.titleScreen) {
            if (this.keys[key] || isControlKey(key)) {
                this.reset();
                this.titleScreen = false;
            }
            return;
        }

        // game over state
        if (this.gameOver) {
            const framesSinceOver = this.frame - this.gameOverFrame;

            if (this.keys[key] || isControlKey(key)) {
                if (framesSinceOver >= GAME_OVER_DELAY) {
                    keypressSounds.play();
                    this.reset();
                    this.titleScreen = false;
                }
            }
            return;
        }

        // main gameplay state
        if (!this.keys[key]) {
            return;
        }

        keypressSounds.play();

        const state = this.keys[key];

        if (state.on) {
            // handle a successful hit
            state.on = false;
            state.cooldownUntil = this.frame + KEY_COOLDOWN_FRAMES;
            this.score += HIT_REWARD;
            this.hitTimestamps.push(this.frame);
            this.trimHitTimestamps();
            this.updateDisplayedWpm(false);
            this.hitsSinceHeal++;

            if (this.hitsSinceHeal >= HP_HEAL_INTERVAL) {
                this.hitsSinceHeal = 0;

                if (this.hp < MAX_HP) {
                    this.hp = Math.min(MAX_HP, this.hp + HP_HEAL_AMOUNT);
                    this.hpHealFlashUntil = this.frame + HP_HEAL_FLASH_DURATION;
                }
            }
        } else {
            const inExpiredKeyGrace = this.frame <= state.graceUntil;

            // handle an eroneous key
            this.flashUntil = this.frame + FLASH_DURATION;
            state.flashUntil = this.flashUntil;

            if (!inExpiredKeyGrace) {
                this.score = Math.max(0, this.score - MISS_PENALTY);
                this.hp -= HP_DAMAGE;
                this.checkGameOver();
            }

        }
    }
}

// initialize the canvas and game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keypressSounds = new KeypressSounds();
const game = new Game(ctx, canvas.clientWidth, canvas.clientHeight);
document.addEventListener('keydown', (e) => game.keydown(e));

// run the main loop in a fixed-time accumulator
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
