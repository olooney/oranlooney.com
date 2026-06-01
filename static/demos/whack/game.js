// --- Gameplay ---
const SPAWN_INTERVAL = 30;
const MIN_SPAWN_INTERVAL = 4;

const KEY_LIFETIME = 240;
const MIN_KEY_LIFETIME = 30;

const FLASH_DURATION = 5;
const MISS_PENALTY = 1;
const HIT_REWARD = 1;
const TICK_RATE = 1000 / 60;
const KEYS_PER_WORD = 5;
const WPM_WINDOW = 30 * 60;
const DIGIT_SPAWN_WEIGHT = 0.333;
const GAME_OVER_DELAY = 2 * 60;
const DIFFICULTY_RAMP = 0.0001;
const MAX_HP = 10;
const HP_DAMAGE = 1;
const HP_HEAL_AMOUNT = 1;
const HP_HEAL_INTERVAL = 10;

// --- Colors ---
const COLOR_HP_FULL = '#222222';
const COLOR_HP_EMPTY = '#666666';
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
        this.hitTimestamps = [];
        this.hp = MAX_HP;
        this.hitsSinceHeal = 0;
        this.playFrames = 0;
        this.titleScreen = true;

        this.keys = {};
        for (const k of ALL_KEYS) {
            this.keys[k] = { on: false, startFrame: 0, flashUntil: 0 };
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

            // flip the key on and start the drain animation
            this.keys[key].on = true;
            this.keys[key].startFrame = this.frame;
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

        const windowStart = Math.max(0, this.frame - WPM_WINDOW);
        const recentHits = this.hitTimestamps.filter(t => t >= windowStart);

        if (recentHits.length === 0) return 0;

        const earliest = Math.max(windowStart, this.hitTimestamps[0]);
        const elapsed = this.frame - earliest;

        if (elapsed <= 0) return 0;

        const minutes = elapsed / (60 * 60);

        return Math.round((recentHits.length / KEYS_PER_WORD) / minutes);
    }

    checkGameOver() {
        if (this.hp <= 0) {
            this.hp = 0;
            this.gameOver = true;
            this.gameOverFrame = this.frame;
            this.finalWpm = this.computeWpm();
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
        const wpm = this.gameOver ? this.finalWpm : this.computeWpm();
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

            this.ctx.fillText(
                'Press any key to continue',
                this.width / 2,
                this.height / 2 + bigFont * 0.6
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
        this.ctx.fillStyle = COLOR_HP_FULL;
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
        // grab the key, ignore case
        const key = e.key.toUpperCase();

        // title screen state
        if (this.titleScreen) {
            if ( this.keys[key] || key === ' ' || key === 'Enter' ) {
                this.reset();
                this.titleScreen = false;
            }
            return;
        }

        // game over state
        if (this.gameOver) {
            const framesSinceOver = this.frame - this.gameOverFrame;

            if ( this.keys[key] || key === ' ' || key === 'Enter' ) {
                if (framesSinceOver >= GAME_OVER_DELAY) {
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

        if (this.keys[key].on) {
            // handle a successful hit
            this.keys[key].on = false;
            this.score += HIT_REWARD;
            this.hitTimestamps.push(this.frame);
            this.hitsSinceHeal++;

            if (this.hitsSinceHeal >= HP_HEAL_INTERVAL) {
                this.hitsSinceHeal = 0;
                this.hp = Math.min(MAX_HP, this.hp + HP_HEAL_AMOUNT);
            }
        } else {
            // handle an eroneous key
            this.score = Math.max(0, this.score - MISS_PENALTY);
            this.hp -= HP_DAMAGE;
            this.flashUntil = this.frame + FLASH_DURATION;
            this.keys[key].flashUntil = this.flashUntil;
            this.checkGameOver();

        }
    }
}

// initialize the canvas and game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
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
