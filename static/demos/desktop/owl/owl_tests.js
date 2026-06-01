// Copyright 2010 Oran Looney
owl.namespace('owl', function() {
	return {
		FindTest: Ext.extend(owl.unittest.TestCase, {
			name: 'FindTest', 

			setUp: function() {
				this.names = ['zero', 'one', 'two', 'three'];
				this.nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
				this.dups = [0, 1, 2, 3, 0, 1, 2, 3];
				this.people = [
					{ firstName: 'Jane', lastName: 'Doe', getName: function() { return this.firstName + ' ' + this.lastName; } },
					{ firstName: 'Jill', lastName: 'Stove', getName: 'this is not a function'},
					{ firstName: 'Sam', lastName: 'Silly', getName: function() { return this.firstName + ' ' + this.lastName; } },
					{ firstName: 'Joe', lastName: 'Blow' },
					{ firstName: 'John', lastName: 'Smith', getName: function() { return this.firstName + ' ' + this.lastName; } }
				];
			},

			testEmptyArray: function() {
				this._testFallback([], 0);
			},

			testNotFound: function() {
				this._testFallback(this.nums, 42);
			},

			_testFallback: function(array, target) {
				this.assertEqual(-1, owl.find(array, target), 'fallback index');
				this.assertIdentical(undefined, owl.find(array, target, {item: true}), 'fallback item');
				this.assertSame([], owl.find(array, target, {all: true}), 'fallback item');
				this.assertSame([], owl.find(array, target, {all: true, item: true}), 'options of "all items" returns an array, so the fallback should be an array.');
				this.assertEqual('fallback', owl.find(array, target, {fallback: 'fallback'}), 'explicit fallback');
				this.assertEqual('fallback', owl.find(array, target, {fallback: 'fallback', all: true}), 'explicit fallback all');
				this.assertEqual('fallback', owl.find(array, target, {fallback: 'fallback', item: true}), 'explicit fallback item');
				this.assertEqual('fallback', owl.find(array, target, {fallback: 'fallback', all: true, item: true}), 'explicit fallback all items');
			},

			testEdges: function() {
				this.assertIdentical(0, owl.find(this.nums, 0), 'first');
				this.assertIdentical(7, owl.find(this.nums, 7), 'middle');
				this.assertIdentical(9, owl.find(this.nums, 9), 'last');
			},

			testRange: function() {
				this.assertIdentical(0, owl.find(this.dups, 0, { first: 0}), 'first zero');
				this.assertIdentical(4, owl.find(this.dups, 0, { first: 1}), '2nd zero');
				this.assertIdentical(4, owl.find(this.dups, 0, { first: 1, last: 4}), 'found in range');
				this.assertIdentical(0, owl.find(this.dups, 0, { first: 0, last: 0}), 'found first');
				this.assertIdentical(4, owl.find(this.dups, 0, { first: 4, last: 4}), 'found at 4');
				this.assertIdentical(7, owl.find(this.dups, 3, { first: 7, last: 7}), 'found last');
				this.assertIdentical(-1, owl.find(this.dups, 0, { first: 1, last: 3}), 'not found in range');
			},

			testNegativeRange: function() {
				this.assertIdentical(4, owl.find(this.dups, 0, { first: -4}), 'found in last 4');
				this.assertIdentical(-1, owl.find(this.dups, 0, { first: -3}), 'not found in last 3');
				this.assertIdentical(0, owl.find(this.dups, 0, { first: 0, last:0}), 'found first');
				this.assertIdentical(4, owl.find(this.dups, 0, { first: -4, last:-4}), 'found at -4');
				this.assertIdentical(7, owl.find(this.dups, 3, { first: -1, last:-1}), 'found last');
			},

			testReverse: function() {
				this.assertIdentical(4, owl.find(this.dups, 0, {reverse: true}), 'last zero');
				this.assertIdentical(7, owl.find(this.dups, 3, {reverse: true}), 'last item');
				this.assertIdentical(0, owl.find(this.nums, 0, {reverse: true}), 'first element');
				this.assertIdentical(-1, owl.find(this.nums, 42, {reverse: true}), 'not found in reverse');
				this.assertIdentical(-1, owl.find(this.nums, 9, {reverse: true, last: -2}), 'not found in reverse range');
				this.assertIdentical(3, owl.find(this.nums, 3, {reverse: true, last: -2}), 'found in reverse range');
				this.assertIdentical(0, owl.find(this.dups, 0, {reverse: true, last: 3}), 'first found in reverse range');
				this.assertIdentical(-1, owl.find(this.dups, 0, {reverse: true, first:1, last: 3}), 'first not found in reverse range');
				this.assertSame([3, 2, 1], owl.find(this.nums, function(x) { return 0 < x && x < 4; }, { reverse: true, all: true }), 'reversed arrays are backwards.');
			},

			testIdentical: function() {
				var weirdos = [ null, undefined, '', 0, Infinity, -Infinity ];  // don't use NaN; its not identical to itself.
				for ( var index=0; index<weirdos.length; index++ ) {
					var weirdo = weirdos[index];
					this.assertIdentical(index, owl.find(weirdos, weirdo, {identical: true}), 'found exact weirdo forward');
					this.assertIdentical(index, owl.find(weirdos, weirdo, {identical: true, reverse: true}), 'found exact weirdo backwards');
				}
			},

			testEqual: function() {
				// create some function objects to compare.
				var notCalled = owl.bind(function() { this.fail('should never be called.'); }, this);
				function f() { notCalled(); return true; }
				function g() { notCalled(); return true; }
				function h() { notCalled(); return true; }
				var funcs = [f,g];
				this.assertIdentical(0, owl.find(funcs, f, {equal: true}), "looked for f instead of using it");
				this.assertIdentical(1, owl.find(funcs, g, {equal: true}), "looked for g instead of using it");
				this.assertIdentical(-1, owl.find(funcs, h, {equal: true}), "looked for h instead of using it");
			},

			testSame: function() {
				var items = [ null, NaN, undefined, [1, 2, 3], {x:1, y:2}, 0, ''];
				this.assertIdentical(0, owl.find(items, null, { same: true }));
				this.assertIdentical(1, owl.find(items, NaN, { same: true }));
				this.assertIdentical(2, owl.find(items, undefined, { same: true }));
				this.assertIdentical(3, owl.find(items, [1, 2, 3], { same: true }));
				this.assertIdentical(4, owl.find(items, {x:1, y:2}, { same: true }));
			},

			testRegExp: function() {
				this.assertSame([], owl.find(this.names, /something/, { all: true, item: true }));
				this.assertSame(['one'], owl.find(this.names, /one/, { all: true, item: true }));
				this.assertSame(['zero', 'one', 'three'], owl.find(this.names, /e/, { all: true, item: true }));
				this.assertSame(['zero', 'two'], owl.find(this.names, /o$/, { all: true, item: true }));
				this.assertSame(['two', 'three'], owl.find(this.names, /^t/, { all: true, item: true }));
			},

			testProperty: function() {
				this.assertIdentical(0, owl.find(this.people, 'Jane', { property: 'firstName' }), 'first');
				this.assertIdentical(4, owl.find(this.people, 'John', { property: 'firstName' }), 'last');
				this.assertIdentical(-1, owl.find(this.people, 'OTHER', { property: 'firstName' }), 'no such firstName');
				this.assertIdentical(-1, owl.find(this.people, 'OTHER', { property: 'NOTAPROPERTY' }), 'no such property');
			},

			testMethod: function() {
				this.assertIdentical(0, owl.find(this.people, 'Jane Doe', { method: 'getName' }), 'first');
				this.assertIdentical(4, owl.find(this.people, 'John Smith', { method: 'getName' }), 'last');
				this.assertIdentical(-1, owl.find(this.people, 'OTHER', { method: 'getName' }), 'no such name');
				this.assertIdentical(-1, owl.find(this.people, 'OTHER', { method: 'NOTAMETHOD' }), 'no such method');
			}
		}),

		SubsetTest: Ext.extend(owl.unittest.TestCase, {
			name: 'SubsetTest',

			setUp: function() {
				this.nums = {
					zero: 0,
					one: 1,
					two: 2,
					three: 3
				};
			},
			
			testEmpty: function() {
				this.assertSame({}, owl.subset({}, ''), 'list');
				this.assertSame({}, owl.subset({}, []), 'array');
				this.assertSame({}, owl.subset({}, function() { return true;}), 'predicate');
				this.assertSame({}, owl.subset({}, /^/), 'regex');
			},

			testNone: function() {
				this.assertSame({}, owl.subset(this.nums, ''), 'list');
				this.assertSame({}, owl.subset(this.nums, []), 'array');
				this.assertSame({}, owl.subset(this.nums, function() { return false;}), 'predicate');
				this.assertSame({}, owl.subset(this.nums, /^$/), 'regex');
			},

			testAll: function() {
				// when the entire set is included, we create a copy and don't just return the original.

				this.assertSame(this.nums, owl.subset(this.nums, function() { return true;}), 'predicate');
				this.assertNotEqual(this.nums, owl.subset(this.nums, function() { return true;}), 'predicate');

				this.assertSame(this.nums, owl.subset(this.nums, /.*/), 'regex');
				this.assertNotEqual(this.nums, owl.subset(this.nums, /.*/), 'regex');
			},

			testSome: function() {
				this.assertSame(
					owl.subset(this.nums, /e/),
					owl.subset(this.nums, 'zero,one,three')
				);

				this.assertSame(
					owl.subset(this.nums, /^t/),
					owl.subset(this.nums, ['two', 'three'])
				);

				this.assertSame(
					owl.subset(this.nums, function(key) { return key.length === 5; }),
					owl.subset(this.nums, 'three')
				);

			}
		})
	}
});
