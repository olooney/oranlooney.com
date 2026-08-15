/* Font Wars Game Code
Copyright 2026, Oran Looney
MIT License, see README
*/

$(function() { 

    var reticleSvg = '<svg id="color-fill" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="300" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon class="hex" points="300,150 225,280 75,280 0,150 75,20 225,20"></polygon></svg>';

    var words = ['still', 'loading', 'words', 'thank', 'you', 'for', 'being', 'patient'];
    var wordIndex = 0;

    $.get('resources/words.txt', function(data) {
        words = data.split('\n')
            .map(word => word.trim())
            .filter(word => word)
            .shuffle();
        wordIndex = 0;
    });

    var alphabet = 'abcdefghijklmnopqrstuvwxyz';


    var fonts = [
        'Arimo', 'PT Serif', 'Dancing Script', 'Kreon', 'IM Fell DW Pica', 'Goudy Bookletter 1911',
        'Buda', 'Bentham', 'Tangerine', 'Copse', 'Orbitron', 'Geo', 'Calligraffitti', 'Philosopher', 
        'Crimson Text', 'Molengo', 'Veteran Typewritter', 'Bandriya', 'Manifestor', 'TheGoodMonolith'
    ];

    var MAX_MULTIPLIER = 50;
    var FAST_WORD_INTERVAL = 7;
    var FAST_WORD_MAX_LENGTH = 8;
    var FAST_WORD_MIN_POINTS = 1000;
    var FAST_WORD_SPEED_MULTIPLIER = 1.8;
    var FAST_WORD_MULTIPLIER_BONUS = 2;
    var DIFFICULT_WORD_MIN_LENGTH = 10;
    var DIFFICULT_WORD_MULTIPLIER_BONUS = 2;
    var GAME_OVER_RESTART_DELAY_MS = 2000;
    var GAME_OVER_TITLE_FADE_MS = 1000;
    var FINAL_SCORE_FADE_MS = 500;
    var ACCURACY_BONUS_START_PERCENT = 95;
    var ACCURACY_BONUS_STEP = 0.2;
    var ACCURACY_BONUS_MAX_MULTIPLIER = 2.0;
    var WPM_BONUS_START = 30;
    var WPM_BONUS_STEP_WPM = 10;
    var WPM_BONUS_STEP = 0.1;
    var WPM_BONUS_MAX = 120;
    var SURVIVAL_BONUS_STEP_MINUTES = 1;
    var SURVIVAL_BONUS_STEP = 0.1;
    var SURVIVAL_BONUS_MAX_MULTIPLIER = 2.0;

    var BULLET_TIERS = [
        { min: 1, bullet: '.', sound: 'laser-1', volume: 0.6 },
        { min: 5, bullet: ':', sound: 'laser-2', volume: 0.8 },
        { min: 10, bullet: '^', sound: 'laser-3', volume: 0.8 },
        { min: 15, bullet: '!', sound: 'laser-4', volume: 0.7 },
        { min: 20, bullet: '$', sound: 'laser-5', volume: 0.6 },
        { min: 30, bullet: '^ ^', sound: 'laser-3', volume: 1.0 },
        { min: 40, bullet: '! !', sound: 'laser-4', volume: 0.9 },
        { min: 50, bullet: '$ $', sound: 'laser-5', volume: 1.0 }
    ];

    var loadingScreen = true;
    var gameOver = false;
    var gameOverAt = undefined;
    var paused = false;
    var pausedAt = undefined;
    var soundInitialized = false;
    var spawnGeneration = 0;
    var fastEligibleWords = 0;
    var points = 0;
    var multiplier = 1;
    var hits = 0;
    var hitTimes = [];
    var misses = 0;
    var missedLastKey = false;
    var startTime = new Date();

    var bulletTier = BULLET_TIERS[0];
    bullet = bulletTier.bullet;

    function getBulletTier(value) {
        for ( var i=BULLET_TIERS.length-1; i>=0; i-- ) {
            if ( value >= BULLET_TIERS[i].min ) return BULLET_TIERS[i];
        }
        return BULLET_TIERS[0];
    }

    function getBulletTierIndex(value) {
        for ( var i=BULLET_TIERS.length-1; i>=0; i-- ) {
            if ( value >= BULLET_TIERS[i].min ) return i;
        }
        return 0;
    }

    function setMultiplier(newMultipier) {
        var oldMultiplier = multiplier || 1;
        multiplier = Math.max(newMultipier || 1, 1);
        if ( multiplier > MAX_MULTIPLIER ) multiplier = MAX_MULTIPLIER;

        // change ammunition type
        bulletTier = getBulletTier(multiplier);
        bullet = bulletTier.bullet;

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

    function ensureSound() {
        if ( soundInitialized ) return;
        initSound();
        soundInitialized = true;
    }

    function initSound() { 
        // priority list - load these first!
        sound.music.load('fast', 'resources/sounds/Speed_Kills_1.ogg');
        sound.fx.load('laser-1', 'resources/sounds/39459__THE_bizniss__laser.ogg', 1.0, 7);
        sound.fx.load('kill', 'resources/sounds/91924__Benboncan__Till_With_Bell.ogg');
        sound.fx.load('miss','resources/sounds/476177__unadamlar__wrong-choice.wav', 1.0);

        sound.fx.load('laser-2', 'resources/sounds/39456__THE_bizniss__laser_2.ogg', 1.0, 7);
        sound.fx.load('laser-3', 'resources/sounds/191594__leszek-szary__laser.wav', 1.0, 7);
        sound.fx.load('laser-4', 'resources/sounds/39458__THE_bizniss__laser_4.ogg', 1.0, 7);
        sound.fx.load('laser-5', 'resources/sounds/151022__bubaproducer__laser-shot-silenced.wav', 1.0, 7);

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
        return this[ Math.floor(Math.random() * this.length) ];
    }

    Array.prototype.shuffle = function shuffle() {
        for (let i = this.length - 1; i > 0; i--) {
            // Generate a random index from 0 to i
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
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
            'margin-left' : 0,
            'margin-top' : 0,
            'opacity' : 0
        });

    function centerInWindow(mover) {
        mover = $(mover);
        return {
            top: Math.floor($(window).scrollTop() + ($(window).height() - mover.outerHeight()) / 2),
            left: Math.floor($(window).scrollLeft() + ($(window).width() - mover.outerWidth()) / 2)
        };
    }

    function centerSpaceship() {
        $(spaceship).css(centerInWindow(spaceship));
    }

    centerSpaceship();

    function centerOf(sprite) {
        sprite = $(sprite);
        var p = sprite.position();
        return {
            top: p.top + sprite.outerHeight()/2,
            left: p.left + sprite.outerWidth()/2
        };
    }

    function alignCenters(target, mover) {
        target = centerOf(target);
        mover = $(mover);
        return {
            top: Math.floor(target.top - mover.outerHeight()/2),
            left: Math.floor(target.left - mover.outerWidth()/2)
        };
    }

    var instructions = newSprite('instructions', [
        '<h1>Font Wars</h1>',
        '<p>Press Space to Begin</p>'
    ].join(''));

    var instructionsPopup = newSprite('instructions-popup', [
        '<div class="instructions-box">',
        '<button type="button" class="instructions-close">Close</button>',
        '<h2>Rules</h2>',
        '<ol><li>Type words as they appear</li>',
        '<li>The currently targeted word is underlined</li>',
        '<li>Hit Space, Backspace, or Esc to cancel targeting</li>',
        '<li>Complete words to increase score multiplier</li>',
        '<li>The multiplier drops after every mistake</li>',
        '<li>The game ends when any word reaches you</li>',
        '</ol>',
        '</div>'
    ].join(''));
    $(instructionsPopup).hide();
    function closeInstructions() {
        $(instructionsPopup).fadeOut(150, function() {
            if ( paused ) {
                $(pausedModal).fadeIn(150);
            }
        });
    }
    $(instructionsPopup).click(function(e) {
        if ( e.target === instructionsPopup ) {
            closeInstructions();
        }
    });
    $(instructionsPopup).find('.instructions-box').click(function(e) {
        e.stopPropagation();
    });
    $(instructionsPopup).find('.instructions-close').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeInstructions();
    });

    var pausedModal = newSprite('paused-modal', [
        '<div class="paused-box">',
        '<h2>Paused</h2>',
        '<p>Press Space to resume</p>',
        '</div>'
    ].join(''));
    $(pausedModal).hide();

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
    if ( $.cookie('font-wars-music-muted') ) {
        toggleMuteMusic();
    }

    var instructionsButton = newSprite('instructions-open', 'Instructions');
    $(instructionsButton).css({ opacity: 0.7 }).click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        pauseGame();
        $(pausedModal).hide();
        $(instructionsPopup).fadeIn(150);
    });

    function pruneHitTimes(now) {
        while ( hitTimes.length && now - hitTimes[0] > 10000 ) {
            hitTimes.shift();
        }
    }

    function calculateOverallWpm(now) {
        var minutes = (now - startTime) / 6e4;
        if ( minutes <= 0 ) {
            return 0;
        }
        return Math.floor((hits / 5) / minutes);
    }

    function calculateRecentWpm(now) {
        pruneHitTimes(now);
        var windowDuration = Math.min(10000, Math.max(now - startTime, 1));
        return Math.floor((hitTimes.length / 5) / (windowDuration / 6e4));
    }

    function formatBonusMultiplier(value) {
        if ( Math.abs(value - Math.round(value)) < 0.01 ) {
            return 'x' + Math.round(value);
        }
        return 'x' + value.toFixed(1);
    }

    function formatPoints(value) {
        return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function formatBonusPoints(value) {
        if ( value <= 0 ) {
            return '0';
        }
        return '+' + formatPoints(value);
    }

    function calculateFinalScore(basePoints, accuracy, wpm, elapsedMinutes) {
        var roundedAccuracy = Math.round(accuracy);
        var accuracyMultiplier = 1;
        if ( roundedAccuracy > ACCURACY_BONUS_START_PERCENT ) {
            accuracyMultiplier += (roundedAccuracy - ACCURACY_BONUS_START_PERCENT) * ACCURACY_BONUS_STEP;
        }
        if ( accuracyMultiplier > ACCURACY_BONUS_MAX_MULTIPLIER ) {
            accuracyMultiplier = ACCURACY_BONUS_MAX_MULTIPLIER;
        }

        var clampedWpm = Math.max(Math.min(wpm, WPM_BONUS_MAX), WPM_BONUS_START);
        var wpmMultiplier = 1 + Math.floor((clampedWpm - WPM_BONUS_START) / WPM_BONUS_STEP_WPM) * WPM_BONUS_STEP;
        wpmMultiplier = Math.round(wpmMultiplier * 10) / 10;

        var survivalMultiplier = 1 + Math.floor(elapsedMinutes / SURVIVAL_BONUS_STEP_MINUTES) * SURVIVAL_BONUS_STEP;
        if ( survivalMultiplier > SURVIVAL_BONUS_MAX_MULTIPLIER ) {
            survivalMultiplier = SURVIVAL_BONUS_MAX_MULTIPLIER;
        }

        var accuracyBonus = Math.round(basePoints * (accuracyMultiplier - 1));
        var afterAccuracy = basePoints + accuracyBonus;
        var wpmBonus = Math.round(afterAccuracy * (wpmMultiplier - 1));
        var afterWpm = afterAccuracy + wpmBonus;
        var survivalBonus = Math.round(afterWpm * (survivalMultiplier - 1));

        return {
            accuracyMultiplier: accuracyMultiplier,
            wpmMultiplier: wpmMultiplier,
            survivalMultiplier: survivalMultiplier,
            accuracyBonus: accuracyBonus,
            wpmBonus: wpmBonus,
            survivalBonus: survivalBonus,
            finalScore: afterWpm + survivalBonus
        };
    }

    function renderFinalScore(basePoints, accuracy, wpm, duration, elapsedMinutes, highScore) {
        var result = calculateFinalScore(basePoints, accuracy, wpm, elapsedMinutes);
        var highScoreValue = '';
        if ( highScore.previousBest > 0 ) {
            highScoreValue = formatPoints(highScore.previousBest);
        }
        var highScoreMessage = '';
        if ( highScore.isNew ) {
            highScoreMessage = '<tr class="score-new-high"><td colspan="4"><b>New High Score!</b></td></tr>';
        }
        return [
            '<table class="score-bonus">',
            '<tr><th colspan="2">Category</th><th>Bonus</th><th>Points</th></tr>',
            '<tr><td>Points</td><td></td><td></td><td>' + formatPoints(basePoints) + '</td></tr>',
            '<tr><td>Accuracy</td><td>' + accuracy + '%</td><td>' + formatBonusMultiplier(result.accuracyMultiplier) + '</td><td>' + formatBonusPoints(result.accuracyBonus) + '</td></tr>',
            '<tr><td>WPM</td><td>' + wpm + '</td><td>' + formatBonusMultiplier(result.wpmMultiplier) + '</td><td>' + formatBonusPoints(result.wpmBonus) + '</td></tr>',
            '<tr><td>Survival</td><td>' + duration + '</td><td>' + formatBonusMultiplier(result.survivalMultiplier) + '</td><td>' + formatBonusPoints(result.survivalBonus) + '</td></tr>',
            '<tr class="score-total"><td colspan="3">Total Score</td><td><b>' + formatPoints(result.finalScore) + '</b></td></tr>',
            '<tr class="score-best"><td>Previous Best</td><td></td><td></td><td>' + highScoreValue + '</td></tr>',
            highScoreMessage,
            '</table>'
        ].join('');
    }

    function calculateAccuracy() {
        if ( hits == 0 ) {
            return 0;
        }
        return Math.floor(100 * hits / (hits + misses));
    }

    function formatDuration(now) {
        var seconds = Math.floor((now - startTime)/1000);
        var minutes = Math.floor(seconds/60);
        seconds = seconds - minutes * 60;
        if ( seconds < 10 ) seconds = '0' + seconds;
        return minutes + ':' + seconds;
    }

    function elapsedMinutes(now) {
        return (now - startTime) / 6e4;
    }

    function renderFinalScoreCard() {
        var now = new Date();
        var wpm = calculateOverallWpm(now);
        var accuracy = calculateAccuracy();
        var duration = formatDuration(now);
        var finalScore = calculateFinalScore(points, accuracy, wpm, elapsedMinutes(now)).finalScore;
        var highScore = handleHighScore(finalScore);
        return [
            renderFinalScore(points, accuracy, wpm, duration, elapsedMinutes(now), highScore),
            '<div class="final-restart-prompt">Press Space to Restart</div>'
        ].join('');
    }

    function updateScore() {
        var now = new Date();
        var wpm = calculateRecentWpm(now);
        if ( gameOver ) {
            wpm = calculateOverallWpm(now);
        }
        var duration = formatDuration(now);
        var accuracy = calculateAccuracy();
        

        var x = ' ' + multiplier + 'x';
        if ( gameOver ) {
            return;
        } else {
            $(score).html(formatPoints(points) + ' Points<br>' + multiplier + 'x Multiplier<br>' + wpm + ' WPM<br>' + accuracy + '% Accuracy<br>' + duration + ' Survival');
        }
    }
    updateScore();

    setInterval(function() {
        if ( !loadingScreen && !gameOver && !paused ) {
            updateScore();
        }
    }, 1000);

    function handleHighScore(score) {
        var previousHighScore = $.cookie('font-wars-high-score') || 0;
        if ( score > previousHighScore ) {
            $.cookie('font-wars-high-score', score, { expires: 999, path: '/' });
            return { isNew: true, previousBest: previousHighScore };
        }
        return { isNew: false, previousBest: previousHighScore };
    }


    function pos(any) {
        if ( any && any['top'] !== undefined && any['left'] !== undefined ) {
            return any;
        }
        return $(any).position();
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

    function spaceshipRadius() {
        return Math.max($(spaceship).outerWidth(), $(spaceship).outerHeight()) / 2;
    }

    function enemyReachedSpaceship(enemy) {
        if ( gameOver ) return true;
        if ( !$.contains(document.body, enemy) ) {
            return false;
        }
        if ( distance(centerOf(enemy), centerOf(spaceship)) >= spaceshipRadius() ) {
            return false;
        }
        gameOver = true;
        setTimeout(function() { die(); }, 1);
        return true;
    }

    function getEnemyRemainingTime(enemy) {
        var arrivalTime = $(enemy).data('arrivalTime');
        if ( !arrivalTime ) {
            return getAttackSpeed() / ($(enemy).data('speed') || 1.0);
        }
        return Math.max(arrivalTime - new Date().getTime(), 1);
    }

    function animateEnemy(enemy, duration, resetArrivalTime) {
        if ( resetArrivalTime ) {
            $(enemy).data('arrivalTime', new Date().getTime() + duration);
        }
        if ( duration < 1 ) {
            duration = 1;
        }
        $(enemy).animate( alignCenters(spaceship, enemy), {
            duration: duration,
            easing: 'linear',
            step: function() {
                enemyReachedSpaceship(this);
            },
            complete: function() {
                // the player dies when an enemy reaches the spaceship.
                // the timeout is because we can't start the fade animation on this enemy from inside this callback.
                enemyReachedSpaceship(this);
            }
        });
    }

    function resetScorePosition() {
        $(score).stop(true, true).css({
            display: 'block',
            opacity: 0.7,
            top: '',
            left: '',
            right: '10px',
            bottom: '10px'
        });
    }

    function pauseGame() {
        if ( loadingScreen || gameOver || paused ) {
            return;
        }
        paused = true;
        pausedAt = new Date();
        spawnGeneration++;
        $('.enemy').stop();
        if ( sound.music.current ) {
            sound.music.current.pause();
        }
        for ( var i=0; i < sound.music.timeouts.length; i++ ) {
            clearTimeout(sound.music.timeouts[i]);
        }
        sound.music.timeouts = [];
        $(pausedModal).fadeIn(150);
    }

    function resumeGame() {
        if ( !paused ) return;
        var pauseDuration = new Date() - pausedAt;
        startTime = new Date(startTime.getTime() + pauseDuration);
        for ( var i=0; i < hitTimes.length; i++ ) {
            hitTimes[i] = new Date(hitTimes[i].getTime() + pauseDuration);
        }
        paused = false;
        pausedAt = undefined;
        $(pausedModal).fadeOut(150);
        if ( sound.music.current ) {
            try {
                sound.music.current.onended = function() {
                    if ( !paused && !gameOver ) sound.music.loop('fast', 1.0, 10);
                };
                var play = sound.music.current.play();
                if ( play && play.catch ) play.catch(function() { });
            } catch ( e ) { }
        }
        $('.enemy').each(function() {
            var arrivalTime = $(this).data('arrivalTime');
            if ( arrivalTime ) {
                $(this).data('arrivalTime', arrivalTime + pauseDuration);
            }
            animateEnemy(this, getEnemyRemainingTime(this), false);
        });
        spawn(spawnGeneration);
        updateScore();
    }

    function startGame() {
        spawnGeneration++;
        points = 0;
        hits = 0;
        hitTimes = [];
        misses = 0;
        fastEligibleWords = 0;
        missedLastKey = false;
        startTime = new Date();
        loadingScreen = false;
        gameOver = false;
        gameOverAt = undefined;
        paused = false;
        pausedAt = undefined;
        setMultiplier(1);

        ensureSound();
        sound.music.stop();

        $('.enemy, .bullet, .reticle, .spark, .spark-score, .game-over, .final-score-card').stop(true, true).remove();
        resetScorePosition();
        $(spaceship).stop(true, false).css({ opacity: 1 }).show();
        centerSpaceship();
        $(instructions).fadeOut(500);
        $(instructionsPopup).fadeOut(500);
        updateScore();

        spawn(spawnGeneration);
        sound.music.loop('fast', 1.0, 10);
    }

    function nextWord() {
        const word = words[wordIndex];

        // cycle through the words again
        wordIndex++;
        if (wordIndex >= words.length ) {
            words.shuffle();
            wordIndex = 0;
        }

        return word;
    }

    function spawn(generation) {
        if ( gameOver || paused || generation !== spawnGeneration ) {
            return;
        }

        // avoid ambiguous starting letters
        var word = nextWord();
        for ( var i=0; i<10; i++ ) {
            if ( $('.enemy').startsWith(word.charAt(0)).length ) {
                word = nextWord();
            } else {
                break;
            }
        }
        
        var enemy = newSprite('enemy', word);
        
        var fastEligible = word.length <= FAST_WORD_MAX_LENGTH && points > FAST_WORD_MIN_POINTS;
        if ( fastEligible ) {
            fastEligibleWords++;
        }
        var fast = fastEligible && (fastEligibleWords % FAST_WORD_INTERVAL) === 0;
        var speed = 1.0;
        if ( fast ) {
            speed = FAST_WORD_SPEED_MULTIPLIER;
        }
        $(enemy).data('speed', speed);
        $(enemy).data('fast', fast);
        $(enemy).data('difficult', word.length >= DIFFICULT_WORD_MIN_LENGTH);

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
        animateEnemy(enemy, getAttackSpeed() / speed, true);
        var spawnInterval = 200 + 400*danger - 2*hits + 100 - 200*Math.random();
        if ( spawnInterval < 500 ) spawnInterval = 500;
        setTimeout(function() { spawn(generation); }, spawnInterval);
    }

    $(window).resize(function() {
        centerSpaceship();
        if ( gameOver || paused ) return;
        $('.enemy').each(function() {
            $(this).stop();
            animateEnemy(this, getEnemyRemainingTime(this), false);
        });
    });

    $(window).blur(pauseGame);
    document.addEventListener('visibilitychange', function() {
        if ( document.hidden ) {
            pauseGame();
        }
    });

    function die() {
        var generation = spawnGeneration;
        sound.music.volume(0, 500);
        sound.fx.play('die');
        $(spaceship).explode(alphabet, 3000);
        $(spaceship).explode(alphabet.toUpperCase(), 3000);
        gameOver = true;
        gameOverAt = new Date();

        $(score).stop(true, true).fadeOut(500);

        $('.enemy').stop();
        $('.enemy').animate({opacity: 'hide'}, 1000, 'linear', function() { $(this).remove(); });
        $(spaceship).animate({opacity: 0}, 2000, 'linear', function() {
            setTimeout(function() { 
                if ( generation !== spawnGeneration ) return;
                sound.music.play('ending', 1.0, 700);
                $(newSprite('game-over', 'Game Over'))
                    .css({ opacity: 0 })
                    .animate({ opacity: 1.0 }, GAME_OVER_TITLE_FADE_MS, undefined, function() {
                        if ( generation !== spawnGeneration ) return;
                        $(newSprite('final-score-card', renderFinalScoreCard()))
                            .css({ opacity: 0 })
                            .animate({ opacity: 1.0 }, FINAL_SCORE_FADE_MS);
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
        var now = new Date();
        hits++;
        missedLastKey = false;
        hitTimes.push(now);
        pruneHitTimes(now);
        points += multiplier;
        sound.fx.play(bulletTier.sound, bulletTier.volume);
        var bulletSprite = newSprite('bullet', bullet);
        var shipCenter = centerOf(spaceship);
        var targetCenter = centerOf(this);
        var dx = targetCenter.left - shipCenter.left;
        var dy = targetCenter.top - shipCenter.top;
        var d = Math.sqrt(dx*dx + dy*dy) || 1;
        var bulletStart = {
            left: shipCenter.left - $(bulletSprite).outerWidth()/2 + 40 * dx/d,
            top: shipCenter.top - $(bulletSprite).outerHeight()/2 + 40 * dy/d
        };
        var bulletEnd = {
            left: targetCenter.left - $(bulletSprite).outerWidth()/2,
            top: targetCenter.top - $(bulletSprite).outerHeight()/2
        };
        $(bulletSprite)
            .css({ left: bulletStart.left + 'px', top: bulletStart.top + 'px' })
            .pointAt(this)
            .animate( bulletEnd, distance(bulletStart, bulletEnd)/3, 'linear', function() { 
                $(this).remove();}
            );
        var letter = this.html().charAt(0);
        var newWord = this.html().slice(1);
        this.spark(letter);
        if ( newWord.length === 0 ) {
            sound.fx.play('kill');
            var multiplierBonus = 1;
            if ( this.data('fast') ) {
                multiplierBonus = Math.max(multiplierBonus, FAST_WORD_MULTIPLIER_BONUS);
            }
            if ( this.data('difficult') ) {
                multiplierBonus = Math.max(multiplierBonus, DIFFICULT_WORD_MULTIPLIER_BONUS);
            }
            var multiplierMessage = setMultiplier(multiplier + multiplierBonus);
            if ( multiplierMessage ) {
                this.sparkScore(multiplierMessage);
            }
            this.remove();
        } else {
            if ( !this.hasClass('target') ) {
                this.target();
            }
            this.html(newWord);
        }
        return this;
    }

    // oops, a bad character
    function miss(letter) { 
        misses++;

        if ( !missedLastKey ) {
            var tierIndex = getBulletTierIndex(multiplier);
            var penaltyTierIndex = Math.max(tierIndex - 1, 0);
            setMultiplier(BULLET_TIERS[penaltyTierIndex].min);
        }
        missedLastKey = true;

        sound.fx.play('miss');
    }

    function eventKey(e) {
        return e.key || (e.originalEvent && e.originalEvent.key) || '';
    }

    function eventCode(e) {
        return e.code || (e.originalEvent && e.originalEvent.code) || '';
    }

    function isApostropheKey(e) {
        return eventKey(e) === "'" || e.which === 222 || e.keyCode === 222;
    }

    function hasModifierKey(e) {
        return e.altKey || e.ctrlKey || e.metaKey;
    }

    function isTypingKey(e) {
        return /^[a-z]$/i.test(eventKey(e)) || isApostropheKey(e);
    }

    function isSpaceKey(e) {
        return eventKey(e) === ' ' || eventCode(e) === 'Space' || e.which === 32 || e.keyCode === 32;
    }

    function isUnmodifiedSpaceKey(e) {
        return !e.shiftKey && !hasModifierKey(e) && isSpaceKey(e);
    }

    document.addEventListener('keydown', function(e) {
        if ( isApostropheKey(e) && !e.altKey && !e.ctrlKey && !e.metaKey ) {
            e.preventDefault();
        }
    }, true);

    $(document).keydown(function(e) {
        $.cookie('debug-event-log', JSON.stringify({
            keyCode: e.keyCode,
            which: e.which,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey
        }));

        if ( paused ) {
            if ( isUnmodifiedSpaceKey(e) ) {
                e.preventDefault();
                resumeGame();
            }
            return;
        }

        if ( gameOver ) {
            if ( isUnmodifiedSpaceKey(e) ) {
                e.preventDefault();
                if ( gameOverAt && new Date() - gameOverAt >= GAME_OVER_RESTART_DELAY_MS ) {
                    startGame();
                }
            }
        } else if ( loadingScreen ) {
            if ( isUnmodifiedSpaceKey(e) ) {
                e.preventDefault();
                startGame();
            }

        } else if ( hasModifierKey(e) ) {
            // leave browser shortcut handling intact.
        } else if ( eventKey(e) === 'Backspace' || isSpaceKey(e) || eventKey(e) === 'Escape' ) { 
            // space, backspace, or escape: reset the target reticle
            e.preventDefault();
            var targets = $('.enemy.target');
            if ( targets.length ) {
                targets.removeClass('target'); 
                updateScore();
            } else if ( eventKey(e) === 'Escape' ) {
                pauseGame();
            }
        } else {
            // normal typing
            var letter = '';
            if ( /^[a-z]$/i.test(eventKey(e)) ) {
                letter = eventKey(e).toLowerCase();
            } else if ( isApostropheKey(e) ) {
                letter = "'"; // apostrophes are used in some words...
            } else {
                // non-handled keydown, do nothing
                return;
             }

            e.preventDefault();
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
