// Copyright 2010 Oran Looney
owl.namespace('owl.os.desktop', function() {
	/* The widgets and other classes that make up the desktop. */

	// imports
	var os = owl.os;
	
	function DesktopFilesView(config) {
		DesktopFilesView.superclass.constructor.call(this, config);
	}
	Ext.extend(DesktopFilesView, os.fileui.DirectoryIconView, {
	 	id: 'os-desktop-files-view',
		border: false,

		canWrite: function() { return true; }
	});
	
	function StartMenu(config) {
		StartMenu.superclass.constructor.call(this, config);
	}
	Ext.extend(StartMenu, Ext.menu.Menu, {
		cls: 'os-desktop-start-menu'
	});
	
	function Taskbar(config) {
		Taskbar.superclass.constructor.call(this, config);
	}
	Ext.extend(Taskbar, Ext.Panel, {
		cls: 'os-desktop-taskbar',
		height: 23,
		layout: 'column',
		
		onRender: function() {
			Taskbar.superclass.onRender.apply(this, arguments);
			this.add( new Ext.Container({
				autoEl: { cls: 'owl-desktop-start-button-wrapper' },
				width: 70,
				items: [
					new Ext.Button({
						cls: 'os-desktop-start-button',
						text: 'Start',
						menuAlign: 'bl-tl?',
						menu: this.getStartMenu()
					})
				]
			}) );
			this.add( this.getTaskView() );
		},
		
		getTaskView: function() {
			if ( !this.taskView ) this.taskView = this.newTaskView({
				// initialize with empty stub store.  We'll set it to the AppWindowMgr later.
				store: new Ext.data.Store(),
				columnWidth: 1,
				height: 23
			});
			return this.taskView;
		},
		
		newTaskView: function(config) {
			return new Ext.DataView( Ext.apply({
				cls: 'os-desktop-tasks',
				tpl: new Ext.XTemplate(
					'<tpl for=".">',
					'<span class="os-desktop-task',
						'<tpl if="minimized"> os-desktop-task-minimized</tpl>',
						'<tpl if="active"> os-desktop-task-active</tpl>',
					'">',
						os.ui.icon('{iconCls}'),
						'{[fm.ellipsis(values.title, 20)]}',
					'</span>',
					'</tpl>'
				),
				overClass:'os-desktop-task-over',
				itemSelector:'.os-desktop-task'
			}, config) );
		},
		
		getStartMenu: function() {
			if ( !this.startMenu ) this.startMenu = new StartMenu();
			return this.startMenu;
		}
	});
	

	// config:
	//   homeDirStore - DirectoryStore - used for the DesktopFilesView.
	function Desktop(config) {
		Desktop.superclass.constructor.call(this, config);
	}
	Ext.extend(Desktop, Ext.Viewport, {
		cls: 'os-desktop',
		layout: 'border',
		
		onRender: function() {
			Desktop.superclass.onRender.apply(this, arguments);
		
			this.add( new Ext.Panel({
				border: false,
				region: 'center',
				layout: 'fit',
				// this id is special; it will be used as the container for
				// all AppWindows if it exists.  AppWindows are then constrained
				// to it so won't go over the taskbar.
				id: 'os-desktop-window-area',
				items: [
					this.getFilesView()
				]
			}) );
			this.add( this.getTaskbar() );
		},
		
		getTaskbar: function() {
			if ( !this.taskbar ) {
				this.taskbar = new Taskbar({
					region: 'south'
				});
			}
			return this.taskbar;
		},
		
		getFilesView: function() {
			if ( !this.filesView ) { 
				this.filesView = new DesktopFilesView({
					store: this.homeDirStore
				});
			}
			return this.filesView;
		}
	});
	
	// Config: { desktop: Desktop }
	function DesktopController(config) {
		Ext.apply(this, config);
		this.appMgr = new os.app.AppMgr();
		this.appWindowMgr = new os.app.AppWindowMgr();
		this.bindStartMenu();
		this.bindTaskbar();
		this.bindHomeDir();
	}
	Ext.extend(DesktopController, Object, {

		bindStartMenu: function() {
			var startMenu = this.desktop.getTaskbar().getStartMenu();
			var apps = this.appMgr.apps;
			for ( var i=0; i < apps.length; i++ ) {
				startMenu.add( this.newStartAppAction(apps[i]) );
			}
			this.appMgr.on('add', this.onAddApp, this);
		},
		
		onAddApp: function(appMgr, appData) {
			var startMenu = this.desktop.getTaskbar().getStartMenu();
			startMenu.add( this.newStartAppAction(appData) );
		},
		
		newStartAppAction: function(appData) {
			return this.appMgr.newLaunchActionForApp(appData.Class);
		},
		
		bindTaskbar: function() {
			var taskbar = this.desktop.getTaskbar();
			var controller = this;
			function bindTaskbarContext() {
				taskbar.getEl().on('contextmenu', controller.onTaskbarContextMenu, controller);
			}
			if ( taskbar.rendered ) bindTaskbarContext();
			else taskbar.on('render', bindTaskbarContext);

			var taskView = taskbar.getTaskView();
			taskView.setStore(this.appWindowMgr);
			taskView.on('click', this.onTaskClick, this);
			taskView.on('contextmenu', this.onTaskContextMenu, this);
		},
		
		onTaskClick: function(taskView, index, node, e) {
			var window = taskView.getStore().getAt(index).get('window');
			if ( window.isFront() ) window.minimize();
			else if ( window.minimized ) window.unminimize();
			else window.toFront();
		},
		
		onTaskContextMenu: function(taskView, index, node, e) {
			e.stopEvent();
			var xy = e.getXY();
			var windowRecord = this.desktop.getTaskbar().getTaskView().getStore().getAt(index);
			if ( !windowRecord ) return;
			var window = windowRecord.get('window');
			
			var contextMenu = new Ext.menu.Menu({
				shadow: 'drop',
				items: window.getManageActions()
			});
			contextMenu.render();
			var height = contextMenu.el.getHeight();
			xy[1] -= height;
			contextMenu.showAt(xy);
		},

		onTaskbarContextMenu: function(e) {
			e.stopEvent();
			var xy = e.getXY();
			var contextMenu = new Ext.menu.Menu({
				shadow: 'drop',
				items: [
					this.appMgr.newLaunchActionForApp(os.tools.SystemManagerApp),
					new Ext.Action({
						text: 'Show Desktop',
						handler: function() {
							var mgr = new os.app.AppWindowMgr();
							mgr.minimizeAll();
						}
					})
				]
			})
			contextMenu.render();
			var height = contextMenu.el.getHeight();
			xy[1] -= height;
			contextMenu.showAt(xy);
		},

		bindHomeDir: function() {
			var homeDir = os.getHomeDir();

			// if the directory doesn't exist yet, keep checking back
			// until the directory is added to root.
			if ( homeDir ) {
				os.root.un('add', this.bindHomeDir, this);
				this.homeDirStore.bindToDirectory(homeDir);
			} else {
				// This is safe because registering the same listener a second time 
				// has no effect.
				os.root.on('add', this.bindHomeDir, this);
			}
		}
	});
	
	// initializes and installs the desktop, completely taking over the document.
	Ext.onReady(function() {
		var homeDirStore = new owl.os.fileui.DirectoryStore();

		// create the desktop viewport.  This also creates all the Components on
		// the desktop: the start menu, taskbar, etc.  The desktop renders 
		// itself and takes over the entire page as soon as it's instantiated.
		var desktop = new Desktop({
			homeDirStore: homeDirStore
		});	

		// the controller sets up all the binding that makes the desktop work.
		os.desktop.controller = new DesktopController({
			desktop: desktop,
			homeDirStore: homeDirStore
		});
	});

	return {
		DesktopFilesView: DesktopFilesView,
		StartMenu: StartMenu,
		Taskbar: Taskbar,
		Desktop: Desktop,
		DesktopController: DesktopController
	};
});
