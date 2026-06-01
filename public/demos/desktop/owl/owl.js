// Copyright 2010 Oran Looney
owl = (function() {
	/* This root namespace contains a few utilities and contains all other 
	packages. */

	// private; used by clone().
	function Clone() { }
	
	// returns a clone of obj.  Optionally applies the extra Object to the
	// new clone.
	function clone(obj, extra) {
		Clone.prototype = obj;
		return Ext.apply(new Clone(), extra);
	}
	

	// a private Set of namespaces.  The names are the dotted namespace strings.
	// true is the value of every key.  Using a set instead of an array automatically
	// prevents duplicates.
	var namespaces = {
		owl: true
	};

	// pass in a dotted namespace string (i.e., "owl.nested.ns") and an optional
	// function that returns the contents of that namespace.  Builds and returns the
	// namespace Object.
	function namespace(ns, fn) {
		// In some cases, code inside fn might install things in the namespace's
		// Object.  So, we have to make sure it exists before calling fn.  Using
		// Using Ext.apply instead of a direct set also ensures we don't wipe out any 
		// such changes.
		Ext.namespace(ns);
		var nsObject = eval(ns);
		if ( fn ) Ext.apply(nsObject, fn());

		// keep track of all namespaces.
		namespaces[ns] = true;

		return nsObject;
	}

	function listNamespaces() {
		var ret = [];
		for ( var ns in namespaces ) ret.push(ns);
		return ret;
	}
	
	
	// private; constrains index from 0 to length - 1,
	// treating negative indexes as counting backwards
	// from the length. (index == -1 => length -1);
	function fancyIndex(index, length) {
		if ( index < 0 ) index = length + index;
		return Math.max(Math.min(index, length-1), 0);
	}
	
	// private; returns a predicate function that matches
	// to the target, according to various options (see find().)
	function createMatcher(target, options) {
		if ( options.equal ) {
			var matcher = function(x) { return x == target; }
		} else if ( options.identical ) {
			var matcher = function(x) { return x === target; }
		} else if ( options.same ) {
			var matcher = function(x) { return same(x, target); }
		} else {
			if ( typeof target === 'function' ) {
				return target;
			} else if ( typeof target === 'object' && target instanceof RegExp ) {
				var matcher = target;
			} else {
				var matcher = function(x) { return x == target; }
			}
		}
		
		// if property or method is defined, we use the matcher on the
		// property/method-return-value instead of the item itself.
		if ( options.property ) {
			var property = options.property;
			return function(x) { return matcher(x[property]); }
		} else if ( options.method ) {
			var method = options.method;
			return function(x) {
				return (typeof x[method] === 'function') && matcher(x[method]());
			}
		} else { 
			return matcher;
		}
	}
	
	// private; determines what to return for a given set of given find()
	// options if no match was found.
	function fallback(options) {
		if ( 'fallback' in options ) return options.fallback;
		if ( options.all ) return [];
		if ( options.item ) return undefined;
		else return -1;
	}
	
	// By default, finds the first item in the array equal (==) to
	// the target and returns its index, returning -1 if its not found.
	// If target is a function or a regular expression, == is not used but
	// instead the function or regular expression is applied to each item in
	// the array, with the match being the first item which returns true.
	//
	// However, this behavior can be modified by the options.
	//
	// Matching logic options (mutually exclusive):
	//   equal - Boolean - true to always compare using ==, even if target is a function
	//     or regular expression.
	//   identical - Boolean - true to compare using ===.
	//   same - Boolean - true to compare using the same() function.
	//
	// Item Lookup options(mutually exclusive):
	//   property - String/Number - true to compare the target to some property of each item
	//     instead of the item itself.  Items that don't have the property will never match.
	//     You can also use this when each item is an Array, by passing in an numeric index
	//     to access.
	//   method - String - true to compare the target to the result of invoking some method
	//     on each item.  The method is only invoked if the item has the property and it is
	//     a function.  It is called with no arguments.  This is intended for use with "getter"
	//     methods; for example, if you pass in 'getName', item.getName() will be called for
	//     each item in the array, and the return value will be compared to the target.
	//
	// Return value options:
	//   all - Boolean - true to return an array containing the results for all matches
	//     in the array.
	//   item - Boolean - true to return the item itself instead of the index.  If used
	//     with the all option, an array of items is returned.
	//   fallback - Any - A value to return if no matches are found in the array.  By
	//     default, this in an empty Array ([]) with the all option, undefined with
	//     the item option, and -1 by default.
	//
	//  Search options:
	//    first - Numeric - lowest index in the array to include in the search.  Defaults
	//      to 0.  If this is negative, it counts backwards from the end of the array, so
	//      that -1 indicates the end of the array.
	//    last - Numeric - highest index in the array to include in the search.  Defaults
	//      the the last item.  If this is negative, it counts backwards from the end of the 
	//      array, so that -1 indicates the end of the array.
	//    reverse - Boolean - true to start at the last item and search backwards towards
	//      the first.  When combined with the all option, the array of matches will be
	//      in reverse order from that of the original array.
	//
	function find(array, target, options) {
		if ( !options ) options = {};
		if ( !array.length ) return fallback(options);
		
		// determine the search predicate	
		var isMatch = createMatcher(target, options);
		
		// determine the search range
		var length = array.length;
		var first = options.first ? fancyIndex(options.first, length) : 0;
		var last = ( 'last' in options ) ? fancyIndex(options.last, length) : length - 1;
		
		// use an array if we need to return all the matches.
		var all = options.all ? [] : false;
		
		if ( options.reverse ) {
			for ( var i=last; i>=first; i-- ) {
				if ( isMatch(array[i]) ) {
					var value = options.item ? array[i] : i;
					if ( all ) all.push(value);
					else return value;
				}
			}
		} else {
			for ( var i=first; i<=last; i++ ) {
				if ( isMatch(array[i]) ) {
					var value = options.item ? array[i] : i;
					if ( all ) all.push(value);
					else return value;
				}
			}
		}

		// return all matches if any were found.
		if ( all && all.length) return all;

		return fallback(options);
	}
	
	// binds a method to an object.
	function bind(fn, scope) {
		return function() {
			return fn.apply(scope, arguments);
		}
	}
	
	// dynamically loads a javascript script.  An optional
	// callback is notified when the script is loaded.
	function loadScript(scriptSrc, callback, scope) {
		Ext.onReady(function() {
			// set up the script element
			var script = document.createElement('script');
			script.setAttribute('src', scriptSrc);
			script.setAttribute('type', 'text/javascript');
		
			// add it to the document head
			var head = document.getElementsByTagName("head")[0];
			head.appendChild(script);
			
			// find out when it's loaded.
			if ( callback ) {
				Ext.fly(script).on('load', callback, scope);
			}
		});
	}
	
	// used to report errors.  Shows an alert by default but 
	// can be by replaced with a more sophisticated mechanism.
	function error(message) {
		alert('error: ' + message);
	}
	
	// choose a subset of key/values from an Object, either
	// by providing a list of keys (Array or csv String),
	// passing in a predicate function: filter(key, value),
	// or passing in a RegExp object. keys not in obj will not 
	// be included in the subset.
	function subset(obj, keys) {
		var filter;
		if ( typeof keys === 'string' ) keys = keys.split(',');
		if ( Ext.isArray(keys) ) {
			// set up a fast lookup table instead of searching the array each time.
			var keySet = {};
			for ( var i=0; i<keys.length; i++ ) keySet[ keys[i] ] = true;
			filter = function(key) { return key in keySet; }
		} else {
			filter = keys;
		}
		
		var ret = {};
		for ( var key in obj ) {
			var value = obj[key];
			if ( filter(key, value) ) ret[key] = value;
		}
		return ret;
	}

	// a private mapping of classes to sameness functions.  Use
	// registerSamenessPredicate to tell owl.same() how to check
	// other types for sameness.  By default, only the native
	// JavaScript types Array, Object, and Date have sameness predicates.
	var samenessPredicateRegistry = {};
	function registerSamenessPredicate(constructor, samenessPredicate) {
		samenessPredicateRegistry[constructor] = samenessPredicate;
	}

	// private; compares two Arrays for sameness.
	function arraySame(x, y) {
		var length = x.length;
		// arrays of different lengths are obviously not the same.
		if ( y.length !== length ) return false;

		for ( var i = 0; i < length; i++ ) {
			if ( !same(x[i], y[i]) ) return false;
		}
		return true;
	}
	registerSamenessPredicate(Array, arraySame);

	// private; compares two Objects for sameness.
	function objectSame(x, y) {
		for ( var key in x ) {
			// y must have every key that x does.
			if ( !(key in y) ) return false;

			// x and y must have the same values for every key.
			if ( !same(x[key], y[key]) ) return false;
		}

		for ( var key in y ) {
			// x must have every key that y does.
			if ( !(key in x) ) return false;
			
			// we already know the values of shared keys are the same,
			// so there's no need to do an additional check.
		}
		return true;
	}
	registerSamenessPredicate(Object, objectSame);

	function dateSame(x, y) {
		return x.valueOf() === y.valueOf();
	}
	registerSamenessPredicate(Date, dateSame);

	// deep compare of javascript native objects.  Objects
	// and Arrays are compared item by item.
	function same(x, y) {
		// NaN is special because its not equal or identical to itself (but NaN is 
		// the same as NaN!) We check it here first because it's so weird... NaN has
		// a constructor (Number) but its type is 'number' that doesn't fit into the below
		// logic.  Also, isNaN() is true for some non-numbers, so we have to check that too.
		if ( typeof x === 'number' && isNaN(x) && typeof y === 'number' && isNaN(y) ) return true;

		// compare non-objects directly.
		try { 
			var xc = x.constructor;
			var yc = y.constructor;
		} catch( e ) { 
			if ( e instanceof TypeError ) {
				// x or y didn't allow property access, so is a non-object type.
				// other types we can compare for identity.
				return x === y;
			}
			else throw e;
		}

		// objects of different classes can't be the same.
		if ( xc !== yc ) return false;

		if ( x === y ) {
			return true;
		} else {
			// use the registered predicate if known.
			var predicate = samenessPredicateRegistry[xc];
			if ( predicate ) return predicate(x, y);
		}
		return false;
	}


	return {
		bind: bind,
		clone: clone,
		find: find,
		namespace: namespace,
		listNamespaces: listNamespaces,
		error: error,
		loadScript: loadScript,
		subset: subset,
		same: same,
		registerSamenessPredicate: registerSamenessPredicate
	};
})();

