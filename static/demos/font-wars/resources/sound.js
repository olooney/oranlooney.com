/* Font Wars Sound Library
Copyright 2026, Oran Looney
MIT License, see README
*/

var sound = {
	fx: {
		sounds: {},
		multi: 3,
		masterVolume: 1.0,

		_reload: function(audio) {
			try {
				audio.pause();
				audio.currentTime = 0;
				audio.load();
			} catch ( e ) { }
		},

		load: function(label, resource, volume, multi) {
			if ( volume === undefined ) volume = 1.0;
			if ( multi === undefined ) multi = this.multi;
			var channels = [];
			channels.volume = volume;
			this.sounds[label] = channels;
			for ( var i=0; i<multi; i++ ) {
				var audio = new Audio(resource);
				audio.preload = 'auto';
				channels.push(audio);
				audio.load();
			}
			return this;
		},

		_each: function(label, fn) {
			var channels = this.sounds[label];
			if ( !channels ) throw Error("no \"" + label + "\" sound effect!");
			for ( var i=0; i < channels.length; i++ ) {
				var done = fn.call(this, channels[i], i, channels);
				if ( done ) return this;
			}
			return this;
		},
		
		// play a short sound effect immediately
		play: function(label, volume) { 
			return this._each(label, function(audio, i, channels) {
				if( audio.ended == true || audio.currentTime == 0 ) {
					try {
						if ( this.muted ) {
							audio.volume = 0;
						} else {
							if ( volume === undefined ) volume = channels.volume;
							audio.volume = this.masterVolume * volume;
						}
						audio.currentTime = 0;
						var play = audio.play();
						if ( play && play.catch ) {
							var fx = this;
							play.catch(function() {
								fx._reload(audio);
							});
						}
					} catch ( e ) {
						this._reload(audio);
					}
					return true;
				}
			});
		},

		muted: false,
		mute: function() {
			this.muted = true;
			for ( var label in this.sounds ) {
				this._each(label, function(audio) {
					audio.volume = 0;
				});
			}
		},
		unmute: function() {
			this.muted = false;
		}
	},

	// man, this is way too complicated.  All I wanted was to be
	// able to fade music in and out, and cancel it at any point;
	// how did I end up with this?
	music: {
		masterVolume: 0.5,
		tracks: {},
		timeouts: [],
		current: undefined,

		_reload: function(audio) {
			try {
				audio.pause();
				audio.currentTime = 0;
				audio.load();
			} catch ( e ) { }
		},

		load: function(label, resource) {
			var audio = new Audio(resource);
			audio.preload = 'auto';
			audio.load();
			this.tracks[label] = audio;
			return this;
		},

		stop: function() {
			for ( var i=0; i < this.timeouts.length; i++ ) {
				clearTimeout(this.timeouts[i]);
			}
			this.timeouts = [];
			if ( !this.current ) return this;
			this.current.pause();
			this.current.currentTime = 0;
			delete this.current;
			return this;
		},

		_timeout: function(duration, fn) {
			var music = this;
			this.timeouts.push(setTimeout(function() {
				fn.call(music);
			}, duration));
			return this;
		},

		_start: function(label, volume) {
			var audio = this.tracks[label];
			if ( !audio ) throw Error("no music track \"" + label + "\"");
			this.current = audio;
			if ( volume === undefined ) volume = 1;
			if ( this.muted ) {
				this.current.volume = 0;
			} else {
				this.current.volume = this.masterVolume * (volume);
			}
			try {
				var play = this.current.play();
				if ( play && play.catch ) {
					var music = this;
					play.catch(function() {
						music._reload(audio);
					});
				}
			} catch ( e ) {
				this._reload(audio);
			}
			return this;
		},

		volume: function(volume, fade) {
			if ( !this.current ) return this;
			if ( fade === undefined ) {
				this.currentVolume = volume;
				if ( this.muted ) {
					this.current.volume = 0;
				} else {
					this.current.volume = volume * this.masterVolume;
				}
			} else {
				var initialVolume = this.current.volume;
				for ( var i=1; i<=10; i++ ) (function(i) {
					this._timeout(fade * i/10, function() {
						this.volume(initialVolume + (volume * this.masterVolume - initialVolume) * i/10);
					});
				}).call(this, i);
			}
			return this;
		},

		play: function(label, volume, fade, callback, scope) {
			if ( volume === undefined ) volume = 1.0;
			if ( fade === undefined ) fade = 200;
			this.stop()._start(label, 0).volume(volume, fade);

			var music = this;
			var audio = this.current;
			var scheduled = false;

			function cleanup() {
				audio.removeEventListener('loadedmetadata', schedule);
				audio.removeEventListener('durationchange', schedule);
				audio.removeEventListener('ended', finish);
			}

			function finish() {
				if ( audio !== music.current ) return;
				cleanup();
				music.stop();
				if ( callback ) callback.call(scope, music);
			}

			function schedule() {
				if ( scheduled || audio !== music.current || !isFinite(audio.duration) || audio.duration <= 0 ) return;
				scheduled = true;
				cleanup();

				var timeToEnd = Math.round( (audio.duration - audio.currentTime ) * 1000 );

				music._timeout(Math.max(timeToEnd - fade, 0), function() {
					this.volume(0.0, fade);
				});

				music._timeout(Math.max(timeToEnd, 0), finish);
			}

			audio.addEventListener('loadedmetadata', schedule);
			audio.addEventListener('durationchange', schedule);
			audio.addEventListener('ended', finish);
			schedule();
		},

		loop: function(label, volume, fade) {
			if ( volume === undefined ) volume = 1.0;
			if ( fade === undefined ) fade = 10;
			this.play(label, volume, fade, function() {
				this.loop(label, volume, fade);
			}, this);
		},

		muted: false,
		mute: function() {
			this.muted = true;
			if ( this.current ) this.current.volume = 0;
		},
		unmute: function() {
			this.muted = false;
			if ( this.current && this.currentVolume ) {
				this.current.volume = this.currentVolume;
			}
		}
	},

	mute: function() {
		this.fx.mute();
		this.music.mute();
	},

	unmute: function() {
		this.fx.unmute();
		this.music.unmute();
	}
};

// the HTML5 audio tag is pretty unreliable across all browsers.
// Use the nuclear option and catch EVERYTHING.
(function() { 
	function safely(fn) {
		return function() {
			try {
				return fn.apply(this, arguments);
			} catch ( e ) { }
			return this; // safely chain...
		}
	}

	function makeSafe(obj) {
		for ( var m in obj ) {
			if ( typeof obj[m] === 'function' ) {
				obj[m] = safely(obj[m]);
			}
		}
	}

	makeSafe(sound.fx);
	makeSafe(sound.music);
})();

