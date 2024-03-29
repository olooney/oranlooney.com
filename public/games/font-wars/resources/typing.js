/* Font Wars Game Code
Copyright 2011, Oran Looney
MIT License, see README
*/

$(function() { 

    var reticleSvg = '<svg id="color-fill" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="300" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon class="hex" points="300,150 225,280 75,280 0,150 75,20 225,20"></polygon></svg>';

    var words = ['still', 'loading', 'words'];

    $.get('resources/words.txt', function(data) {
        words = data.split('\n')
            .map(word => word.trim())
            .filter(word => word);
    });

    var alphabet = 'abcdefghijklmnopqrstuvwxyz';


    var fonts = [
        'Arimo', 'PT Serif', 'Dancing Script', 'Kreon', 'IM Fell DW Pica', 'Goudy Bookletter 1911',
        'Buda', 'Bentham', 'Tangerine', 'Copse', 'Orbitron', 'Geo', 'Calligraffitti', 'Philosopher', 
        'Crimson Text', 'Molengo', 'Veteran Typewritter', 'Bandriya', 'Manifestor', 'TheGoodMonolith'
    ];

    var loadingScreen = true;
    var gameOver = false;
    var points = 0;
    var multiplier = 1;
    var hits = 0;
    var misses = 0;
    var startTime = new Date();

    var bullets = ['.', ':', '|', '!', '$', '| |', '! !', '$ $'];
    bullet = bullets[0];

    function setMultiplier(newMultipier) {
        var oldMultiplier = multiplier || 1;
        multiplier = Math.max(newMultipier || 1, 1);
        if ( multiplier > 50 ) multiplier = 50;

        // change ammunition type
        var bulletIndex = Math.min(Math.floor(multiplier/5), bullets.length-1);
        bullet = bullets[bulletIndex];

        if ( multiplier <= 1 ) {
            return '';
        } else if ( multiplier === 5 || (multiplier % 10 === 0) ) {
            return 'level up!';
        } else if ( multiplier > oldMultiplier ) {
            return multiplier + 'X';
        } else {
            return '';
        }
    }
    setMultiplier(1);

    function initSound() { 
        // priority list - load these first!
        sound.music.load('fast', 'resources/sounds/Speed_Kills_1.ogg');
        sound.fx.load('hit.', 'resources/sounds/39459__THE_bizniss__laser.ogg', 0.6, 7);
        sound.fx.load('kill', 'resources/sounds/91924__Benboncan__Till_With_Bell.ogg');
        sound.fx.load('miss','resources/sounds/476177__unadamlar__wrong-choice.wav', 1.0);

        sound.fx.load('hit:', 'resources/sounds/39456__THE_bizniss__laser_2.ogg', 0.8, 7);
        sound.fx.load('hit|', 'resources/sounds/191594__leszek-szary__laser.wav', 0.8, 7);
        sound.fx.load('hit!', 'resources/sounds/39458__THE_bizniss__laser_4.ogg', 0.6, 7);
        sound.fx.load('hit$', 'resources/sounds/151022__bubaproducer__laser-shot-silenced.wav', 0.8, 7);

        // double blasters are the same sound but louder
        sound.fx.load('hit| |', 'resources/sounds/191594__leszek-szary__laser.wav', 1.0, 7);
        sound.fx.load('hit! !', 'resources/sounds/39458__THE_bizniss__laser_4.ogg', 0.9, 7);
        sound.fx.load('hit$ $', 'resources/sounds/151022__bubaproducer__laser-shot-silenced.wav', 1.0, 7);

        sound.fx.load('die', 'resources/sounds/33245__ljudman__grenade.ogg');

        sound.music.load('ending', 'resources/sounds/erase-it.ogg');
    }

    // shared logic to calculate the incoming speed of enemies
    function getAttackSpeed() {
        var danger = attackingWordCount();
        return 10000 + 1000*danger - 5*hits;
    }


    $.fn.startsWith = function(letter) {
        return this.filter(function() {
            return ( $(this).html().charAt(0).toLowerCase() === letter.toLowerCase() );
        });
    }

    // take the single lowest element closest to another
    $.fn.nearest = function(target) { 
        var minD = Infinity, nearestEl;
        this.each(function() {
            var d = distance(this, target);
            if ( d < minD ) {
                minD = d;
                nearestEl = this;
            }
        });
        return $(nearestEl);
    }

    // rotate an element to point at another
    $.fn.pointAt = function(target) { 
        target = pos(target);
        $(this).each(function() {
            var p = $(this).position();
            var dx = target.left - p.left;
            var dy = p['top'] - target['top'];
            var angle = Math.atan(dy/dx);
            if ( dx < 0 ) angle += Math.PI;
            // that's the angle in the usual coordinates... but rotate
            // specifies a clockwise rotation starting 90 degrees off.
            rotateAngle = -(angle - Math.PI/2);

            var rotate = 'rotate(' + (rotateAngle * 180/Math.PI) + 'deg)';
            $(this).css({ 
                '-webkit-transform': rotate,
                '-moz-transform': rotate,
                'transform': rotate 
            });
        });
        return this;
    }

    $.fn.center = function() {
        this.css("position","absolute");
        this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
        this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
        return this;
    }


    Array.prototype.random = function() {
        return this[ Math.floor(Math.random() * this.length) ]
    }

    // creates a new sprite on the document
    function newSprite(cls, content) { 
        var sprite = document.createElement('div');
        sprite.innerHTML = content;
        sprite.className = 'sprite ' + cls;
        $('body').append(sprite);
        return sprite;
    }

    // shows a message coming up off an element and fading away
    $.fn.sparkScore = function(score) {
        $(this).each(function() {
            var particle = newSprite('spark-score', score);
            var initialPosition = alignCenters(this, particle);
            $(particle).css(initialPosition);
            $(particle).css({ opacity: 0.8 });
            $(particle).animate({
                'top': initialPosition['top'] - 50,
                'left': initialPosition['left'],
                opacity: 'hide'
            }, 1000, 'linear', function() { 
                $(particle).remove(); 
            });
        });
    }

    // targeting reticle is a hexagon that animates to
    // show the player where the word they are typing is on the
    // screen. Mostly useful to prevent confusion after hitting
    // the wrong key and starting an unexpected word.
    $.fn.reticle = function() {
        $(this).each(function() {
            var reticle = newSprite('reticle', reticleSvg);
            var initialPosition = alignCenters(this, reticle); 
            $(reticle).css(initialPosition);
            $(reticle).addClass('zoom-in');
            $(reticle).animate( alignCenters(spaceship, reticle), getAttackSpeed(), 'linear');
            setTimeout(function() {
                $(reticle).remove();
            }, 500);
        });
    }

    // spark off a single letter
    $.fn.spark = function(letter, duration, distance) {
        if ( !duration ) duration = 500;
        if ( !distance ) distance = 100;
        $(this).each(function() {
            var particle = newSprite('spark', letter);
            var initialPosition = alignCenters(this, particle);
            var angle = Math.random() * 2 * Math.PI;
            $(particle).css({
                'top': initialPosition['top'] + Math.round(20 * Math.cos(angle)),
                'left': initialPosition['left'] + Math.round(20 * Math.sin(angle))
            });
            $(particle).css({ opacity: 0.8 });
            $(particle).animate({
                'top': initialPosition['top'] + Math.round(distance * Math.cos(angle)),
                'left': initialPosition['left'] + Math.round(distance * Math.sin(angle)),
                opacity: 'hide'
            }, duration, 'linear', function() { 
                $(particle).remove(); 
            });
        });
    }

    $.fn.explode = function(letters, duration, distance) {
        if ( !distance ) distance = 100;
        if ( !duration ) duration = 1000;
        for ( var i=0; i < letters.length; i++ ) {
            $(this).spark( letters.charAt(i), duration, Math.floor(distance + 200 * Math.random()) );
        }
    }


    var spaceship = newSprite('spaceship', 'A');
    $(spaceship).css({
            'position' : 'absolute',
            'left' : '50%',
            'top' : '50%',
            'margin-left' : function() {return -$(this).outerWidth()/2},
            'margin-top' : function() {return -$(this).outerHeight()/2}
    }).hide();

    function alignCenters(target, mover) {
        target = $(target);
        mover = $(mover);
        var p = target.position();
        p.top = p.top + Math.floor(target.height()/2);
        p.left = p.left + Math.floor(target.width()/2);
        p.top = p.top - Math.floor(mover.height()/2);
        p.left = p.left - Math.floor(mover.width()/2);
        return p;
    }

    var instructions = newSprite('instructions', [
        '<h1>Font Wars</h1><br>',
        /*
        'Rules:<br>',
        '<ol><li>Type words as they appear</li>',
        '<li>The currently targeted word is underlined</li>',
        '<li>Hit Space, Backspace, or Esc to cancel targeting</li>',
        '<li>Complete words to increase score multiplier</li>',
        '<li>The multiplier resets after every mistake</li>',
        '<li>The game ends when any word reaches you</li>',
        '</ol>',
        */
        '<p>Press Space to begin<p>'
    ].join(''));
    $(instructions).css({
            'position' : 'absolute',
            'left' : '50%',
            'top' : '50%',
            'margin-left' : function() {return -$(this).outerWidth()/2},
            'margin-top' : function() {return -$(this).outerHeight()/2}
    });

    var score = newSprite('score', '');
    $(score).css({ opacity: 0.7 });

    var muteFx = newSprite('mute-fx', 'Mute Effects');
    function toggleMuteFx() {
        if ( $(muteFx).html() === 'Mute Effects' ) {
            sound.fx.mute();
            $(muteFx).html('Unmute Effects');
            $.cookie('font-wars-fx-muted', true);
        } else {
            sound.fx.unmute();
            $(muteFx).html('Mute Effects');
            $.cookie('font-wars-fx-muted', null);
        }
    }
    $(muteFx).css({ opacity: 0.7 }).click(toggleMuteFx);
    if ( $.cookie('font-wars-fx-muted') ) {
        toggleMuteFx();
    }

    var muteMusic = newSprite('mute-music', 'Mute Music');
    function toggleMuteMusic() {
        if ( $(muteMusic).html() === 'Mute Music' ) {
            sound.music.mute();
            $(muteMusic).html('Unmute Music');
            $.cookie('font-wars-music-muted', true);
        } else {
            sound.music.unmute();
            $(muteMusic).html('Mute Music');
            $.cookie('font-wars-music-muted', null);
        }
    }
    $(muteMusic).css({ opacity: 0.7 }).click(toggleMuteMusic);
    if ( $.cookie('font-wars-music-muted') ) toggleMuteMusic();

    function updateScore() {
        var minutes = (new Date() - startTime) / 6e4;
        if ( minutes < 0.1 ) { 
            var wpm = 0;
        } else {
            var words = hits / 5;
            var wpm = Math.floor(words/minutes);
        }

        if ( hits == 0 ) {
            var accuracy = 0;
        } else {
            var accuracy = Math.floor(100 * hits / (hits + misses));
        }
        

        var x = ' ' + multiplier + 'x';
        if ( gameOver ) {
            x = '';
            var seconds = Math.floor((new Date() - startTime)/1000);
            var minutes = Math.floor(seconds/60);
            var seconds = seconds - minutes * 60;
            var duration = minutes + ' minutes ' + seconds + ' seconds';
            var highScoreMessage = handleHighScore();
            $(score).html('<b>' + points + ' Points</b><br>' + highScoreMessage + wpm + ' WPM<br>' + accuracy + '% Accuracy<br>' + duration);
        } else {
            $(score).html(points + ' Points<br>' + multiplier + 'x Multiplier<br>' + wpm + ' WPM<br>' + accuracy + '% Accuracy');
        }
    }
    updateScore();

    function handleHighScore() {
        var message = '';
        var previousHighScore = $.cookie('font-wars-high-score') || 0;
        if ( points > previousHighScore ) {
            $.cookie('font-wars-high-score', points, { expires: 999, path: '/' });
            message = '<b>New High Score!</b><br>';
        } else if ( previousHighScore > 0 ) {
            message = 'Previous Best: ' + previousHighScore + '<br>';
        }
        return message;
    }


    function pos(any) {
        if ( !any['top'] || !any['left'] ) return $(any).position();
        else return any;
    }
    function distance(a,b) {
        a = pos(a);
        b = pos(b);
        var dx = (a.left - b.left);
        var dy = (a['top'] - b['top']);
        return Math.sqrt( dx*dx + dy*dy );
    }

    function attackingWordCount() {
        var chars = 0;
        $('.enemy').each(function() {
            chars += $(this).html().replace(/[^a-zA-Z']/g, '').length;
        });
        return Math.floor(chars/5);
    }

    function spawn() {
        if ( gameOver ) return;

        // ambiguous starting letters are annoying.
        var word = words.random();
        for ( var i=0; i<10; i++ ) {
            if ( $('.enemy').startsWith(word.charAt(0)).length ) {
                word = words.random();
            } else {
                break;
            }
        }
        
        var enemy = newSprite('enemy', word);
        
        var fast = (word.length <= 8) && (points > 1000) && (Math.random() < 0.15);
        var speed = fast ? 2 : 1.0;

        // use a random font for each enemy.
        var font = fonts.random();
        $(enemy).css({ 'font-family': "'" + font + "', serif" });
        if ( font === 'Tangerine' ) {
            $(enemy).css({ 'font-size': '48px' });
        }
        if ( fast ) {
            $(enemy).css({ 'color': 'red' });
        }

        var side = Math.floor(Math.random() * 4);
        if ( side == 0 ) { // top
            $(enemy).css({ "top": -32, left: Math.random() * $(window).width() });
        } else if ( side == 1 ) { // right
            $(enemy).css({ "left": $(window).width()+32, top: Math.random() * $(window).height() });
        } else if ( side == 2 ) { // bottom
            $(enemy).css({ "top": $(window).height() + 32, left: Math.random() * $(window).width() });
        } else { // left
            $(enemy).css({ "left": -32, top: Math.random() * $(window).height() });
        }

        // auto-balancing logic
        var danger = attackingWordCount();
        $(enemy).animate( alignCenters(spaceship, enemy), getAttackSpeed() / speed , 'linear', function() {
            // the player dies when an enemy reaches the spaceship.
            // the timeout is because we can't start the fade animation on this enemy from inside this callback.
            if ( $.contains(document.body, this) ) setTimeout(function() { die(); }, 1);
        });
        var spawnInterval = 200 + 400*danger - 2*hits + 100 - 200*Math.random();
        if ( spawnInterval < 500 ) spawnInterval = 500;
        setTimeout(spawn, spawnInterval);
    }

    function die() {
        sound.music.volume(0, 500);
        sound.fx.play('die');
        $(spaceship).explode(alphabet, 3000);
        $(spaceship).explode(alphabet.toUpperCase(), 3000);
        gameOver = true;

        updateScore();

        $('.enemy').stop();
        $('.enemy').animate({opacity: 'hide'}, 1000, 'linear', function() { $(this).remove(); });
        $(spaceship).animate({opacity: 0}, 2000, 'linear', function() {
            setTimeout(function() { 
                sound.music.play('ending', 1.0, 700);
                $(newSprite('game-over', 'Game Over'))
                    .css({ fontSize: '64px', width: '10em', opacity: 0 })
                    .css({
                        'position' : 'absolute',
                        'left' : '50%',
                        'top' : '50%',
                        'margin-left' : function() {return -$(this).outerWidth()/2},
                        'margin-top' : function() {return -$(this).outerHeight()/2}
                    })
                    .animate({ opacity: 1.0 }, 4000, undefined, function() {
                        $(score).css($(score).position()).animate({
                            opacity: 1.0,
                            "top": 80 + ( $(window).height() - $(score).height() ) / 2 + $(window).scrollTop() + "px",
                            left: ( $(window).width() - $(score).width() ) / 2 + $(window).scrollLeft() + "px",
                        }, 1500);
                    });
            }, 500);
        });
    }

    // target an enemy...
    $.fn.target = function() {
        this.addClass('target');
        this.reticle();
        this.siblings('.enemy').removeClass('target');
        $(spaceship).pointAt(this);
        return this;
    }

    // hit an enemy...
    $.fn.hit = function() {
        hits++;
        points += multiplier;
        sound.fx.play('hit' + bullet);
        $(newSprite('bullet', bullet))
            .css( $('.spaceship').position() )
            .pointAt(this)
            .animate( this.position(), distance(spaceship, this)/3, 'linear', function() { 
                $(this).remove();}
            );
        var letter = this.html().charAt(0);
        var newWord = this.html().slice(1);
        this.spark(letter);
        if ( newWord.length === 0 ) {
            sound.fx.play('kill');
            var msg = setMultiplier(multiplier+1);
            if ( msg ) this.sparkScore(msg);
            this.remove();
        } else {
            if ( !this.hasClass('target') ) this.target();
            this.html(newWord);
        }
        return this;
    }

    // oops, a bad character
    function miss(letter) { 
        misses++;

        // round down to the nearest 5, then go 5 lower
        setMultiplier(5*Math.floor(multiplier/5) - 5); 

        sound.fx.play('miss');
    }

    $(document).keydown(function(e) {
        $.cookie('debug-event-log', JSON.stringify({
            keyCode: e.keyCode,
            which: e.which,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey
        }));

        if ( gameOver ) {
            // not much to do...
        } else if ( loadingScreen ) {
            if ( e.which === 13 || e.keyCode === 32 ) {
                startTime = new Date();
                loadingScreen = false;
                initSound();
                $(spaceship).show();
                $(instructions).fadeOut(500);
                spawn();
                sound.music.loop('fast', 1.0, 10);

                // without this, Chrome leaves trails behind some fonts
                // as they move. This forces Chrome to redraw the background
                // 50 times a second and therefore work around this issue.
                /*
                setInterval(function() {
                    $('body').toggleClass('off-white');
                }, 50);
                */
            }
        } else if ( e.keyCode === 8 || e.keyCode === 32 || e.keyCode === 27 ) { 
            // space, backspace, or escape: reset the target reticle
            var targets = $('.enemy.target');
            if ( targets.length ) {
                targets.removeClass('target'); 
                updateScore();
            }
        } else if ( e.altKey || e.ctrlKey ) {
            // ignore modifier keys
        } else {
            // normal typing
            var key = e.which;
            var letter = '';
            if ( key > 64 && key < 91 ) {
                letter = String.fromCharCode(key + 32);
            } else if ( key === 222 ) {
                letter = "'"; // apostrophes are used in some words...
            } else {
                // non-handled keydown, do nothing
                return;
             }

            // shoot a letter off the targeted word, or start a new word
            var target = $('.enemy.target').first();
            if ( target.length ) {
                if ( target.startsWith(letter).length ) target.hit();
                else miss(letter);
            } else {
                var target = $('.enemy').startsWith(letter).nearest(spaceship);
                if ( target.length ) target.hit();
                else miss(letter);
            }
            updateScore();
        }
    });

});
