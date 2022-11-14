// global gravity constant
G = 0.5;

requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

// base class for the various states the game toggles between.
class GameState {
    update() { }
    draw(ctx) { }
    keydown(ev) { } 
}

// the game object delegates almost all behavior
// to the currently active game state. 
class Game extends GameState {
    constructor() { 
        super();
        this.height = 100;
        this.width = 100;
        this.started = false;
        this.over = false;
        this.frame = -1;
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
        // 'clear' the screen by drawing a solid blue rectangle over it
        ctx.fillStyle = '#7ec0ee';
        ctx.fillRect(0, 0, game.width, game.height);

        // delegrate the rest of the drawing to the current state.
        this.getState().draw(ctx);
    }

    keydown(ev) {
        this.getState().keydown(ev);
    }
};


// gameplay state. This keeps track of a set of Entities and delegates draw()
// and update() behavior to each entity, as well as checking for collisions
// between entities. keydown() events are handled directly.
class GamePlay extends GameState {
    constructor() {
        super();
        this.score = 0;
        this.entities = [];
    }

    update() {
        // spawn a new pipe at regular intervals
        if ( game.frame % 60 === 0 ) { 
            this.entities.push(new Pipe()); 
        } 

        // spawn a new coin at random
        if ( game.frame > 60*3 && (game.frame+30) % 60 === 0 ) { 
            if ( Math.random() < 0.333 ) { 
                this.entities.push(new Coin()); 
            }
        }

        // cull dead entities
        this.entities = this.entities.filter(function(e) { return !e.dead; });

        // allow each entity the opportunity to update themselves
        this.entities.forEach(function(e) { 
            if ( e.update ) { 
                e.update(); 
            } 
        });

        // handle interactions between objects
        this.collisions();

        // earn 1 point for every pipe passed
        this.entities.forEach(function(e) {
            if ( e.tag == 'pipe' ) {
                var pipe = e;
                if ( pipe.x === bird.x && !pipe.scored && !pipe.dead) {
                    pipe.scored = true;
                    game.play.score++;
                }
            }
        });

        // end the game if the bird goes off screen
        if ( bird.y > game.height || bird.y < 0 ) {
            sfx.play('dead');
            game.over = true;
        }
    }

    collisions() {
        // each entity can have multiple hitboxes, and any hitbox can
        // collide with any other hitbox. When a collision is detected,
        // both entities are given an opportunity to handle the collision.
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
        // first, draw all entities.
        this.entities.forEach(function(e) { if ( e.draw ) { e.draw(ctx); } });

        // next, draw the HUD (just a score counter in this case) on top.
        this.drawScore(ctx);
    }

    drawScore(ctx) {
        // draw the current score onto the HUD at a fixed location
        ctx.font = '32px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText(this.score, game.width - 70, game.height- 20);
    }

    keydown(ev) {
        // we handle only one key: the up arrow.
        if ( ev.keyCode == 38 ) {
            bird.flap();
        }
    }
}

// menu state
class GameMenu extends GameState {

    draw(ctx) {
        // the bird sprite is already visible on menu screen.
        bird.draw(ctx);

        // draw the instructions in big block letters across the middle
        ctx.font = '64px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText('PRESS UP', game.width/2 - 160, game.height/2);
    }

    keydown(ev) {
        if ( ev.keyCode == 38 ) {
            bird.dy = -5;
            game.started = true;
        }

        sfx.init();
    }
}

// game over state
class GameEnding extends GameState {
    update() {
        // the game over screen is only shown for at most two seconds and then
        // we return to the title screen.
        if ( !this.lastFrame ) {
            this.lastFrame = game.frame;
        }
        if ( game.frame > this.lastFrame + 60*2 ) {
            this.restart();
        }
    }

    draw(ctx) {
        ctx.font = '64px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText('GAME OVER', game.width/2 - 200, game.height/2);
        game.play.drawScore(ctx);
    }

    restart() {
        delete this.lastFrame;
        game.started = false;
        game.over = false;
        game.frame = -1;
        game.play.entities = [bird];
        game.play.score = 0;
        bird.y = 240;
        bird.dy = 0;
    }

