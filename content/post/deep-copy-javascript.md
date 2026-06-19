---
title: "Deep Copy in JavaScript"
author: "Oran Looney"
date: 2009-11-25
tags: ["JavaScript"]
image: /post/deep-copy-javascript/lead.jpg
---

<p class="archive-notice">
    <b>Update 2017-10-23:</b> This article and code library have not kept up with the rapidly changing JavaScript landscape and are now hopelessly out of date. First came non-enumerable properties, and with ES2015 came the introduction of classes, proxies, symbols, and anonymous functions, all of which break the below logic. I'm afraid I no longer know how to fully copy the full menagerie of JavaScript objects correctly.
</p>

In fact, it's quite possible no one on Earth does.

Nevertheless, the below essay may be of interest if you're interesting in the purely theoretical aspects of deep copying, which can be demonstrated just as well in JavaScript as any other language, so long as you don't go asking tricky questions about the newer features.

I've been interested in writing a generic deep copy algorithm in JavaScript for a while. The simple way to make a deep copy in JavaScript is to JSON-serialize and deserialize it (described [below](#json-serial-deserial)) but this approach is very limited. A while ago it occurred to me that that it should be possible to write a fully generic implementation in JavaScript thanks to the language's design. This is interesting because most languages can't do this.

In Java, for example, the `Cloneable` interface is fundamentally shallow because it doesn't pass through enough information to allow cycles to be handled. The `Serializable` interface does handle cycles but also imposes a huge burden on the user: at best, it's difficult, tedious and error-prone to implement, at worst it may be impossible to serialize an object to disk where it would be simple to create an in-memory copy. Using `Serializable` for deep copies is a hack. The truth is, Java just doesn't have a generic deep copy mechanism. This is true for many languages.

So it would be pretty cool if we could write one for JavaScript, huh?

The Three Copies
----------------

This essay presents a recursive deep copy algorithm for JavaScript that can handle cycles. It works with all non-object types and the standard classes: Arrays, Objects, and Dates, as well as HTML DOM Nodes. It can be extended with custom behavior for any class. It's published under the LGPL, which means you can include it in your open-source or commercial software without charge.

Source: [olooney/deep-copy-js][DCJS].

The script installs three functions in the namespace `owl`, all variants on copying an object: `copy()`, `clone()`, and `deepCopy()`. Example usage:

```javascript
john = {
    name: 'John Smith',
    hobbies: ['surfing', 'diving']
};

// clone
john2 = owl.clone(john);
```

`clone()` uses JavaScript's built-in prototype mechanism to create a cheap, shallow copy of a single Object. It is described in detail in a [separate essay](/functional-javascript/). It's used internally by `copy()` and `deepCopy()` but won't be mentioned here again.

```javascript
// shallow copy
john3 = owl.copy(john);

// john and john3 have separate names,
// but share the same hobbies Array:
john.hobbies === john3.hobbies;
```

`copy()` makes a shallow, non-recursive copy of a single object. This implementation is interesting because it handles native types and correctly copies objects created by a user-defined class. I've written about user-defined classes [elsewhere](/classes-and-objects-javascript/) and you can read the source code for details on how that works. Shallow `copy()` is only included for contrast and won't be mentioned here again.

```javascript
// deep copy
john4 = owl.deepCopy(john);
```

There we go! `deepCopy()` is the entry point for the deep copy algorithm. Every member is recursively deep copied:

```javascript
// john and john4 have separate hobby arrays
john.hobbies !== john4.hobbies

// which can be manipulated separately:
john4.hobbies.push('sailing');
john.hobbies.length === 2;
john4.hobbies.length === 3;
```

If there are cyclic references:

```javascript
john = {
    name: 'John Smith',
    hobbies: ['surfing', 'diving'],
    friends: []
};

bob = {
    name: 'Bob Boston',
    hobbies: ['rowing', 'surfing'],
    friends: [ john ]
}

john.friends.push(bob);
```

they'll be handled correctly; the algorithm will not go into an infinite loop, and the set of copied objects will have the same graph structure, including cycles, as the original:

```javascript
john2 = owl.deepCopy(john);
bob2 = john.friends[0];

// bob was included in the deep copy,
// so now we have another bob.
bob2 !== bob;

// john2 and bob2 have the same cyclic
// relationship as john and bob.
bob2.friends[0] === john2;
```

How It Works
------------

At the heart, there's a recursive algorithm that descends through the graph of objects, copying each one. As it goes, it makes a record of each object that it copies, in the form of an ordered pair: `[original, copy]`. If it ever sees an object it has already copied before, it does *not* perform a second deep copy, but immediately returns to the copy it already made. Detecting objects that have already been copied is the key to avoiding infinite recursion. Using the same copy as the first time is the key to preserving cycles.

