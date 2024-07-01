// Copyright 2010 Oran Looney
owl.namespace('owl.os', function() {
	/* Contains "Operating System" level services, like the file system and users.*/

	function getCurrentUser() { return 'guest'; }

	// function decorator to report uncaught exceptions to the user.
	function safely(fn) {
		return function() {
			try {
				return fn.apply(this, arguments);
			} catch (e) {
				owl.os.log.error(e.message);
			}
		}
	}

	// private; create unique INode ids.
	var nextINodeId = 1;
	function getNextINodeId() { return nextINodeId++; }

	function INode(config) {
		this.id = getNextINodeId();
		this.username = getCurrentUser();
		this.modified = new Date();
		this.created = this.modified;
		this.content = '';
		if ( config && config.listeners ) {
			this.listeners = config.listeners;
		}
		INode.superclass.constructor.call(this);
		this.addEvents(
			'modify',
			'metachange'
		);
	}
	Ext.extend(INode, Ext.util.Observable, {
	
		load: function(callback, scope) {
			callback.call(scope, this.content);
		},
		
		save: function(content, callback, scope) {
			this.modified = new Date();
			this.content = content;
			if ( callback ) callback.call(scope, this.modified);
			this.fireEvent('modify', this);
		},
		
		touch: function(callback, scope) {
			this.modified = new Date();
			if ( callback ) callback.call(scope, this.modified);
			this.fireEvent('modify', this);
		},
		
		makePublic: function() {
			if ( !this.public ) {
				this.public = true;
				this.fireEvent('metachange', this);
			}
		},

		setUsername: function(username) {
			this.username = username;
			this.fireEvent('metachange', this);
		}
	});
	
	function FileSystemObject(config) {
		Ext.apply(this, config);
		FileSystemObject.superclass.constructor.call(this);
		if ( !this.name ) throw Error('A FileSystemObject must have a name.');
		this.addEvents(
			// fired when the FSO wants to be removed from its parent.
			'delete', 
			
			// modify is a special event that indicates that modified timestamp
			// has been updated.  For files this usually indicates the content
			// has been modified.
			'modify',
			
			// the meta-change event indicates that some piece of metadata has
			// changed: name, username, timestamps, public.  The only thing
			// that can never change is type.  The modified timestamp may have
			// changed, even though that's handled by the modify event.
			'metachange'
		);
	}
	Ext.extend(FileSystemObject, Ext.util.Observable, {
	
		// public, read-only
		typeDescription: 'file system object',
		
		getName: function() { return this.name; },
		
		getUsername: function() { return 'unknownuser'; },
		
		getTimestamps: function() { return { created: null, modified: null }; },
		
		isPublic: function() { return true; },
		
		makePublic: function() {},

		// should update the modified timestamp are file the modify event.		
		touch: function() {},
		
		canWrite: function() {
			return this.isPublic() || this.getUsername() === getCurrentUser();
		},
		
		requireCanWrite: function() {
			if ( !this.canWrite() ) {
				var message = [
					getCurrentUser(),
					'does not have write permission to',
					this.typeDescription,
					this.getName()
				].join(' ');
				throw Error(message);
			}
		},
		
		del: function() { this.fireEvent('delete', this); },
			
		moveTo: function(dir) {},
		
		copyTo: function(dir) {},

		giveTo: function(username) {}

	});


	function File(config) {
		File.superclass.constructor.call(this, config);
		if ( !this.iNode ) throw Error('A File must have an iNode.');
		this.addEvents('modify');
		this.bindINodeRelays();
	}
	Ext.extend(File, FileSystemObject, {
		typeDescription: 'file',
	
		// private
		bindINodeRelays: function() {
			var iNode = this.iNode;
			var file = this;
			iNode.on('modify', function() { file.fireEvent('modify', file); });
			iNode.on('metachange', function() { file.fireEvent('metachange', file); });
		},
	
		getUsername: function() { return this.iNode.username; },

		getTimestamps: function() {
			return {
				created: this.iNode.created,
				modified: this.iNode.modified
			}
		},
		
		isPublic: function() { return this.iNode.public; },
		
		makePublic: function() { 
			this.requireCanWrite();
			this.iNode.makePublic();
		},
		
		load: function(callback, scope) { 
			this.iNode.load(callback, scope); 
		},
				
		save: function(content, callback, scope) {
			this.requireCanWrite();
			this.iNode.save(content, callback, scope);
		},
				
		touch: function(callback, scope) {
			this.requireCanWrite();
			this.iNode.touch(callback, scope);
		},
		
		moveTo: function(dir, name) {
			var file = dir.addLink(this, name);
			this.del();
		},
		
		copyTo: function(dir, name) {
			return dir.addCopy(this);
		},

		giveTo: function(username) {
			if ( username == this.iNode.username ) return;
			this.requireCanWrite();
			this.iNode.setUsername(username);
		},
		
		addLinkTo: function(dir, name) {
			return dir.addLink(this, name);
		}
		
	});


	function Directory(config) {
		Directory.superclass.constructor.call(this, config);
		this.addEvents('add', 'remove');
		this.created = new Date();
		this.children = [];
		this.username = getCurrentUser();
		this.public = !!this.public;
	}
	Ext.extend(Directory, FileSystemObject, {
		typeDescription: 'directory',
	
		getUsername: function() { return this.username; },
	
		getTimestamps: function() {
			return {
				created: this.created,
				modified: this.created  // directories never change.
			}
		},
			
		isPublic: function() { return this.public; },
		
		makePublic: function() {
			this.requireCanWrite();
			this.public = true;
			this.fireEvent('metachange', this);
		},
		
		addNewFile: function(name) {
			this.requireCanWrite();
			var file = new File({
				name: name,
				iNode: new INode()
			});
			this.add(file);
			return file;
		},
		
		addCopy: function(file, name) {
			this.requireCanWrite();
			var copy = this.addNewFile( name || file.getName() );
			file.load(copy.save, copy);
			return copy;
		},
		
		addLink: function(file, name) {
			this.requireCanWrite();
			var file = new File({
				name: name || file.getName(),
				iNode: file.iNode
			});
			this.add(file);
			return file;
		},
		
		addDirectory: function(name) {
			this.requireCanWrite();
			var dir = new Directory({ name: name });
			this.add(dir);
			return dir;
		},
		
		// private
		add: function(child) { 
			this.requireCanWrite();
			child.on('delete', this.remove, this);
			this.children.push(child);
			this.fireEvent('add', this, child);
		},
		
		// private; invoke del() on the child instead.
		remove: function(child) {
			this.requireCanWrite();
			this.children.remove(child);
			child.un('delete', this.remove, this);
			this.fireEvent('remove', this, child);
			this.touch();
		},
		
		touch: function() {
			this.requireCanWrite();
			this.modified = new Date();
			this.fireEvent('modify', this);
		},
		
		getChildren: function() {
			return this.children.slice();
		},
		
		getChildByName: function(name) {
			return owl.find(this.children, name, {
				method: 'getName',
				item: true
			});
		},
		
		del: function() {
			Directory.superclass.del.apply(this, arguments);
			if  ( this.canWrite() ) {
				while ( this.children.length ) {
					try { 
						this.children[0].del();
					} catch (e) {
						// we may not be able to perform all
						// recursive deletes.  That's ok.
					}
				}
			}
		},
		
		copyTo: function(dir, name) {
			var copyDir = dir.addDirectory( name || this.getName() );
			for ( var i=0; i<this.children.length; i++ ) {
				var child = this.children[i];
				child.copyTo(copyDir);
			}
			return copyDir;
		},

		giveTo: function(username) {
			if ( username == this.username ) return;
			this.requireCanWrite();
			this.username = username;
			this.fireEvent('metachange', this);
		},
		
		moveTo: function(dir, name) {
			dir.requireCanWrite();
			this.fireEvent('delete', this);
			if ( name ) this.name = name;
			dir.add(this);
		}
	});
	// the global filesystem root is just a Directory called root.
	var root = new Directory({ name: 'root' });

	function getHomeDir() {
		return root.getChildByName(getCurrentUser());
	}
	
	// Singleton.  Used for logging system messages.
	function Log() {
		this.recordType = this.Entry;
		Log.superclass.constructor.call(this);
	}
	Ext.extend(Log, Ext.data.Store, {

		Entry: Ext.data.Record.create([
			'type',
			'message',
			'timestamp'
		]),
		
		addEntry: function(type, message) {
			this.add([ new this.Entry({
				type: type,
				message: message,
				timestamp: new Date()
			}) ]);
			this.sort('timestamp', 'DESC');
		},
	
		error: function(message) {
			this.addEntry('error', message);
			owl.os.ui.show.error(message);
		},
		
		info: function(message) {
			this.addEntry('info', message);
			owl.os.ui.show.info(message);
		},
		
		warning: function(message) {
			this.addEntry('warning', message);
			owl.os.ui.show.warning(message);
		},
		
		// temporary message the user can ignore
		aside: function(message) {
			this.addEntry('aside', message);
			owl.os.ui.show.aside(message);
		},

		notification: function(message) {
			this.addEntry('info', message);
			owl.os.ui.show.notification(message);
		},
		
		// background logging for the usual, boring
		// "I did X! I made a Y!" log messages.
		message: function(message) {
			this.addEntry('message', message);
		},
		
		// background logging for bad status message
		// the user doesn't care/need-to-know about.
		problem: function(message) {
			this.addEntry('problem', message);
		}
	});

	var log = new Log();
	
	// replace the default error() function with
	// a call to log.error().
	owl.error = function(message) {
		log.error(message);
	}
	
	return {
		getCurrentUser: getCurrentUser,
		getHomeDir: getHomeDir,
		INode: INode,
		File: File,
		Directory: Directory,
		root: root,
		log: log,
		safely: safely
	};
});

