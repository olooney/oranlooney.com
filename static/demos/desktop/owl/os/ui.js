// Copyright 2010 Oran Looney
owl.namespace('owl.os.ui', function() {
	/* System-level UI Components */
	
	// format like "7/5/2009 3:05 PM"
	var dateTimeColumnRenderer = Ext.util.Format.dateRenderer('n/j/Y g:i A');
	
	function icon(cls) {
		return '<img class="os-icon ' + cls + '" src="icons/invisi.gif"/>';

	}
	
	function tickColumnRenderer(bool) {
		return icon(bool ? 'os-ui-tick-icon' : '');
	}	


	// A simple, private class used to queue up
	// Ext.MessageBox requests.
	function MessageBoxQueue() {
		this.queue = [];
	}
	MessageBoxQueue.prototype = {
		showNextInQueue: function() {
			if ( this.queue.length ) {
				var next = this.queue.shift();
				this.showOrQueue.defer(1, this, [next]);
			}
		},

		showOrQueue: function(config) {
			config.fn = this.showNextInQueue;
			config.scope = this;
			
			if ( Ext.Msg.isVisible() ) {
				this.queue.push(config);
			} else {
				Ext.Msg.show(config);
			}
		}
	}
	
	var msgBoxQ = new MessageBoxQueue();

	
	// various predefined MessageBoxes.
	var show = {
	
		error: function(message) {
			msgBoxQ.showOrQueue({
				title: 'Error',
				msg: message,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR,
				iconCls: 'os-log-icon'
				
			});
		},
		
		info: function(message) {
			msgBoxQ.showOrQueue({
				title: 'Info',
				msg: message,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.INFO,
				iconCls: 'os-log-icon'
				
			});
		},
		
		warning: function(message) {
			msgBoxQ.showOrQueue({
				title: 'Warning',
				msg: message,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.WARNING,
				iconCls: 'os-log-icon'
				
			});
		},
		
		aside: function(message) {
			this.showTip(message, 'Did you know...', true, true);
		},

		notification: function(message) {
			this.showTip(message, '', false, true);
		},
		
		// private
		showTip: function(message, title, bottom, right) {
			var tipWidth = 180;
			var aside = new Ext.Tip({ 
				title: title,
				width: tipWidth, 
				html: message + '<br>',
				shadow: 'drop', 
				iconCls: 'os-icon-upper-right os-log-aside-icon' 
			});
			var tipHeight = 75; // start with a safe guess
			var bodySize = Ext.getBody().getSize();

			function x(offset) {
				if ( right ) return bodySize.width - offset - tipWidth;
				else return offset;
			}
			function y(offset) {
				// extra 25 is for the bottom toolbar...
				if ( bottom ) return bodySize.height - offset - tipHeight - 25;
				else return offset;
			}

			// start off off the page.
			aside.showAt([
				x(20),
				y(-50)
			]);

			// now that the tip is rendered, we can determine it's actual height.
			tipHeight = aside.getSize().height;

			if ( right ) var ghostDir = 'r';
			else var ghostDir = 'l';
			
			// slide in, wait, ghost out
			aside.el.shift({
				x: x(20),
				y: y(20),
				duration: .7,
				callback: aside.syncShadow,
				scope: aside
			}).pause(6).shift({
				callback: function() { aside.el.disableShadow(); }
			}).ghost(ghostDir, {
				callback: aside.destroy,
				scope: aside
			});
			
		}
	};
	
	return {
		icon: icon,
		tickColumnRenderer: tickColumnRenderer,
		dateTimeColumnRenderer: dateTimeColumnRenderer,
		show: show
	}
});
