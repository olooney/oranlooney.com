// Copyright 2010 Oran Looney 
owl.namespace('owl.unittest', function() {
	// 

	// Based on unittest.TestResult, except:
	//   Doesn't distinguish between errors and failures.
	//   Doesn't implement a stop flag.
	function TestResult() {
		this.failures = [];
		this.testsRun = 0;

	}
	TestResult.prototype = {
		constructor: TestResult,
		
		wasSuccessful: function() {
			return this.failures.length === 0;
		},

		// called when a test is started.
		startTest: function(test) {
			this.testsRun++;
		},

		// called when a test is stopped.
		stopTest: function(test) {
		},
		
		// called when a test fails.
		addFailure: function(test, error) {
			this.failures.push({
				test: test,
				error: this.formatError(error)
			});
		},

		// represent the error as a string.
		formatError: function(error) {
			return error.name + ': ' + error.message;
		},

		getPassedCount: function() {
			return this.testsRun - this.failures.length;
		},

		getFailedCount: function() {
			return this.failures.length;
		}
	};


	// AssertError objects are thrown by the Test framework
	// to provide detailed error messaging.
	function AssertError(message) {
		this.message = message;
	}
	AssertError.prototype = Error();
	AssertError.prototype.name = 'AssertError';
	AssertError.prototype.constructor = AssertError;

	// An extension of Assert error that provides additional information
	// about failed comparision assertions.
	function ComparisonAssertError(assertMessage, op, value1, value2) {
		this.message = [
			assertMessage,
			':',
			value1, 'not', op, value2
		].join(' ');
		this.lhs = value1;
		this.rhs = value2;
		this.op = op;
	}
	ComparisonAssertError.prototype = new AssertError();
	ComparisonAssertError.prototype.name = 'ComparisonAssertError';
	ComparisonAssertError.prototype.constructor = ComparisonAssertError;
	

	function TestCase(methodName) {
		this.methodName = methodName;
	}
	TestCase.prototype = {
		constructor: TestCase,

		// set up a fixture before running a test.
		setUp: function() {},

		// clean up a fixture after running a test.  A fresh Test is instantiated
		// each time a test is run, so you only need to clean up global resources
		// and side effects.
		tearDown: function() {},

		// assert functions throw detailed error messages if a condition isn't satisfied.
		assert: function(value, message) {
			if (!value) throw new AssertError(message);
		},

		assertEqual: function(lhs, rhs, message) {
			if (!(lhs == rhs)) throw new ComparisonAssertError(message, '==', lhs, rhs);
		},

		assertNotEqual: function(lhs, rhs, message) {
			if (!(lhs != rhs)) throw new ComparisonAssertError(message, '!=', lhs, rhs);
		},

		assertIdentical: function(lhs, rhs, message) {
			if (!(lhs === rhs)) throw new ComparisonAssertError(message, '===', lhs, rhs);
		},

		assertNotIdentical: function(lhs, rhs, message) {
			if (!(lhs !== rhs)) throw new ComparisonAssertError(message, '!==', lhs, rhs);
		},

		assertSame: function(lhs, rhs, message) {
			if (!owl.same(lhs, rhs)) throw new ComparisonAssertError(message, 'the same as', lhs, rhs);
		},

		assertNotSame: function(lhs, rhs, message) {
			if (owl.same(lhs, rhs)) throw new ComparisonAssertError(message, 'dissimilar to', lhs, rhs);
		},

		assertInstanceOf: function(obj, cls, message) {
			if (!(obj instanceof cls)) throw new ComparisonAssertError(message, 'instanceof', obj, cls);
		},

		assertTypeOf: function(obj, type, message) {
			if (!(typeof obj === type)) throw new ComparisonAssertError(message, 'of type', obj, cls);
		},

		fail: function(message) {
			throw new AssertError(message);
		},
		
		// catches and suppresses exceptions of the supplied types.
		// returns true if an exception was caught and ignored; false
		// if no exception was thrown.  Non-ignored exceptions propagate
		// normally.
		ignore: function(errorTypes, fn) {
			if ( !(errorTypes instanceof Array) ) errorTypes = [ errorTypes ];
			try {
				fn.call(this);
			} catch(e) {
				for( var i=0; i<errorTypes.length; i++ ) {
					if ( e instanceof errorTypes[i] ) return true;
				}
				throw e;
			}
			return false;
		},

		// the function must throw one of the give error types, or an
		// AssertError is thrown.
		assertThrows: function(errorTypes, fn, message) {
			this.asserts++;
			if ( this.ignore(errorTypes, fn) ) return true;
			else this.fail( message );
		},

		run: function(result) {
			if ( !result ) result = this.defaultTestResult();
			this.setUp();
			result.startTest();

			try {
				this[this.methodName]();
			} catch(e) {
				result.addFailure(this, e);
			}

			result.stopTest();
			this.tearDown();
			return result;
		},

		debug: function() {
			this.setUp();
			this[this.methodName]();
			this.tearDown();
		},

		countTestCases: function() { return 1; },

		defaultTestResult: function() { return new TestResult(); },

		setParentTest: function(testTest) { this.parentTest = testTest; },

		id: function() { 
			var testCaseName = (this.name || this.constructor.name) + '.' + this.methodName;
			// include the suite's id (the namespace) in our id, if defined.
			if ( this.parentTest ) return this.parentTest.id() + '.' + testCaseName;
			else return testCaseName;
		}
	};

	// Collects tests.
	function TestSuite(tests, name) {
		this.tests = tests ? tests.slice() : [];
		if ( name ) this.name = name;
	}
	TestSuite.prototype = {
		constructor: TestSuite,

		addTest: function(test) {
			// the test's id should include this suite's id.
			test.setParentTest(this);

			this.tests.push(test);
		},

		// adds an Array of tests.  Use addTest() to add a TestSuite.
		addTests: function(tests) {
			for ( var i=0; i < tests.length; i++ ) {
				this.addTest(tests[i]);
			}
		},

		run: function(result) {
			for ( var i=0; i < this.tests.length; i++ ) {
				var test = this.tests[i];
				test.run(result);
			}
			return result;
		},

		debug: function() {
			for ( var i=0; i < this.tests.length; i++ ) {
				var test = this.tests[i];
				test.debug(result);
			}
		},

		countTestCases: function() { 
			return this.tests.length;
		},

		setParentTest: function(test) { this.parentTest = test; },

		id: function() { 
			var suiteName = this.name || '';
			var parentId = this.parentTest ? this.parentTest.id() : '';
			if ( suiteName && parentId ) return parentId + '.' + suiteName;
			else return parentId + suiteName;
		}

	}

	// There's no TestLoader class; loading functionality
	// is instead exposed as functions in the owl.test namespace.
	function loadTestsFromTestCase(TestCaseClass) {
		var tests = new TestSuite();
		for ( var methodName in TestCaseClass.prototype ) {
			if ( methodName.slice(0,4) == 'test' ) {
				tests.addTest( new TestCaseClass(methodName) );
			}
		}
		return tests;
	}

	// namespace is a dotted namespace string.
	function loadTestsFromNamespace(namespace) {
		var tests = new TestSuite([], namespace);
		namespace = eval(namespace);

		for ( var className in namespace ) {
			var MaybeClass = namespace[className];
			if ( typeof MaybeClass === 'function' ) {
				if ( MaybeClass.prototype instanceof TestCase ) {
					var classTests = loadTestsFromTestCase(MaybeClass);
					tests.addTest(classTests);
				}
			}
		}

		return tests;
	}


	// A test case used to test the testing framework itself.
	function MetaTest(methodName) {
		TestCase.call(this, methodName);
	}
	MetaTest.prototype = new TestCase();
	Ext.apply(MetaTest.prototype, {
		constructor: MetaTest,
		
		setUp: function() {
			this.setUpComplete = true;
		},

		testSetUp: function() {
			this.assert(this.setUpComplete, 'setup complete');
		},

		testIgnore: function() {
			this.assert(
				this.ignore([ ReferenceError, TypeError ], function() {
					throw ReferenceError('testing...');
				}),
				'ignored ReferenceError.'
			)
			this.assert(
				this.ignore([ ReferenceError, TypeError ], function() {
					var a = [];
					a();
				}),
				'ignored TypeError'
			)
			this.ignore([ AssertError ], function() {
				this.fail('ignored AssertError from Array');
			});
			this.ignore( AssertError, function() {
				this.fail('ignored AssertError');
			});

			this.assert(
				!this.ignore( [ TypeError, ReferenceError ], function() {}),
				'ignore returns false if nothing was ignored'
			);

			this.assert( [], function() {});
			
		},

		testAssertThrows: function() {
			this.assertThrows( [TypeError], function() {
				[]();
			}, 'expected TypeError from array');
			this.assertThrows( TypeError, function() {
				[]();
			}, 'expected TypeError');
			this.assertThrows( ReferenceError, function() {
				x = y;
			}, 'expected ReferenceError');
		},

		testAssertIdentical: function() {
			this.assertIdentical('string', 'string', 'two seperately constructed strings are identical');
			this.assertNotIdentical(1, '1', 'the string "1" and the number 1 are equal.');
		},

		testAssertEqual: function() {
			this.assertEqual(1, '1', 'the string "1" and the number 1 are equal');
			this.assertNotEqual({}, {}, 'two seperately constructed Objects are not equal');
		},

		testAssertSameEdgeCases: function() {
			this.assertSame(undefined, undefined);
			this.assertSame(null, null);
			this.assertNotSame(undefined, null);
			this.assertNotSame(null, undefined);

			this.assertSame(NaN, NaN);
			this.assertNotSame(NaN, null, 'NaN not null');
			this.assertNotSame(NaN, undefined, 'NaN not undefined');
			this.assertNotSame(null, NaN);
			this.assertNotSame(undefined, NaN);
		},

		testAssertSame: function() {
			this.assertSame(1, 1);
			this.assertSame('', '');
			this.assertSame('x', 'x');
			this.assertSame([], []);
			this.assertSame({}, {});
			this.assertSame([1, 2, 3], [1, 2, 3]);

			this.assertSame({1: 'one'}, {1: 'one'});
			this.assertSame({1: 'one', 2: 'two'}, {1: 'one', 2: 'two'});
			this.assertSame([ [[]], [[[], 1]] ], [ [[]], [[[], 1]] ]);
			this.assertSame([ [1], [2] ], [ [1], [2] ]);
			this.assertSame( {1: [], 2: []}, {1: [], 2: []} );
			this.assertSame( {1: [{}], 2: [3, {4: 5}]}, {1: [{}], 2: [3, {4: 5}]} );
			this.assertSame( [ {}, [], {1: 'one'}, [2] ] , [ {}, [], {1: 'one'}, [2] ] );
		},

		testAssertNotSame: function() { 
			this.assertNotSame(1, 2);
			this.assertNotSame('', 'x');
			this.assertNotSame('x', 'y');
			this.assertNotSame([], [1]);
			this.assertNotSame([1], []);
			this.assertNotSame({1: 'one'}, {});
			this.assertNotSame({}, {1: 'one'});
			this.assertNotSame([1, 2, 3], [1, 2, 4]);
			this.assertNotSame([1, 2, 3], [1, 2, 3, 4]);
			this.assertNotSame([1, 2, 3, 4], [1, 2, 3]);
			this.assertNotSame({1: 'one', 2: 'two'}, {1: 'one'});
			this.assertNotSame({1: 'one'}, {1: 'one', 2: 'two'});
			this.assertNotSame({1: 'one', 2: 'three'}, {1: 'one', 2: 'two'});
			this.assertNotSame({1: 'one', 2: 'one'}, {1: 'three', 2: 'two'});
			this.assertNotSame([ [1], [3] ], [ [1], [2] ]);
			this.assertNotSame([ [1], [2] ], [ [1], [3] ]);
			this.assertNotSame([ [1], [2] ], [ [1], [2, 3] ]);
			this.assertNotSame([ [1], [2, 3] ], [ [1], [2] ]);
			this.assertNotSame( {1: [], 2: [2]}, {1: [], 2: []} );
			this.assertNotSame( {1: [], 2: []}, {1: [3], 2: []} );
			this.assertNotSame( {1: [], 3: []}, {1: [], 2: []} );
			this.assertNotSame( {1: [{}], 2: [3, {7: 5}]}, {1: [{}], 2: [3, {4: 5}]} );
			this.assertNotSame( {1: [{}], 2: [3, {4: 5}]}, {1: [{}], 2: [3, {7: 5}]} );
			this.assertNotSame( {1: [{}], 2: [3, {4: 5, 6: 7}]}, {1: [{}], 2: [3, {4: 5}]} );
			this.assertNotSame( {1: [{}], 2: [3, {4: 5}]}, {1: [{}], 2: [3, {4: 5, 6: 7}]} );
			this.assertNotSame( {1: [{}, 7], 2: [3, {4: 5}]}, {1: [{}], 2: [3, {4: 5}]} );
			this.assertNotSame( {1: [{}], 2: [3, {4: 5}]}, {1: [7, {}], 2: [3, {4: 5}]} );
		}
	});


	// config: namespace - String - Optional.
	function GuiTest(config) {
		Ext.apply(this, config);
	}
	Ext.extend(GuiTest, Object, {
		id: function() {
			var name = this.name || this.constructor.name;
			if ( this.namespace ) return this.namespace + '.' + name;
			else return name;
		},

		// override me!
		run: function() {}
	});

	function loadGuiTestsFromNamespace(namespace) {
		var guiTests = [];
		var ns = eval(namespace);
		for ( var className in ns ) {
			var MaybeClass = ns[className];
			if ( MaybeClass.prototype instanceof GuiTest ) {
				guiTests.push(new MaybeClass({
					namespace: namespace
				}));
			}
		}
		return guiTests;
	}



	return {
		AssertError: AssertError,
		ComparisonAssertError: ComparisonAssertError,
		TestResult: TestResult,
		TestCase: TestCase,
		TestSuite: TestSuite,
		loadTestsFromTestCase: loadTestsFromTestCase,
		loadTestsFromNamespace: loadTestsFromNamespace,
		MetaTest: MetaTest,
		GuiTest: GuiTest,
		loadGuiTestsFromNamespace: loadGuiTestsFromNamespace
	}

});