We only keep track of previously copied objects over a single pass of the algorithm, where a single pass is a single call to the global `deepCopy()` algorithm. If you call `deepCopy()` on the same object later, it won't remember that it's been copied before, and you'll get yet another copy of it. However, the global `deepCopy()` algorithm is [reentrant][REENTRANT] because a different object is created to keep track of each pass instead of using static data. This isn't terribly important because JavaScript is single-threaded but could still prevent a subtle bug someday.

Unfortunately, we have to use an array to keep track of the `[original, copy]` pairs, and we have to search through that array linearly each time. Objects are unordered (`o1 < o2` and `o2 < o1` always return false for any two Objects `o1` and `o2`) can't be used as keys in some kind of lookup Object, and don't expose a unique address or id that could be ordered. This is unfortunate because it means the algorithm as a whole is `O(n`<sup>`2`</sup>`)` when it could be `O(n log(n))` if Objects could be ordered or hashed in some way, but I just don't think that's possible.

We also keep track of our current "depth:" the number of times `deepCopy()` has recursively called back into itself. If that hits the max depth of 256, it will abort and throw an `Error`. You can change the depth limit by passing in a second argument to `deepCopy()`:

```javascript
john2 = owl.deepCopy(john, 5);
```

You'll probably want to reduce this to detect errors early, rather than increase it. To paraphrase Bill Gates, 256 levels should be enough for anyone. In fact, except when copying DOM nodes, you probably won't get out of the single digits.

Exactly how we copy a given object depends on its class. This is handled by a set of objects called "copiers" that are responsible for copying specific kinds of objects. For each object that we copy, we determine which copier to use and delegate all the specifics of copying to it. New copiers can be added at any time. This makes the algorithm extensible and customizable.

For more details on the implementation, please refer to the [source code][DCJS] directly.

Registering Copiers
-------------------

Copier implementations are provided for standard JavaScript classes and types. The mechanism is extensible: you can add copiers for your own classes. As an example, let's take a look at the Array copier:

```javascript
// Array copier
deepCopy.register({
    canCopy: function(source) {
        return ( source instanceof Array );
    },

    create: function(source) {
        return new source.constructor();
    },

    populate: function(deepCopy, source, result) {
        for ( var i=0; i<source.length; i++) {
            result.push( deepCopy(source[i]) );
        }
        return result;
    }
});
```

Every copier must have the three methods show here, and can be added to the registry using `deepCopy.register()` as shown. Copiers registered later are checked first and therefore have higher priority. Let's examine the three methods in turn.

`canCopy()` returns a Boolean indicating if this copier is able to handle a given object. It is invoked for each copier in the registry , starting with the most recently registered copier and working backwards until one of them returns true. Only if it returns true will the other two methods be called. Typically this will be an `instanceof` check as shown, but any logic is allowed.

`create()` returns a new object of the appropriate type. This is important, because the hidden internal prototype of each object can only be set at creation. You can perform other setup here if you choose, but you are not allowed to perform a recursive deep copy. The reason for this is simple: until you return the copy, the algorithm will not be able to record the `[original, copy]` pair needed to handle cycles. Use this method only to initialize a new, empty object of the correct class and leave all other initialization until `populate()`.

`populate()` is called immediately after `create()`. It is passed a reference to a `deepCopy()` function... but this is not the global `deepCopy()` function. Instead, it a closure that is aware of the previous copies and can avoid cycles; otherwise, it is the same. `populate()` is also passed the original object and the empty copy made by `create()`. Use this function to recursively deep copy members.

There are copiers already registered for Objects, Arrays, Dates, and HTML DOM Nodes. The algorithm handles non-object types automatically, since these are all copy-by-value by definition.

The Default Copier
------------------

The default, generic deep copy does a reasonable job of copying objects of user-defined classes too. They are detected by this test:

```javascript
obj instanceof obj.constructor
```

This requires you to have correctly overridden the constructor property, and to have actually used the `new` operator on that constructor to obtain the object. This will be true if you're following the advice from [my essay on Classes and Objects in JavaScript](/classes-and-objects-javascript/), or using any standard framework to define your classes.

If that condition is met, then the constructor's prototype is [cloned](/functional-javascript/), and the object's [instance properties][HAS-OWN-PROPERTY] are deep copied, one by one, into the clone. The result should be an object of the same class as the original with a deep copy of all instance data. Static (class/prototype level) data is not deep copied, but shared, just as it is shared between normal instances of the class. The copy will be an instance of the original's class. However, the constructor is NOT called. This often, but not always, results in a high-quality, low-overhead copy. You can register a custom copier to handle cases where this default behaviour is not correct.

The generic object copier is *always* called for objects of type "object" if no other more specific copier claims to be able to copy the object. Notice that it preserves the class, methods, and static members of the object and only copies the instance-level members of the object. My earlier essays on [clone()](/functional-javascript/) and [Classes and Objects](/classes-and-objects-javascript/) might help you understand exactly what's going on here, but the point is that it will "just work" for most classes: you don't need to register a custom copier for every, or even most, of your own classes.