// tests
owl.namespace('owl.os', function() {
	// imports
	os = owl.os;

	return {
		FileSystemTest: Ext.extend(owl.unittest.TestCase, {
			name: 'FileSystemTest',
			
			setUp: function() {
				this.dir = new os.Directory({ name: 'dir' });
				this.file = this.dir.addNewFile('file.txt');
			},

			forBoth: function(testFunc) {
				testFunc.call(this, this.dir);
				testFunc.call(this, this.file);
			},

			testName: function() {
				this.assertEqual(this.dir.getName(), 'dir', 'dir name');
				this.assertEqual(this.file.getName(), 'file.txt', 'filename');
			},

			testPublic: function() {
				this.forBoth(function(fso) {
					this.assertIdentical(fso.isPublic(), false, 'not public');
					fso.makePublic();
					this.assertIdentical(fso.isPublic(), true, 'public');
				});
			},

			testUsername: function() {
				this.forBoth(function(fso) {
					this.assertEqual(fso.getUsername(), os.getCurrentUser(), 'username');
				});
			},

			testCanWrite: function() {
				this.forBoth(function(fso) {
					this.assertIdentical(fso.canWrite(), true, 'can write');
					fso.requireCanWrite();
					
					// hack in another username.
					if ( fso.iNode ) fso.iNode.username = 'other';
					else fso.username = 'other'; 

					this.assertIdentical(fso.canWrite(), false, 'can\'t write');
					this.assertThrows(Error, function() {
						fso.requireCanWrite();	
					}, 'require throws when can\'t write');
					fso.makePublic();
					this.assertIdentical(fso.canWrite(), true, 'can write public');
					fso.requireCanWrite();
				});
			}
			
		}),

		LogGuiTest: Ext.extend(owl.unittest.GuiTest, {
			name: 'LogGuiTest',

			run: function() {
				var sma = new os.tools.SystemManagerApp({
					initialView: 'log'
				});

				var log = os.log;
				log.aside('As an aside, this is a message.');
				log.info('I am providing helpful information.');
				log.error('Unable to show error!')
				log.warning('I warned you...');
				log.message('I logged a message.');
				log.message('this message is very long.  It wraps around in the log and takes up several lines of text.  This should look ok in the system log viewer.');
				log.problem('There is a problem...');
			}
		})
	};
});
