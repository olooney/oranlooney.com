// Copyright 2010 Oran Looney
owl.namespace('owl.unittest.runner', function() {
	// imports
	var ut = owl.unittest;
	var app = owl.os.app;

	function TestRunnerApp(config) {
		TestRunnerApp.superclass.constructor.call(this, config);
		this.addEvents('resultschange');
	}
	Ext.extend(TestRunnerApp, app.App, {
		setup: function() {
			this.results = [];
			this.openWindow(ResultWindow, {
				iconCls: 'os-unittest-runner-icon',
				title: 'TestRunner',
				results: this.results,
				tbar: [
					{
						text: 'Run Unit Tests',
						handler: this.runAllUnitTests,
						scope: this
					},
					'->',
					{
						text: 'Run GUI Test',
						menuAlign: 'tr-br?',
						menu: new Ext.menu.Menu({
							items: this.getAllActionsForGuiTests()
						})
					}
				]
			});
		},

		loadAllGuiTests: function() {
			var namespaces = owl.listNamespaces();
			var guiTests = [];
			for ( var i=0; i < namespaces.length; i++ ) {
				guiTests = guiTests.concat(ut.loadGuiTestsFromNamespace(namespaces[i]));
			}
			return guiTests;
		},

		getAllActionsForGuiTests: function() {
			var guiTests = this.loadAllGuiTests();
			var actions = [];
			Ext.each(guiTests, function(guiTest) {
				actions.push( new Ext.Action({
					text: guiTest.id(),
					handler: function() { guiTest.run(); }
				}) );
			});
			return actions;
		},

		runAllUnitTests: function() {
			var namespaces = owl.listNamespaces();
			for ( var i=0; i < namespaces.length; i++ ) {
				var suite = ut.loadTestsFromNamespace(namespaces[i]);
				if ( suite.countTestCases() > 0 ) {
					this.runTest(suite);
				}
			}
			this.fireEvent('resultschange', this);
		},

		runTest: function(test) {
			var result = new ut.TestResult();
			test.run(result);
			this.results.push({
				test: test,
				result: result
			});
		}

	});
	app.register(TestRunnerApp, {
		name: 'TestRunner',
		iconCls: 'os-unittest-runner-icon'
	});

	function ResultWindow(config) {
		ResultWindow.superclass.constructor.call(this, config);
		this.app.on('resultschange', this.onResultsChange, this);
	}
	Ext.extend(ResultWindow, app.AppWindow, {
		cls: 'os-unittest-runner-window',
		autoScroll: true,

		tpl: new Ext.XTemplate(
			'<div class="os-unittest-runner-results">',
				'<tpl for=".">',
					'<div class="os-unittest-runner-result',
						'<tpl if="result.getFailedCount()">',
							' os-unittest-runner-result-failed',
						'</tpl>',
					'">',
						'<span class="os-unittest-runner-result-name">{[values.test.id()]}</span>',
						'<tpl if="result.getPassedCount()">',
							'<b>passed:</b><i>{[values.result.getPassedCount()]}</i>',
						'</tpl>',
						'<tpl if="result.getFailedCount()">',
							'<b>failed:</b><i>{[values.result.getFailedCount()]}</i>',
						'</tpl>',
						'<ul>',
							'<tpl for="result.failures">',
								'<li>',
									'<b>{[values.test.id()]}</b><i>{error}</i>',
								'</li>',
							'</tpl>',
						'</ul>',
					'</div>',
				'</tpl>',
			'</div>'
		),

		onRender: function() {
			ResultWindow.superclass.onRender.apply(this, arguments);
			this.onResultsChange();
		},

		onResultsChange: function() {
			this.tpl.overwrite(this.body, this.results);
		}
	});

	return {
		TestRunnerApp: TestRunnerApp
	};
});

// tests
owl.namespace('owl.unittest.runner', function() {
	return {
		BrokenTest: Ext.extend(owl.unittest.TestCase, {
			name: 'BrokenTest',

			testAssert: function() {
				this.assert(false, 'these tests should fail, to demonstrate how the TestRunner displays failed asserts.');
			},

			testComparisonAssert: function() {
				this.assertEqual(0, 1, 'should fail, example of failed comparison assert.');
			}
		})
	};
});