    keydown(ev) {
        // you can skip the two second wait by pressing any key.
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
    tag = 'unknown';

    update() { }
    draw(ctx) { } 
}

// the global Bird entity.
class Bird extends Entity { 
    tag = 'bird';

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
            new Hitbox(this.x-20, this.y-20, 40, 40)
        ];
    }

    draw(ctx) {
        // body
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x-20, this.y-20, 40, 40);

        // wing 
        if ( Math.floor(game.frame / 20) % 2 ) {
            // down flap
            ctx.fillStyle = '#a00';
            ctx.fillRect(this.x-15, this.y-5, 20, 20);
        } else {
            // up flap
            ctx.fillStyle = '#a00';
            ctx.fillRect(this.x-15, this.y-15, 20, 15);
        }

        // eye
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x+7, this.y-10, 5, 5);

        // beak
        ctx.fillStyle = '#ffed5f';
        ctx.fillRect(this.x+8, this.y-5, 17, 5);
    }

    handleCollision(e2) {
        // the bird dies if it touches a pipe (ending
        // the game instantly) but earns a point if
        // it touches a coin.
        if ( e2.tag == 'pipe' ) {
            game.over = true;
            sfx.play('thud');
        } else if ( e2.tag == 'coin' ) {
            sfx.play('coin');
            game.play.score++;
            e2.dead = true;
        }
    }

    flap() {
        // flapping your wings always arrests all downward motion
        if ( this.dy > 0 ) this.dy = 0;

        // flapping your wings boosts your upward speed a bit.
        // multiple quick presses will be cumulative.
        this.dy += -10;

        // if the user holds the up arrow the bird goes shooting
        // off at a ridiculous rate. To fix this, we limit upwards
        // velocity.
        if ( this.dy < -18 ) this.dy = -18;
        
        sfx.play('flap');
    }
};


class Pipe extends Entity {
    tag = 'pipe';
    width = 40;
    gap = 180;

    constructor() {
        super();
        this.x = game.width;
        this.y = Math.floor(Math.random() * (game.height-200) + 100);
    }

    update() {
        this.x -= 5;
        if ( this.x < -this.width ) this.dead = true;
        this.hitboxes = [
            new Hitbox(this.x-this.width/2, 0, this.width, this.y-this.gap/2),
            new Hitbox(this.x-this.width/2, this.y+this.gap/2, this.width, game.height)
        ];
    }

    draw(ctx) {
        ctx.fillStyle = '#080';
        ctx.fillRect(this.x-this.width/2, 0, this.width, this.y-this.gap/2);
        ctx.fillRect(this.x-this.width/2, this.y+this.gap/2, this.width, game.height);
    }
}

class Coin extends Entity {
    tag = 'coin';
    radius = 20;
    gap = 180;

    constructor() {
        super();
        this.x = game.width;
        this.y = Math.floor(Math.random() * (game.height-200) + 100);
    }

    update() {
        this.x -= 5;
        if ( this.x < -this.width ) this.dead = true;
        this.hitboxes = [
            new Hitbox(this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2)
        ];
    }

    draw(ctx) {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.fill();
    }
}

class SoundEffects {
    constructor() {
        this.initialized = false;
    }

	library = {
		'dead' : { 
            url : 'sounds/dead.wav'
        },
		'coin' : { 
            url : 'sounds/coin.mp3',
            volume: 2.0
        },
		'thud' : { 
            url : 'sounds/thud.mp3',
            volume: 0.5
        },
		'flap' : { 
			url: 'sounds/flap.mp3',
			volume: 0.2
		}
    }

    // do not call until user interaction to avoid be supressed!
	init() {
        if ( this.initialized ) {
            return;
        } else {
            this.initialized = true;
        }

		this.context = new AudioContext();

		for ( var key in this.library ) {
			this.load(key);
		}
	}

    // load a sound file asyncronously
	load(name) {
	  let sound = this.library[name];

	  var request = new XMLHttpRequest();
	  request.open('GET', sound.url, true);
	  request.responseType = 'arraybuffer';

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


// global game initialization
game = new Game();

game.play = new GamePlay();
game.menu = new GameMenu();
game.ending = new GameEnding();

sfx = new SoundEffects();

bird = new Bird(100, 240);
game.play.entities.push(bird);


function mainLoop() {
    game.update();
    game.draw(canvasContext);
    requestAnimFrame(mainLoop);
}

window.onload = function() {
    canvasElement = document.getElementById('ctx');
    canvasContext= canvasElement.getContext('2d');

    game.height = canvasElement.height;
    game.width = canvasElement.width;

    document.addEventListener('keydown', function(ev) { 
        game.keydown(ev); 
    });

    requestAnimFrame(mainLoop);
};
