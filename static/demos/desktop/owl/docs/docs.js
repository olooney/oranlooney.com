// Copyright 2010 Oran Looney
owl.namespace('owl.docs', function() {
	// The project should be self-documenting.  This is the framework
	// for documenting within within the application itself.

	// imports
	var app = owl.os.app;


	// determines the URL of the javascript file for a given namespace.
	// this works because the JavaScript files in this project follow 
	// a strict namespace/path convention.
	function namespaceToUrl(namespace) {
		var pieces = namespace.split('.');

		// the first couple levels of namespaces go in their own folders;
		// i.e. owl/os/os.js instead of owl/os.js.
		if ( pieces.length <= 2 ) {
			pieces.push(pieces[pieces.length-1]);
		}
		
		return pieces.join('/') + '.js';
	}

	function DocViewerApp(config) {
		DocViewerApp.superclass.constructor.call(this, config);
	}
	Ext.extend(DocViewerApp, app.App, {
		setup: function() {
			this.openWindow(DocsListWindow);
		},


		// opens a new window showing the source code for a given namespace.
		viewSource: function(namespace) {
			this.openWindow(SourceViewerWindow, {
				src: namespaceToUrl(namespace),
				title: 'Source: ' + namespace
			});
		}
	});
	app.register(DocViewerApp, {
		name: 'DocViewer',
		iconCls: 'os-docs-viewer-icon'
	});

	function DocsListWindow(config) {
		DocsListWindow.superclass.constructor.call(this, config);
	}
	Ext.extend(DocsListWindow, app.AppWindow, {
		title: 'DocViewer - List',
		cls: 'os-docs-list-window',
		iconCls: 'os-docs-list-icon',

		tpl: new Ext.XTemplate(
			'<ul class="os-docs-list-namespaces">',
				'<tpl for=".">',
					'<li><a href="{[this.namespaceToUrl(values)]}">{.}</a></li>',
				'</tpl>',
			'</ul>',
			{ namespaceToUrl: namespaceToUrl }
		),

		onRender: function() {
			DocsListWindow.superclass.onRender.apply(this, arguments);
			this.tpl.overwrite(this.body, owl.listNamespaces());
			this.body.on('click', this.onClick, this);
		},

		onClick: function(e) {
			e.stopEvent();
			var target = e.getTarget('a');
			if ( !target ) return;
			var namespace = target.innerHTML;
			this.app.viewSource(namespace);
		}
	});

	// Config: src - URL string to the document to view.
	function SourceViewerWindow(config) {
		SourceViewerWindow.superclass.constructor.call(this, config);
		this.on('show', this.onSourceViewerShow, this);
		this.on('resize', this.onSourceViewerResize, this);
	}
	Ext.extend(SourceViewerWindow, app.AppWindow, {
		cls: 'os-docs-source-viewer-window',
		iconCls: 'os-docs-source-viewer-icon',
		html: '<iframe></iframe>',

		// returns the iframe DOM Element.
		getIFrame: function() {
			return this.body.query('iframe')[0];
		},

		onSourceViewerResize: function() {
			Ext.get(this.getIFrame()).setSize(
				this.getInnerWidth(),
				this.getInnerHeight() - 10  // room for the scroll bar
			);
		},

		onSourceViewerShow: function() {
			this.getIFrame().src = this.src;
			this.onSourceViewerResize();
		}

	});

	return {
		DocViewerApp: DocViewerApp,
		DocsListWindow: DocsListWindow,
		SourceViewerWindow: SourceViewerWindow
	};
});
