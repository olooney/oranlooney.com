// global gravity constant
const G = 0.5;
const UPDATE_HZ = 60;
const DELTA_TIME = 1000 / UPDATE_HZ;
const MAX_FRAME_TIME = 250;
const MAX_UPDATES_PER_FRAME = 3;

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

// fixed-timestep accumulator
let lastTime = 0;
let accumulator = 0;

// base class for the various states the game toggles between.
class GameState {
    update() { }
    draw(ctx) { }
    button() { }
}

// the game object delegates almost all behavior
// to the currently active game state. 
class Game extends GameState {
    constructor() { 
        super();
        this.height = null;
        this.width = null;
        this.started = false;
        this.over = false;
        this.frame = -1;
    }

    setSize(height, width) {
        this.height = height;
        this.width = width;
    }

    getState() {
        if ( !game.started ) return game.menu;
        if ( game.over ) return game.ending;
        return game.play;
    }

    update() {
        this.frame++;
        this.getState().update();
    }

    draw(ctx) {
        // clear the screen 
        ctx.save()
        ctx.fillStyle = "#7ec0ee";
        ctx.fillRect(0, 0, game.width, game.height);
        ctx.restore();

        this.getState().draw(ctx);
    }

    keydown(ev) {
        if ( ev.code === "Space" ) {
            this.button();
        }
    }

    click(ev) {
        if ( ev.button === 0 || ev.pointerType ) {
            this.button();
        }
    }

    button() {
        this.getState().button();
    }
};


// gameplay state. This keeps track of a set of Entities and delegates draw()
// and update() behavior to each entity, as well as checking for collisions
// between entities.
class GamePlay extends GameState {
    constructor() {
        super();
        this.score = 0;
        this.highScore = 0;
        this.entities = [];
    }

    update() {
        // spawn pipes periodically
        if ( game.frame % 60 === 0 ) { 
            this.entities.push(new Pipe()); 
        } 

        // occasionally spawn coins
        if ( game.frame > 60*3 && (game.frame+30) % 60 === 0 ) { 
            if ( Math.random() < 0.333 ) { 
                this.entities.push(new Coin()); 
            }
        }

        // clean up dead entities
        this.entities = this.entities.filter(e => !e.dead);

        // physics update for all entities
        this.entities.forEach(e => e.update());

        // handle pairwise collisions
        this.collisions();

        // score one point each time you pass through a pipe
        this.entities.forEach(function(e) {
            if ( e.tag == "pipe" ) {
                var pipe = e;
                if ( pipe.x === bird.x && !pipe.scored && !pipe.dead) {
                    pipe.scored = true;
                    game.play.score++;
                }
            }
        });

        // end the game if you go off the top or bottom
        if ( bird.y > game.height || bird.y < 0 ) {
            sfx.play("dead");
            sfx.music.stop();
            game.over = true;
        }
    }

