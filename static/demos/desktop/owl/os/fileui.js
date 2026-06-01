// Copyright 2010 Oran Looney
owl.namespace('owl.os.fileui', function() {
	/* Standard UI components for working with files. */
	
	// imports
	var os = owl.os;
	var fm = Ext.util.Format;
	var safely = owl.os.safely;


	// shows an Info window about a given file or directory.
	function showAboutWindow(fso) {
		var ts = fso.getTimestamps();
		var access = 'Private';
		if ( fso.isPublic() ) access = 'Public';

		var type = fso.typeDescription;
		type = type[0].toUpperCase() + type.slice(1);

		var content = type + ': ' +  fso.getName() + '<br>' + 
			'Username: ' + fso.getUsername() + '<br>' + 
			'Access: ' + access + '<br><br>' +
			'Created: ' + ts.created + '<br>' + 
			'Modified: ' + ts.modified + '<br>';

		Ext.Msg.show({
		   title: 'About ' + type,
		   msg: content,
		   buttons: Ext.Msg.OK,
		   icon: Ext.Msg.INFO
		});
	}

	// Record Class for the DirectoryStore.
	var FSORecord = Ext.data.Record.create([
		'name',
		'type',
		'username',
		'created',
		'modified',
		'isPublic',
		'fso'
	]);
	Ext.apply(FSORecord.prototype, {
		getActions: function() {
			var type = this.get('type');
			if ( type === 'directory' ) {
				var dir = this.get('fso');
				return [{
					text: 'Open',
					handler: function() { new FileManagerApp({ dir: dir }); },
					iconCls: 'os-fileui-open-directory-icon'
				}, {
					text: 'Delete',
					handler: safely(function() { 
						var name = dir.getName();
						dir.del(); 
						os.log.notification("directory " + name + " deleted!");
					}),
					iconCls: 'os-fileui-delete-directory-icon',
					disabled: !dir.canWrite()
				}, {
					text: 'Make Public',
					iconCls: 'os-fileui-make-directory-public-icon',
					handler: safely(function() { 
						dir.makePublic(); 
						os.log.notification("directory " + dir.getName() + " was made public!");
					}),
					disabled: dir.isPublic() || !dir.canWrite()
				}, {
					text: 'Give To',
					iconCls: 'os-fileui-give-icon',
					handler: function() {
						var warning = '';
						if ( !dir.isPublic() ) warning = 'Careful! You will lose write permission to this directory if you give it to another user.<br>';
						Ext.Msg.prompt('Give To', warning + 'Give ' + dir.getName() + ' to user:', safely(function(button, username) {
							if ( button != 'ok' || !username ) return;
							dir.giveTo(username);
						}));
					},
					disabled: !dir.canWrite()
				}, {
					text: 'About',
					iconCls: 'os-fileui-about-icon',
					handler: function() {
						showAboutWindow(dir);
					}
				}];
			} else if ( type === 'file' ) {
				var file = this.get('fso');
				return [{
					text: 'Open',
					handler: safely(function() { 
						owl.os.app.openFile(file);
					}),
					iconCls: 'os-fileui-open-file-icon'
				}, {
					text: 'Delete',
					handler: safely(function() { 
						var name = file.getName();
						file.del(); 
						os.log.notification(name + " was deleted!");
					}),
					iconCls: 'os-fileui-delete-file-icon',
					disabled: !file.canWrite()
				}, {
					text: 'Make Public',
					iconCls: 'os-fileui-make-file-public-icon',
					handler: safely(function() { 
						file.makePublic(); 
						os.log.notification(file.getName() + " was made public!");
					}),
					disabled: file.isPublic() || !file.canWrite()
				}, {
					text: 'Give To',
					iconCls: 'os-fileui-give-icon',
					handler: function() {
						var warning = '';
						if ( !file.isPublic() ) warning = 'Careful! You will lose write permission to this file if you give it to another user.<br>';
						Ext.Msg.prompt('Give To', warning + 'Give ' + file.getName() + ' to user:', safely(function(button, username) {
							if ( button != 'ok' || !username ) return;
							file.giveTo(username);
						}));
					},
					disabled: !file.canWrite()
				}, {
					text: 'About',
					iconCls: 'os-fileui-about-icon',
					handler: function() {
						showAboutWindow(file);
					}
				}]
			} else {
				return [];
			}
		},

		// shows the actions for this FSO as a contextmenu.  You can
		// include an optional array your own additional actions.
		showFsoContextMenu: function(eventObject, additionalActions) {
			if ( !additionalActions ) additionalActions = [];
			eventObject.stopEvent();
			var contextActions = this.getActions();
			if ( additionalActions && additionalActions.length ) {
				var aboutAction = contextActions.pop();
				contextActions = contextActions.concat(additionalActions);
				contextActions.push(aboutAction);
			}
			var contextMenu = new Ext.menu.Menu({
				shadow: 'drop',
				items: contextActions
			});
			contextMenu.showAt( eventObject.getXY() );
		}
	});

	// A store that binds to a directory and has a record
	// for each file and directory in it.
	// Use the optional 'dir' config or bindToDirectory()
	// method to have the store reflect the files in a given directory.
	function DirectoryStore(config) {
		DirectoryStore.superclass.constructor.call(this, config);
		if ( this.dir ) this.bindToDirectory(this.dir);
	}
	Ext.extend(DirectoryStore, Ext.data.Store, {

		// undocumented but required store config; normally obtained  from the configured reader.
		recordType: FSORecord,
		
		newRecord: function(fso) {
			var fsoRec = new this.recordType( Ext.apply({
				name: fso.getName(),
				type: fso.typeDescription,
				username: fso.getUsername(),
				isPublic: fso.isPublic(),
				fso: fso
			}, fso.getTimestamps()) );
			
			fso.on('modify', function() {
				var modified = fso.getTimestamps().modified;
				fsoRec.set('modified', modified);
				fsoRec.commit();
			});
			
			fso.on('metachange', function() {
				var timestamps = fso.getTimestamps();
				fsoRec.beginEdit();
				fsoRec.set('name', fso.getName());
				fsoRec.set('username', fso.getUsername());
				fsoRec.set('created', timestamps.created);
				fsoRec.set('modified', timestamps.modified);
				fsoRec.set('isPublic', fso.isPublic());
				fsoRec.endEdit();
				fsoRec.commit();
			});
			
			return fsoRec;
		},
		
		bindToDirectory: function(dir) {
			// tear down the existing directory, if any.
			this.removeAll();
			if ( this.dir ) {
				this.dir.un('add', this.onDirectoryAdd, this);
				this.dir.un('remove', this.onDirectoryRemove, this);
			}
			
			// use the new directory.
			this.dir = dir;
			
			// populate this from current children
			var fsos = dir.getChildren();
			var records = [];
			for ( var i=0; i < fsos.length; i++ ) {
				var fso = fsos[i];
				records.push( this.newRecord(fso) );
			}
			this.add(records);
			
			// keep in sync as the dir changes
			dir.on('add', this.onDirectoryAdd, this);
			dir.on('remove', this.onDirectoryRemove, this);
		},

		getDirectory: function() {
			return this.dir;
		},
		
		onDirectoryAdd: function(dir, fso) {
			this.add([ this.newRecord(fso) ]);
		},
		
		onDirectoryRemove: function(dir, fso) {
			var index = this.findBy(function(fsoRec) {
				return fsoRec.get('fso') === fso;
			});
			this.removeAt(index);
		},
		
		getFsoAtIndex: function(index) {
			var fsoRec = this.getAt(index);
			return fsoRec.get('fso');
		},
		
		renameFso: safely(function(index, newName) {
			this.getFsoAtIndex(index).moveTo(this.dir, newName);
		}),
		
		deleteFile: safely(function(index) {
			this.getFsoAtIndex(index).del();
		})

	});

	// custom StatusProxy for dragging files around.
	function FileDragProxy(config) {
		Ext.apply(this, config);
		this.id = this.id || Ext.id();
		this.el = new Ext.Layer({
			dh: {
				id: this.id, tag: "div", cls: this.baseCls + this.dropNotAllowed, children: [
					{tag: "div", cls: "os-fileui-drag-ghost"}
				]
			}, 
			shadow: false
		});
		this.ghost = this.el.child('div.os-fileui-drag-ghost');
		this.dropStatus = this.dropNotAllowed;
	}
	Ext.extend(FileDragProxy, Ext.dd.StatusProxy, {
		baseCls: "os-fileui-drag-proxy semi-transparent-very ",

		reset : function(clearGhost){
			this.el.dom.className = this.baseCls + this.dropNotAllowed;
			this.dropStatus = this.dropNotAllowed;
			if(clearGhost){
				this.ghost.update("");
			}
		}
	});

	// A specialized drag zone for DirectoryIconViews.
	function DirectoryDragZone(dataView, config) {
		if ( !config ) config = {};
		this.proxy = new FileDragProxy();
		DirectoryDragZone.superclass.constructor.call(this, dataView.getEl(), config);
		this.dataView = dataView;
	}
	Ext.extend(DirectoryDragZone, Ext.dd.DragZone, {
		ddGroup: 'fileMove',

		getDragData: function(eventObject) {
			// use the dataView's own itemSelector to find which "node" was clicked on.
			// (In the DataView API's terminology, "nodes" are those elements that 
			// correspond 1-1 with Records in the Store.)  node is an HTMLElement.
			var node = eventObject.getTarget(this.dataView.itemSelector, 10);

			// if they're dragging outside of a node, do nothing.  Otherwise:
			if ( node ) {
				var ddel = node.cloneNode(true); // "ddel" means "drag-drop-element."
				ddel.id = Ext.id();  // give the copy its own id.
				this.dragData = {
					sourceNode: node,
					ddel: ddel,
					fsoRecord: this.dataView.getRecord(node),
					originalDir: this.dataView.store.getDirectory()
				};
				return this.dragData;
			}
		},

		// repair to the source node's position.
		getRepairXY: function(eventObject) {
			if ( this.dragData ) {
				return Ext.fly(this.dragData.sourceNode).getXY();
			} else {
				return eventObject.getXY();
			}
		}
	});

	// A specialized drop zone for the DirectoryIconView.
	function DirectoryDropZone(dataView, config) {
		if ( !config ) config = {};
		DirectoryDropZone.superclass.constructor.call(this, dataView.getEl(), config);
		this.dataView = dataView;
		this.actions = [];
	}
	Ext.extend(DirectoryDropZone, Ext.dd.DropZone, {
		ddGroup: 'fileMove',

		getTargetFromEvent: function(eventObject) {
			var targetView = eventObject.getTarget('.os-fileui-directory-icon-view', 10);
			if ( targetView && targetView.id === this.dataView.getId() ) {
				var target = eventObject.getTarget(this.dataView.itemSelector, 10);
				if ( target ) return target;
				else return this.dataView.getEl();
			}
		},

		onNodeEnter: function(target, dd, eventObject, data) {
			if ( target === this.dataView.getEl() ) return;

			// only hightlight directories.
			var targetRecord = this.dataView.getRecord(target);
			if ( targetRecord && targetRecord.get('type') === 'directory' ) {
				Ext.fly(target).addClass('os-fileui-selected');
			}
		},

		onNodeOut: function(target, dd, eventObject, data) {
			if ( target === this.dataView.getEl() ) return;
			Ext.fly(target).removeClass('os-fileui-selected');
		},

		onNodeOver: function(target, dd, eventObject, data) {
			return this.dropAllowed;
		},

		onNodeDrop: function(target, dd, eventObject, data) {
			// the file or directory that was dragged here.
			var fso = data.fsoRecord.get('fso');

			// if its dropped onto a folder, put it in that folder. Otherwise,
			// put it in this directory.
			var targetRecord = this.dataView.getRecord(target);
			if ( targetRecord && targetRecord.get('type') === 'directory' ) {
				var dir = targetRecord.get('fso');
			} else {
				var dir = this.dataView.getStore().getDirectory();
			}

			// don't move (repair instead) if dragged to the same directory.
			// Note: the repair doesn't seem to occur if dragged to somewhere else in the same
			// iconView; probably the DragZone treats that as a special case.  This does prevent
			// the move from occuring, and does cause tthe repair to be shown in other cases.
			if ( dir === data.originalDir ) return false;

			// onNodeDrop can be called multiple times for the same drop, but we
			// can only move the file once.  Consolidate duplicate drops into a single move.
			this.consolidate(safely(function() { 
				fso.moveTo(dir); 
				os.log.message(fso.getName() + ' was dragged to directory ' + dir.getName() + '.');
			}));
			
			return true;
		},

		// consolidate duplicate drops by buffering for a short interval and then
		// only performing the first action, throwing away the duplicates.
		consolidate: function(action) {
			this.actions.push(action);
			clearTimeout(this.consolidationId);
			this.consolidationId = this.delayedConsolidation.defer(10, this);
		},

		delayedConsolidation: function() {
			if ( this.actions[0] ) this.actions[0]();
			this.actions = [];
		}
	});
	

	// icon column renderers
	var icon = owl.os.ui.icon;
	function fileTypeRenderer(type) { return icon('os-fileui-' + type + '-icon'); }
	function publicRenderer(isPublic) {
		if ( isPublic ) return icon('os-fileui-public-icon');
		else return icon('');
	}
	
	// A detailed table-like view of a DirectoryStore.
	function DirectoryDetailView(config) {

		// replace the editor field each time.  The rest of the config can be reused.
		var nameColumn = owl.find(this.columns, 'name', { property: 'dataIndex', item: true });
		if ( nameColumn ) nameColumn.editor = new Ext.form.TextField();

		DirectoryDetailView.superclass.constructor.call(this, config);
		this.on('afteredit', this.onAfterEditName, this);
	}
	Ext.extend(DirectoryDetailView, Ext.grid.EditorGridPanel, {
		cls: 'os-fileui-directory-detail-view',
		autoExpandColumn: 1,
		clicksToEdit: 1,

		columns: [
			{ dataIndex: 'type', header: 'Type', width: 35, sortable: true,
			  renderer: fileTypeRenderer
			},
			{ dataIndex: 'name', header: 'Name', width: 120, sortable: true
			},
			{ dataIndex: 'username', header: 'User', width: 70, sortable: true },
			{ dataIndex: 'isPublic', header: 'Public', width: 40, sortable: true,
			  renderer: publicRenderer
			},
			{ dataIndex: 'created', header: 'Created', width: 110, sortable: true,
			  renderer: os.ui.dateTimeColumnRenderer
			},
			{ dataIndex: 'modified', header: 'Content Modified', width: 110, sortable: true,
			  renderer: os.ui.dateTimeColumnRenderer
			}
		],

		initEvents: function() {
			DirectoryDetailView.superclass.initEvents.apply(this, arguments);
			this.on('rowcontextmenu', this.onRowContextMenu, this);
		},

		onRowContextMenu: function(detailView, index, e) {
			var fsoRec = this.store.getAt(index);
			var viewActions = this.getActions(index);
			fsoRec.showFsoContextMenu(e, viewActions);
		},

		getActions: function(index) {
			var nameCol = this.getColumnModel().findColumnIndex('name');
			return [{
				text: 'Rename',
				iconCls: 'os-fileui-rename-icon',
				handler: function() {
					this.startEditing(index, nameCol);
				},
				scope: this,
				disabled: !this.canWrite()
			}];
		},

		canWrite: function() {
			return this.app.dir.canWrite();
		},

		onAfterEditName: safely(function(ev) {
			if ( ev.value === ev.originalValue) return;

			var dirStore = ev.grid.getStore();
			dirStore.renameFso(ev.row, ev.value);
		})
	});
	
	function DirectoryIconView(config) {
		DirectoryIconView.superclass.constructor.call(this, config);
		this.addEvents(
			'open'
		);
		this.editor = this.newEditor();
		this.bindEditor(this.editor);
	}
	Ext.extend(DirectoryIconView, Ext.DataView, {
		itemSelector: 'li',
		selectedClass: 'os-fileui-selected',
		cls: 'os-fileui-directory-icon-view',

		tpl: new Ext.XTemplate(
			'<ul>',
				'<tpl for=".">',
					'<li <tpl if="isPublic">class="os-fileui-public-icon"</tpl>>',
						'<img class="os-icon32 os-fileui-{type}-icon32" src="icons/invisi.gif"/>',
						'<span>{[this.splitName(values.name)]}</span>',
					'</li>',
				'</tpl>',
			'<ul>', {
			
				middleEllipsis: function(name, fullLength) {
					var head = name.slice(0,-6);
					var tail = name.slice(-6);
					return fm.ellipsis(head, fullLength-6) + tail;
				},
			
				splitName: function(name) {
					var length = 13; // the length of one line.
					
					// one line, no worries
					if ( name.length <= length ) return name;
					
					// more than two lines, truncate with ...
					name = this.middleEllipsis(name, length*2);
					
					// split the two lines.
					var midpoint = length;
					var dot = name.lastIndexOf('.');
					if ( dot < length && (name.length-dot) < length ) midpoint = dot;
					var head = name.slice(0, midpoint);
					var tail = name.slice(midpoint);
					return head + '<br/>' + tail;
				}
			}
		),
		
		newEditor: function() {
			var field = new Ext.form.TextField({
				name: 'inline_file_rename',
				allowBlank: false,
				height: 20,
				width: 100,
				selectOnFocus: true
			});
			var editor = new Ext.Editor(field, {
				cls: 'x-small-editor',
				hideEl: false,
				shadow: 'drop',
				shim: false,
				alignment: 'c-c?',
				ignoreNoChange: true,
				cancelOnEsc: true,
				completeOnEnter: true
			});
			return editor;
		},

		bindEditor: function(editor) {
			editor.on('complete', this.onNameEditComplete, this);

			// cancel the editor if anything external changes.
			// I can't catch window minification, oh well.
			function cancel() { editor.cancelEdit(); };
			this.on('hide', cancel);
			this.on('destroy', cancel);
			this.on('resize', cancel);
			this.on('move', cancel);
		},
		
		onRender: function() {
			DirectoryIconView.superclass.onRender.apply(this, arguments);
			this.on('dblclick', this.onIconDoubleClick, this);
			this.on('contextmenu', this.onIconContextMenu, this);
		},

		afterRender: function() {
			DirectoryIconView.superclass.afterRender.apply(this, arguments);
			
			// these have to be constructed after render since they bind to the
			// underlying markup.  Also, the dragZone has to be created first.
			this.dragZone = new DirectoryDragZone(this);
			this.dropZone = new DirectoryDropZone(this);
		},
		
		onNameDblClick: function(mouseEvent) {
			var target = Ext.get( mouseEvent.getTarget() );
			var index = this.indexOf( this.findItemFromChild(target) );
			if ( index < 0 ) return;
			mouseEvent.stopEvent();
			this.startNameEdit(index);
		},

		startNameEdit: function(index) {
			var target = Ext.get(this.getNode(index)).child('span');
			var fsoRec = this.store.getAt(index);
			if ( !fsoRec ) return;
			var filename = fsoRec.get('name');
			this.editor.startEdit(target, filename);
		},
		
		onNameEditComplete: function(editor, newName, oldName) {
			var index = this.indexOf( this.findItemFromChild(editor.boundEl.dom) );
			this.store.renameFso(index, newName);
		},

		// automatically do the first action on double click
		onIconDoubleClick: function(iconView, index, node, e) {
			if ( e.getTarget('span') ) {
				this.onNameDblClick(e);
				return;
			}
			e.stopEvent();
			var fsoRec = this.store.getAt(index);
			var firstAction = fsoRec.getActions()[0];
			if ( firstAction ) firstAction.handler.call(firstAction.scope);
		},

		onIconContextMenu: function(iconView, index, node, e) {
			var fsoRec = this.store.getAt(index);
			var viewActions = this.getActions(index);
			fsoRec.showFsoContextMenu(e, viewActions);
		},

		getActions: function(index) {
			return [{
				text: 'Rename',
				iconCls: 'os-fileui-rename-icon',
				handler: function() {
					this.startNameEdit(index);
				},
				scope: this,
				disabled: !this.canWrite()
			}];
		},

		canWrite: function() {
			return this.app.dir.canWrite()
		}
	});
	
	// Config: dir a directory object.
	function FileManagerApp(config) {
		FileManagerApp.superclass.constructor.call(this, config);
	}
	Ext.extend(FileManagerApp, os.app.App, {
		
		setup: function() {
			if ( !this.dir ) this.dir = os.root;
			this.dir.on('delete', this.onDirectoryDelete, this);
			this.dirStore = new DirectoryStore();
			this.dirStore.bindToDirectory(this.dir);
			this.openWindow(FileManagerWindow, {
				title: this.dir.getName(),
				dirStore: this.dirStore,
				app: this
			});
		},
		
		onDirectoryDelete: function() { this.exit(); },
		
		newIconView: function(config) {
			return new DirectoryIconView( Ext.apply({
				app: this,
				store: this.dirStore,
				listeners: {
					scope: this.dirStore
				}
			}, config) );
		},

		newDetailView: function(config) {
			return new DirectoryDetailView( Ext.apply({
				app: this,
				store: this.dirStore
			}, config) );
		}
	});
	owl.os.app.register(FileManagerApp, {
		name: 'FileManager',
		iconCls: 'os-fileui-file-manager-icon'
	});

	function FileManagerWindow(config) {
		FileManagerWindow.superclass.constructor.call(this, config);
	}
	Ext.extend(FileManagerWindow, os.app.AppWindow, {
		layout: 'fit',
		iconCls: 'os-fileui-file-manager-icon',
		width: 500,
		
		onRender: function() {
			FileManagerWindow.superclass.onRender.apply(this, arguments);
			
			this.tabs = new Ext.TabPanel({
				activeItem: 0,
				items: [
					this.app.newIconView({
						title: 'Files'
					}),
					this.app.newDetailView({
						title: 'Details'
					})
				]
			});
			this.add(this.tabs);
		}
	});
	
	
	return {
		showAboutWindow: showAboutWindow,
		DirectoryStore: DirectoryStore,
		DirectoryIconView: DirectoryIconView,
		DirectoryDetailView: DirectoryDetailView,
		DirectoryStore: DirectoryStore,
		FileManagerApp: FileManagerApp,
		FileManagerWindow: FileManagerWindow
	};
});

// tests
owl.namespace('owl.os.fileui', function() {
	return {
		LongNameGuiTest: Ext.extend(owl.unittest.GuiTest, {
			name: 'LongNameGuiTest',

			run: function() {
				var guest = owl.os.root.getChildByName('guest');
				var longNames = guest.addDirectory('this_folder_has_files_with_long_names');
				longNames.addNewFile('123456789ABCD.html');
				longNames.addNewFile('123456789ABCD.txt');
			    longNames.addNewFile('123456789ABCDEF01234.txt');
				longNames.addNewFile('123456789ABCDEF01234567890ABCDEF.txt');
				longNames.addNewFile('123456789A.123456789A');
				new owl.os.fileui.FileManagerApp({ dir: longNames });
			}
		})
	};
});