FAQ
---

<a name="json-serial-deserial"></a>
**Q:** I don't think I need any of this stuff. I just want the Arrays in my Objects and the Objects in my Arrays to be copied too. Is there an easier way?

**A:** Yes. If the data structure you want to copy can be serialized to JSON, then you can make a deep copy by serializing and deserializing it. For example, using [JSON.stringify()][JSON-STRINGIFY], write

```javascript
var b = JSON.parse(JSON.stringify(a));
```

The limitation of this approach is that you won't be able to handle reference cycles, user-defined classes, or standard Date objects (Date isn't part of the JSON standard.) The advantage is that it's very reliable and doesn't introduce any new dependencies since it's universally [available across modern browsers.][CAN-I-USE-JSON]

**Q:** How do I know if a class needs a custom copier?

**A:** Look for special constructor behavior or uniqueness conditions, or for properties that *should not* be deep copied.

For example, a class with a unique id would need a custom copier that generated a new id for the copy. Or, the object itself might be some globally unique Singleton. Or, it might also register itself with some global manager in the constructor. Or, it might have a reference to some shared object, like `document.body`, that you don't want to pull into the copy.

Basically, the deep copy works best on native types and simple classes, which are mostly data, with maybe a few methods to access that data. For example, a `Point(x, y)` class, with a few methods like `length()`, or a `Rectangle(a, b)` class defined by two Points and having methods like `area()`. That would deep copy just fine. But a fancy class like `Ext.Window`, which register with an global `Ext.WindowMgr` to manage their relative z-indexes, would need a custom copier.

**Q:** How are Functions copied?

**A:** They aren't: `deepCopy()` just returns a reference to the original function. A Function's behaviour is immutable: you can't change the code of a function after initial creation, and there's no reason to make a copy of an immutable object.

It is possible to set properties on a function though, so in that sense functions are mutable. This isn't very common, and when it is used, such as for `prototype` for class constructors, the correct behavior is usually still to not copy.

If you really want to copy a function though, you can use something like the `wrap()` function explained [this essay](/javascript-arguments/).

**Q:** Singletons are classes that should only exist once &mdash; for example, a cache or a registry. How can I make `deepCopy()` respect singletons?

**A:** Register a copier for the Singleton class that returns the original object from create() and does nothing in populate(). Here is the complete pattern for a class called MySingleton:

```javascript
owl.deepCopy.register({
    canCopy: function(obj) {
        return obj instanceof MySingleton;
    },

    create: function(obj) {
        return obj;
    }
});
```

**Q:** My class requires a collection to be passed into the constructor, so it's impossible to break the copying up into two stages.

**A:** It's always possible because all properties are public in JavaScript except for the hidden prototype. You can change every property of an object after creation. I suppose there might be native-code objects (objects provided by the browser, not based on Object) that can't be deep copied, but I don't know of any. Some classes can't be copied via their public interface, though. This is why copying behavior is typically left up to each class to implement. Here, to avoid namespace conflicts, we put it in a separate copier, but it really is logically part of the class. If that bothers you, just think of the copier as a friend of the class.

**Q:** Why doesn't the copier for DOM Nodes just call `cloneNode(true)`? Wouldn't that be a deep copy?

**A:** `cloneNode(true)` wouldn't preserve the reference structure with the rest of the copy. Suppose you were implementing round corners with several nested divs and had an object keeping track of them all:

```javascript
roundyCornerBox = {
    outer: outerDiv,
    header: headerDiv,
    footer: footerDiv,
    body: contentP
};
```

In the original, header, footer, and body are children of outer. That needs to be true of the copy, too, and wouldn't be if we used `cloneNode(true)`.

**Q:** I'm keeping data around as custom properties on HTML DOM Nodes, and I've noticed this doesn't get copied. Why not?

**A:** Nodes have hundreds of properties and there's no way to distinguish between custom and standard ones. Since `cloneNode()` doesn't preserve custom properties, we'd need to do hundreds of checks per element. Since most elements don't have custom properties it seems kind of wasteful. However, some JavaScript frameworks rely on this. So, you can implement this yourself, by adding something like this to populate():

```javascript
for ( var key in source ) {
    if ( !(key in result) ) {
        result[ deepCopy(key) ] = deepCopy( source[key] );
    }
}
```

[CAN-I-USE-JSON]: https://caniuse.com/#search=JSON
[DCJS]: https://github.com/olooney/deep-copy-js
[HAS-OWN-PROPERTY]: https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference:Global_Objects:Object:hasOwnProperty
[JSON-STRINGIFY]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[REENTRANT]: https://en.wikipedia.org/wiki/Reentrant_(subroutine)