    // a collision occurs if any hitbox of an entity touches any hitbox of
    // another. On collision, both entities are given an opportunity to handle
    // the collision. No attempt is made to deduplicate collisions.
    collisions() {
        var N = this.entities.length;
        for ( var i=0; i<N; i++ ) {
            var e1hbs = this.entities[i].hitboxes;
            for ( var j=i+1; j<N; j++ ) {
                var e2hbs = this.entities[j].hitboxes;
                for ( var k=0; k<e1hbs.length; k++ ) {
                    var a = e1hbs[k];
                    for ( var l=0; l<e2hbs.length; l++ ) {
                        var b = e2hbs[l];
                        if ( a.collidesWith(b) ) {
                            var e1 = this.entities[i];
                            var e2 = this.entities[j];
                            if ( e1.handleCollision ) {
                                e1.handleCollision(e2);
                            }
                            if ( e2.handleCollision ) {
                                e2.handleCollision(e1);
                            }
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        this.entities.forEach(function(e) { if ( e.draw ) { e.draw(ctx); } });
        this.drawScore(ctx);
    }

    drawScore(ctx) {
        ctx.font = "32px Arial";
        ctx.fillStyle = "#FFF";
        ctx.fillText(this.score, game.width - 70, game.height - 20);
    }

    button() {
        bird.flap();
    }
}

// menu state
class GameMenu extends GameState {
    draw(ctx) {
        bird.draw(ctx);
        this.drawTitle(ctx);
        this.drawInstructions(ctx);
        this.drawHighScore(ctx);
    }

    drawTitle(ctx) {
        ctx.save();
        ctx.font = "48px Arial";
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "center";

        ctx.fillText("PARABOLIC", game.width / 2, game.height / 4);
        ctx.fillText("RECTANGLE", game.width / 2, game.height / 4 + 48 + 4);
        ctx.restore();
    }

    drawInstructions(ctx) {
        ctx.save();
        ctx.font = "30px Arial";
        ctx.fillStyle = "#FFF";
        const action = isTouchDevice ? "TAP" : "CLICK OR SPACE";
        ctx.fillText(`${action} TO FLAP`, game.width / 2 - 160, game.height / 2 + 11);
        ctx.restore();
    }

    drawHighScore(ctx) {
        if (game.play.highScore > 0) {
            ctx.save();
            ctx.font = "32px Arial";
            ctx.fillStyle = "#FFF";
            ctx.fillText(game.play.highScore, game.width - 70, game.height - 20);
            ctx.restore();
        }
    }

    button() {
        bird.dy = -5;
        game.started = true;
        sfx.init();

        if (sfx.music) {
            sfx.music.start();
        }
    }

}

// game over state
class GameEnding extends GameState {
    update() {
        if ( !this.lastFrame ) {
            this.lastFrame = game.frame;
        }
        if ( game.frame > this.lastFrame + 60*2 ) {
            this.restart();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.font = "64px Arial";
        ctx.fillStyle = "#FFF";
        ctx.fillText("GAME OVER", game.width / 2 - 200, game.height / 2);
        game.play.drawScore(ctx);
        ctx.restore();
    }

    restart() {
        delete this.lastFrame;
        game.started = false;
        game.over = false;
        game.frame = -1;
        game.play.entities = [...scenery, bird];
        if (game.play.score > game.play.highScore) {
            game.play.highScore = game.play.score;
        }
        game.play.score = 0;
        bird.y = 240;
        bird.dy = 0;
    }

    button() {
        if ( game.frame > this.lastFrame + 10 ) {
            this.restart();
        }
    }
}

class Hitbox {
    constructor(x, y, w, h) {
        this.x = x; 
        this.y = y; 
        this.w = w; 
        this.h = h;
    }

    collidesWith(that) {
        var a = this;
        var b = that;
        return (
            a.x <= b.x + b.w &&
            b.x <= a.x + a.w &&
            a.y <= b.y + b.h &&
            b.y <= a.y + a.h
        );
    }
}

class Entity {
    tag = "unknown";
    hitboxes = [];

    update() { }
    draw(ctx) { } 
}

// the global Bird entity.
class Bird extends Entity { 
    tag = "bird";

    constructor(x, y) { 
        super();
        this.x = x;
        this.y = y;
        this.dy = 0;
    }

    update() {
        this.dy += G;
        this.y += this.dy;
        this.hitboxes = [
            new Hitbox(this.x - 20, this.y - 20, 40, 40)
        ];
    }

    draw(ctx) {
        ctx.fillStyle = "#f00";
        ctx.fillRect(this.x - 20, this.y - 20, 40, 40);

        if ( Math.floor(game.frame / 20) % 2 ) {
            ctx.fillStyle = "#a00";
            ctx.fillRect(this.x - 15, this.y - 5, 20, 20);
        } else {
            ctx.fillStyle = "#a00";
            ctx.fillRect(this.x - 15, this.y - 15, 20, 15);
        }

        ctx.fillStyle = "#000";
        ctx.fillRect(this.x + 7, this.y - 10, 5, 5);

        ctx.fillStyle = "#ffed5f";
        ctx.fillRect(this.x + 8, this.y - 5, 17, 5);
    }

    handleCollision(e2) {
        if ( e2.tag == "pipe" ) {
            game.over = true;
            sfx.play("thud");
            sfx.music.stop();
        } else if ( e2.tag == "coin" ) {
            sfx.play("coin");
            game.play.score++;
            e2.dead = true;
        }
    }

    flap() {
        if ( this.dy > 0 ) this.dy = 0;

        this.dy += -10;

        if ( this.dy < -18 ) this.dy = -18;
        
        sfx.play("flap");
    }
};


class Pipe extends Entity {
    tag = "pipe";
    width = 40;
    gap = 180;

    constructor() {
        super();
        this.x = game.width;
        this.y = Math.floor(Math.random() * (game.height - 200) + 100);
    }

    update() {
        this.x -= 5;
        if ( this.x < -this.width ) this.dead = true;
        this.hitboxes = [
            new Hitbox(this.x - this.width / 2, 0, this.width, this.y - this.gap / 2),
            new Hitbox(this.x - this.width / 2, this.y + this.gap / 2, this.width, game.height)
        ];
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "#080";

        // top and bottom pipes
        ctx.fillRect(this.x - this.width / 2, 0, this.width, this.y - this.gap / 2);
        ctx.fillRect(this.x - this.width / 2, this.y + this.gap / 2, this.width, game.height);

        // add pipe caps
        ctx.fillRect(this.x - this.width / 2 - 4, this.y - this.gap / 2 - 5, this.width + 8, 5);
        ctx.fillRect(this.x - this.width / 2 - 4, this.y + this.gap / 2, this.width + 8, 5);

        ctx.restore();
    }
}

class Coin extends Entity {
    tag = "coin";
    radius = 20;
    gap = 180;

    constructor() {
        super();
        this.x = game.width;
        this.y = Math.floor(Math.random() * (game.height - 200) + 100);
    }

    update() {
        this.x -= 5;
        if ( this.x < -this.width ) this.dead = true;
        this.hitboxes = [
            new Hitbox(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ];
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "#ff0";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

class Cloud extends Entity {
    tag = "cloud";

    constructor(x, y, scale, speed) {
        super();
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.speed = speed;
    }

    update() {
        this.x -= this.speed;

        if (this.x < -160 * this.scale) {
            this.x = game.width + 160 * this.scale;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

        const s = this.scale;
        ctx.fillRect(this.x, this.y, 80 * s, 24 * s);
        ctx.fillRect(this.x + 18 * s, this.y - 16 * s, 48 * s, 24 * s);
        ctx.fillRect(this.x + 58 * s, this.y - 8 * s, 64 * s, 24 * s);

        ctx.restore();
    }
}

class SoundEffects {
    constructor() {
        this.initialized = false;
    }

    library = {
        "dead" : { 
            url : "sounds/dead.wav"
        },
        "coin" : { 
            url : "sounds/coin.mp3",
            volume: 2.0
        },
        "thud" : { 
            url : "sounds/thud.mp3",
            volume: 0.5
        },
        "flap" : { 
            url: "sounds/flap.mp3",
            volume: 0.2
        }
    }

    async init() {
        if ( this.initialized ) {
            return;
        } else {
            this.initialized = true;
        }

        this.context = new AudioContext();

        if (this.context.state === "suspended") {
            await this.context.resume();
        }

        for ( var key in this.library ) {
            this.load(key);
        }

        if (!this.music) {
            this.music = new ChiptuneMusic(this.context);
            this.music.start();
        }
    }

    load(name) {
        let sound = this.library[name];

        var request = new XMLHttpRequest();
        request.open("GET", sound.url, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            sfx.context.decodeAudioData(request.response, function(newBuffer) {
                sound.buffer = newBuffer;
            });
        }

        request.send();
    }

    play(name) {
        var sound = this.library[name];

        if ( !sound || !sound.buffer ) return;

        var source = this.context.createBufferSource();
        source.buffer = sound.buffer;
        var volumeGain = this.context.createGain();
        volumeGain.gain.value = sound.volume || 1;

        volumeGain.connect(this.context.destination);
        source.connect(volumeGain);
        source.start(0);
    }
}

const song = [
    ['E5', 0.5], ['G5', 0.5], ['C6', 0.5], ['G5', 0.5],
    ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5],

    ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['F5', 0.5],
    ['G5', 1.0],

    ['E5', 0.5], ['G5', 0.5], ['C6', 0.5], ['E6', 0.5],
    ['D6', 0.5], ['C6', 0.5], ['A5', 0.5], ['G5', 0.5],

    ['F5', 0.5], ['A5', 0.5], ['D6', 0.5], ['C6', 0.5],
    ['G5', 1.0],
];

const frequencies = {
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.00,
    C6: 1046.50,
    D6: 1174.66,
    E6: 1318.51,
};

class ChiptuneMusic {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.tempo = 160;
        this.enabled = false;
        this.activeNodes = [];
        this.timeoutId = null;
    }

    start() {
        if (this.enabled) return;

        this.enabled = true;
        this.playLoop();
    }

    playLoop() {
        if (!this.enabled) return;

        const beat = 60 / this.tempo;
        let t = this.ctx.currentTime;

        for (const [note, beats] of song) {
            this.playNote(note, t, beats * beat);
            t += beats * beat;
        }

        const loopDelayMs = Math.max(0, (t - this.ctx.currentTime) * 1000);

        this.timeoutId = setTimeout(() => {
            this.timeoutId = null;
            this.playLoop();
        }, loopDelayMs);
    }

    playNote(note, startTime, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.value = frequencies[note];

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.03, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);

        this.activeNodes.push(osc);

        osc.onended = () => {
            this.activeNodes = this.activeNodes.filter(n => n !== osc);

            osc.disconnect();
            gain.disconnect();
        };
    }

    stop() {
        this.enabled = false;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        for (const node of this.activeNodes) {
            try {
                node.stop();
            } catch (e) {}
        }

        this.activeNodes = [];
    }
}


// global game initialization
const game = new Game();
game.play = new GamePlay();
game.menu = new GameMenu();
game.ending = new GameEnding();

// sound effects and music
const sfx = new SoundEffects();

// global entities
const bird = new Bird(100, 240);

const scenery = [
    new Cloud(80, 80, 1.3, 1.5),
    new Cloud(280, 140, 1.5, 1.4),
    new Cloud(520, 50, 1.1, 1.3),
    new Cloud(800, 250, 0.9, 1.2),
];
game.play.entities = [...scenery, bird];


function mainLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    let frameTime = timestamp - lastTime;
    lastTime = timestamp;

    // Prevent one long pause from causing hundreds of updates.
    frameTime = Math.min(frameTime, MAX_FRAME_TIME);

    accumulator += frameTime;

    let updatesThisFrame = 0;

    while (accumulator >= DELTA_TIME && updatesThisFrame < MAX_UPDATES_PER_FRAME) {
        game.update();
        accumulator -= DELTA_TIME;
        updatesThisFrame++;
    }

    // If the game cannot keep up, drop excess accumulated time.
    if (updatesThisFrame === MAX_UPDATES_PER_FRAME) {
        accumulator = 0;
    }

    game.draw(canvasContext);

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);

window.onload = function() {
    canvasElement = document.getElementById("game-canvas");
    canvasContext = canvasElement.getContext("2d");

    // once we have the canvas, we can set the correct size
    game.setSize(canvasElement.height, canvasElement.width);

    // bind input events
    document.addEventListener("keydown", ev => game.keydown(ev));
    document.addEventListener("pointerdown", ev => game.click(ev));

    requestAnimationFrame(mainLoop);
};
