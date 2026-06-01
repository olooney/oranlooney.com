// Copyright 2010 Oran Looney
owl.namespace('owl.os.app', function() {
	/* Apps are mini-applications, tools used to   view and edit file contents.
	Each specific app will be implemented in its own namespace; this package 
	provides the core interfaces and base classes used by all apps.
	*/

	// imports
	var os = owl.os;
	
	function AppMgr() {
		if ( os.app.appMgr ) return os.app.appMgr;
		else os.app.appMgr = this;
		
		AppMgr.superclass.constructor.call(this);
		
		this.addEvents('add', 'remove', 'start', 'stop');
		this.apps = [];
	}
	Ext.extend(AppMgr, Ext.util.Observable, {
	
		register: function(AppClass, metaData) {
			var appData = owl.clone(metaData);
			appData.Class = AppClass;
			appData.instances = [];
			this.apps.push(appData);
			this.fireEvent('add', this, appData);	
		},
		
		getDataForApp: function(AppClass) {
			return owl.find(this.apps, AppClass, {
				property: 'Class', 
				identical: true,
				item: true
			});
		},

		newLaunchActionForApp: function(AppClass) {
			var appData = this.getDataForApp(AppClass);
			return new Ext.Action({
				text: appData.name,
				iconCls: appData.iconCls,	
				handler: function() {
					new appData.Class();
				}
			});
		},
		
		// call when a new app instance starts.
		started: function(app) {
			var appData = this.getDataForApp(app.constructor);
			appData.instances.remove(app);
			appData.instances.push(app);
			this.fireEvent('start', app);
		},
		
		stopped: function(app) {
			var appData = this.getDataForApp(app.constructor);
			appData.instances.remove(app);
			this.fireEvent('stop', app);
		}
		
	});
	

	function App(config) {
		Ext.apply(this, config);
		App.superclass.constructor.call(this, config);
		this.addEvents('beforeexit', 'exit');
		this.getMgr().started(this);
		this.windows = [];
		this.setup();
		if ( !this.windows.length ) this.exit();
	}
	Ext.extend(App, Ext.util.Observable, {
		
		getMgr: function() {
			return new AppMgr();
		},
		
		// this function must open at least one window, or the app will 
		// immediately exit.
		setup: function() {
			this.openWindow(AppWindow, {
				title: 'Stub AppWindow',
				html: 'stub body content.'
			});
		},
		
		// invokes a method with the scope of each window.
		forAllWindows: function(method, args) {
			var wins = this.windows;
			for ( var windex=0; windex < wins.length; windex++ ) {
				method.apply(wins[windex], args);
			}
		},
		
		exit: function() {
			if ( false === this.fireEvent('beforeexit') ) return;
			this.forAllWindows(function() { this.close(); });
		},
		
		kill: function() {
			this.forAllWindows(function() { this.destroy(); });
			this.getMgr().stopped(this);
			this.fireEvent('exit');
		},
		
		openWindow: function(WindowClass, config) {
			var config = owl.clone(config, { app: this });
			var window = new WindowClass(config);
			this.windows.push(window);
			window.on('destroy', this.onWindowDestroy, this);
			if ( !(config && config.hidden) ) window.show();
			return window;
		},
		
		onWindowDestroy: function(window) {
			window.un('destroy', this.onWindowDestroy, this);
			this.windows.remove(window);
			if ( !this.windows.length ) this.kill();
		}
	});
	
	function AppWindowMgr(config) {
		// singleton
		if ( os.app.windowMgr ) return os.app.windowMgr;
		else os.app.windowMgr = this;
		
		AppWindowMgr.superclass.constructor.call(this, config);
	}
	Ext.extend(AppWindowMgr, Ext.data.Store, {
		WindowRecord: Ext.data.Record.create(['title', 'iconCls', 'window', 'minimized', 'active']),
		
		register: function(window) {
			this.add([ this.newWindowRecord(window) ]);
		},
		
		newWindowRecord: function(window) {
			var winRec = new this.WindowRecord({
				title: window.title,
				iconCls: window.iconCls,
				window: window,
				minimized: !!window.minimized,
				active: window.isFront()  // best guess
			});

			// keep the record up-to-date as the window changes.
			window.on('minimize', function() { winRec.set('minimized', true); });
			window.on('unminimize', function() { winRec.set('minimized', false) });
			window.on('titlechange', function(w, title) { winRec.set('title', title); });
			window.on('iconchange', function(w, iconCls) { winRec.set('iconCls', iconCls); });
			window.on('destroy', function() { this.remove(winRec); }, this);
			window.on('activate', function() { winRec.set('active', true); });
			window.on('deactivate', function() { winRec.set('active', false); });

			return winRec;
		},

		minimizeAll: function() {
			this.each(function(record) {
				record.get('window').minimize();
			}, this);
		}
		
	});
	
	function AppWindow(config) {
		// render and constrain to the destop window area if available,
		// otherwise just use the Body.  Making this optional eliminates
		// the requirement that the destop be available and rendered.
		this.renderTo = Ext.get(this.renderTo) || Ext.getBody();

		AppWindow.superclass.constructor.call(this, config);
		this.addEvents('unminimize');
		(new AppWindowMgr).register(this);
	}
	Ext.extend(AppWindow, Ext.Window, {
		cls: 'os-app-window semi-transparent-subtle',
		unmaximizedCls: 'semi-transparent-subtle',
		deactivatedCls: 'semi-transparent',
		shadow: false, // doesn't look good with transparency effect.
		plain: true,
		maximizable: true,
		minimizable: true,
		constrain: true,
		height: 300,
		width: 400,
		
		// don't close windows when the escape key is hit.
		onEsc: function() {},
		
		// this element is constructed by the desktop and is used to keep windows 
		// from filling the whole screen or going over the taskbar.  
		renderTo: 'os-desktop-window-area',
		
		baseActionIconCls: 'os-app',
		
		listeners: {
			maximize: function(pw) { pw.removeClass(this.unmaximizedCls); },
			restore: function(pw) { pw.addClass(this.unmaximizedCls); }
		},
		
		initEvents: function() {
			AppWindow.superclass.initEvents.call(this, arguments);
			this.on('maximize', function(pw) { 
				pw.removeClass(this.unmaximizedCls);
				pw.removeClass(this.deactivatedCls);
			});
			this.on('restore', function(pw) { pw.addClass(this.unmaximizedCls);	});
			this.on('activate', function(pw) { pw.removeClass(this.deactivatedCls); });
			this.on('deactivate', function(pw) { 
				if ( !pw.minimized && !pw.maximized ) {	
					pw.addClass(this.deactivatedCls); 
				}
			});
			if ( this.header ) {
				this.header.on('contextmenu', this.onHeaderContextMenu, this);
			}
		},
		
		close: function() {
			this.restore();
			return AppWindow.superclass.close.apply(this, arguments);
		},
	
		minimize: function() {
			if ( !this.minimized ) {
				this.minimized = true;
				this.hide();
				this.fireEvent('minimize', this);
			}
		},
	
		unminimize: function() { this.show(); },
		
		show: function() {
			AppWindow.superclass.show.apply(this, arguments);
			if ( this.minimized ) {
				this.minimized = false;
				this.fireEvent('unminimize', this);
			}
		},

		// private window function that handles window positioning before showing.
		beforeShow: function() {
			AppWindow.superclass.beforeShow.apply(this, arguments);

			// tile windows
			var offset = (new AppWindowMgr).getCount() * 20 - 100;
			var xy = this.getPosition();
			this.setPagePosition( xy[0] + offset, xy[1] + offset );
		},
		
		toggleMinimize: function() {
			if ( this.minimized ) this.unminimize();
			else this.minimize();
		},
	
		restore: function() {
			this.unminimize();
			return AppWindow.superclass.restore.apply(this, arguments);
		},
		
		maximize: function() {
			this.restore();
			return AppWindow.superclass.maximize.apply(this, arguments);
		},
		
		// returns a new Ext.Action, using this window as the scope
		// by default and handling common cases.
		newAction: function(config) {
			return new Ext.Action( Ext.apply({
				scope: this,
				iconCls: [
					this.baseActionIconCls,
					config.text.replace(/[ _]/g,'-').toLowerCase(),
					'icon'
				].join('-')
			}, config) );
		},
		
		// returns an array of actions used to build a menu or toolbar
		// for managing this window.  Note of the '-', which is not an
		// action but generates a seperator for both menus and toolbars.
		getManageActions: function() {
			return [
				this.newAction({ 
					text: 'Bring To Front', 
					handler: function() { 
						this.show();
						this.toFront(); 
					}
				}),
				this.newAction({ 
					text: 'Restore', 
					handler: this.restore,
					disabled: !this.hidden && !this.maximized
				}),
				this.newAction({
					text: 'Minimize',
					handler: this.minimize,
					disabled: this.minimized
				}),
				this.newAction({
					text: 'Maximize',
					handler: this.maximize,
					disabled: this.maximized  && !this.minimized
				}),
				'-',
				this.newAction({
					text: 'Close',
					handler: this.close
				})
			]
		},
		
		onHeaderContextMenu: function(e) {
			e.stopEvent();
			var menu = new Ext.menu.Menu({
				shadow: 'drop',
				items: this.getManageActions()
			});
			var xy = e.getXY();
			menu.showAt(xy);
		},
		
		isFront: function() {
			return Ext.WindowMgr.getActive() === this;
		},
		
		toFront: function() {
			this.fireEvent('tofront', this);
			return AppWindow.superclass.toFront.apply(this, arguments);
		}
	
	});
	
	// helper function to streamline this common case.
	function register(AppClass, metaData) {
		(new AppMgr()).register(AppClass, metaData);
	}


	var extensionRegistry = {};

	// register a function to be called when a file
	// of a certain extension is Opened.
	function registerExtension(ext, handler, scope) {
		if ( ext[0] == '.' ) ext = ext.slice(1);
		extensionRegistry[ext] = { handler: handler, scope: scope };
	}

	function openFile(file) {
		var filename = file.getName();
		var ext = filename.split('.').pop();
		var opener = extensionRegistry[ext];
		if ( opener ) {
			opener.handler.call(opener.scope, file);
		} else {
			owl.os.log.error('No application is registered to handle extension "' + ext + '".');
		}
	}
	
	
	return {
		AppMgr: AppMgr,
		App: App,
		AppWindowMgr: AppWindowMgr,
		AppWindow: AppWindow,
		register: register,
		registerExtension: registerExtension,
		openFile: openFile
	};
});
