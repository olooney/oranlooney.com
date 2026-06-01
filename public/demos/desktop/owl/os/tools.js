// Copyright 2010 Oran Looney
owl.namespace('owl.os.tools', function() {
	/* Namespace for system utility apps.*/

	// imports
	var app = owl.os.app;
	var os = owl.os;
	var safely = owl.os.safely;
	
	// Config: file
	function TextEditApp(config) {
		TextEditApp.superclass.constructor.call(this, config);
	}
	Ext.extend(TextEditApp, app.App, {
		appName: 'TextEdit',
		fileExtension: '.txt',

		setup: function() {
			var title = this.appName;
			if ( this.file ) title += ' - ' + this.file.getName();
			this.mainWindow = this.openWindow(TextEditWindow, {
				title: title
			});
		},

		newFileMenu: function(win) {
			var item = owl.bind(win.newAction, win);
			return new Ext.menu.Menu({
				items: [
					item({ 
						text: 'New',
						handler: this.openNewFile,
						scope: this
					}),
					// item({ text: 'Open' }),
					'-',
					item({ 
						text: 'Save',
						handler: this.saveFile,
						scope: this
					}),
					item({ 
						text: 'Save As',
						handler: this.saveFileAs,
						scope: this
					}),
					'-',
					item({ 
						text: 'Exit',
						handler: this.exit,
						scope: this
					})
				]
			});
		},

		openNewFile: function() {
			this.file = null;
			this.mainWindow.setContent('');
			this.mainWindow.setTitle(this.appName);
		},

		saveFile: safely(function() {
			if ( !this.file ) this.saveFileAs();
			else this.file.save(this.mainWindow.getContent(), this.onSaveFile, this);
		}),

		onSaveFile: function() {
			owl.os.log.notification(this.file.getName() + ' saved!');
		},

		saveFileAs: function() {
			Ext.Msg.prompt(this.appName, 'Save file as:', this.onChoseNewFilename, this);
		},

		onChoseNewFilename: function(button, filename) {
			if ( button != 'ok' ) return;
			if ( !filename ) owl.os.log.error("No filename supplied.");
			var ext = this.fileExtension;
			if ( filename.slice(-ext.length) != ext ) filename += ext;
			this.file = owl.os.getHomeDir().addNewFile(filename);
			this.mainWindow.setTitle(this.appName + ' - ' + filename);
			this.saveFile();
		}


	});
	app.register(TextEditApp, {
		name: TextEditApp.prototype.appName,
		iconCls: 'os-tools-text-edit-icon'
	});
	app.registerExtension(TextEditApp.prototype.fileExtension, function(file) {
		new owl.os.tools.TextEditApp({ file: file }); 
	});

	function TextEditWindow(config) {
		this.app = config.app;
		this.tbar = this.newMenuToolbar();
		TextEditWindow.superclass.constructor.call(this, config);
	}
	Ext.extend(TextEditWindow, app.AppWindow, {
		title: TextEditApp.prototype.appName,
		iconCls: 'os-tools-text-edit-icon',
		height: 300,
		width: 400,
		layout: 'fit',
		
		onRender: function() {
			TextEditWindow.superclass.onRender.apply(this, arguments);
			this.field = this.newField({
				name: 'text'
			});
			
			// stub - obviously this needs work.
			if ( this.app.file ) {
				this.app.file.load(this.setContent, this);
			}
			this.add(this.field);
		},

		getContent: function() {
			return this.field.getValue();
		},

		setContent: function(content) {
			this.field.setValue(content);
		},
				
		newMenuToolbar: function() {
			var toolbar = new Ext.Toolbar();
			var win = this;
			toolbar.on('render', function() {
				toolbar.addButton({
					text: 'File',
					menu: win.app.newFileMenu(win)
				});
			});
			return toolbar;
		},
		
		// factory method for the main edit field.
		newField: function(config) {
			return new Ext.form.TextArea(config);
		}
	});
	
	function HtmlEditApp(config) {
		HtmlEditApp.superclass.constructor.call(this, config);
	}
	Ext.extend(HtmlEditApp, TextEditApp, {
		appName: 'HtmlEdit',
		fileExtension: '.html',

		setup: function() {
			var title = this.appName;
			if ( this.file ) title += ' - ' + this.file.getName();
			this.mainWindow = this.openWindow(HtmlEditWindow, {
				title: title
			});
		}
	});
	app.register(HtmlEditApp, {
		name: HtmlEditApp.prototype.appName,
		iconCls: 'os-tools-html-edit-icon'
	});
	app.registerExtension(HtmlEditApp.prototype.fileExtension, function(file) {
		new owl.os.tools.HtmlEditApp({ file: file }); 
	});
	
	function HtmlEditWindow(config) {
		HtmlEditWindow.superclass.constructor.call(this, config);
	}
	Ext.extend(HtmlEditWindow, TextEditWindow, {
		title: 'HtmlEdit',
		iconCls: 'os-tools-html-edit-icon',
		width: 550,
		
		newField: function(config) {
			return new Ext.form.HtmlEditor(config);
		}
	});
	
	/* Config:
	  passes through initView to the SystemManagerWindow
	*/
	function SystemManagerApp(config) {
		SystemManagerApp.superclass.constructor.call(this, config);
	}
	Ext.extend(SystemManagerApp, app.App, {
		setup: function() {
			this.windowStore = new app.AppWindowMgr();
			this.logStore = owl.os.log;  // the log is-a Store.

			this.openWindow(
				SystemManagerWindow, 
				owl.subset(this, 'initialView')
			);
		},
		
		newWindowGrid: function(config) {
			return new Ext.grid.GridPanel( Ext.apply({
				title: 'Windows',
				store: this.windowStore,
				disableSelection: true,
				columns: [{
					header: 'Title', 
					width: 200, 
					sortable: true, 
					dataIndex: 'title' 
				}, {
					header: 'Minimized', 
					width: 60, 
					sortable: true, 
					dataIndex: 'minimized', 
					renderer: owl.os.ui.tickColumnRenderer
				}, {
					header: 'Active', 
					width: 50, 
					sortable: true, 
					dataIndex: 'active', 
					renderer: owl.os.ui.tickColumnRenderer
				}],
				listeners: {
					rowcontextmenu: this.onWindowContextMenu,
					scope: this
				}
			}, config) );
		},
		
		newLogView: function(config) {
			return new Ext.DataView( Ext.apply({
				title: 'Log',
				cls: 'os-tools-log-view',
				store: this.logStore,
				itemSelector: 'li',
				tpl: new Ext.XTemplate(
					'<ul>',
						'<tpl for=".">',
							'<li>',								
								'{[owl.os.ui.icon("os-log-" + values.type + "-icon")]}',
								'<span>{message}</span>',
								'<i> {[fm.date(values.timestamp, "H:i:s.u")]}</i>',
							'</li>',
						'</tpl>',
					'</ul>'
				)
			}, config) );
		},
		
		onWindowContextMenu: function(grid, index, e) {
			e.stopEvent();
			var xy = e.getXY();
			var windowRecord = this.windowStore.getAt(index);
			if ( !windowRecord ) return;
			var window = windowRecord.get('window');
			this.newWindowContextMenu(window).showAt(xy);
		},
		
		newWindowContextMenu: function(window) {
			return new Ext.menu.Menu({
				shadow: 'drop',
				items: window.getManageActions()
			});
		}
	});
	app.register(SystemManagerApp, {
		name: 'SystemManager',
		iconCls: 'os-tools-manager-icon'
	});

	/* config:
		initialView - String - 'win', 'app', or 'log' to open the manager
		  to a particular view.
	*/
	function SystemManagerWindow(config) {
		SystemManagerWindow.superclass.constructor.call(this, config);
	}
	Ext.extend(SystemManagerWindow, app.AppWindow, {
		title: 'SystemManager',
		iconCls: 'os-tools-manager-icon',
		cls: 'os-tools-manager-window',
		layout: 'fit',
		
		initialView: 'win',
		
		// private.
		getTabIndexOfView: function(view) {
			switch ( view ) {
				case 'win': return 0;
				case 'log': return 1;
			}
			return 0;
		},
		
		onRender: function() {
			SystemManagerWindow.superclass.onRender.apply(this, arguments);
			this.tabs = new Ext.TabPanel({
				activeTab: this.getTabIndexOfView(this.initialView),
				items: [
					this.windowsGrid = this.app.newWindowGrid(),
					this.logView = this.app.newLogView()
				]
			});
			this.add(this.tabs);
		}
	});
	
	
	return {
		TextEditApp: TextEditApp,
		HtmlEditApp: HtmlEditApp,
		SystemManagerApp: SystemManagerApp
	};
});
