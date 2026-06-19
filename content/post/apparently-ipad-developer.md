---
title: "So, Apparently I'm an iPad Developer Now"
author: "Oran Looney"
date: 2010-04-28
tags:
    - Web
    - JavaScript
    - Humor
image: /post/apparently-ipad-developer/lead.jpg
---

Last week my boss stopped by and dropped a brand spanking new iPad on my desk.
"Make our application work on this," he commanded. "You have two days before
we demo it at the trade show."

Madness? No, these are web apps! You see, for the last couple years we've been
working exclusively on AJAX applications: web pages stuffed with so much
JavaScript they look and feel like desktop apps. It's harder than writing
desktop software, but if you pull it off you get an application that can be
run anywhere, instantly.

So, I'm not a "real" iPhone/iPad developer; I've never even seen the dev
kit. I just do web apps. Although maybe "just" isn't the right word. We had
a 60,000 line application running on a completely new platform the same week it
launched.

Can your app do that?

We already supported Safari, so you'd expect it to work on the iPad too... and it
did, mostly, except for a couple of bugs. Flipping the iPad on its side would
mess up the layout, double clicks didn't work, stuff like that. Here are the
problems we hit, and what we did to solve them.

Browser Detect
--------------

To fix a browser-specific JavaScript bug you need to know when you're on that
browser. Detecting the iPad is easy: the iPad user agent contains the unique
string "iPad", so we checked for that.

```javascript
// a function to parse the user agent string; useful for
// detecting lots of browsers, not just the iPad.
function checkUserAgent(vs) {
    var pattern = new RegExp(vs, 'i');
    return !!pattern.test(navigator.userAgent);
}

if ( checkUserAgent('iPad') ) {
    // iPad specific stuff here
}
```

Simple enough.

Orientation Change
------------------

Flipping the iPad would also mess up our layouts. iPads use an accelerometer
to detect if they're being held vertically or horizontally (or upside down.)
From the browser's point of view it looks like the window was resized from
1024x768 to 768x1024; and you get the normal window resize event you'd expect.

We use [ExtJS][EXTJS], and their [Layout framework][EXTJS-LAYOUT] usually does a great
job handling the window resize event on normal browsers. It knew that
*something* had happened but didn't recalculate all the sizes correctly. (To
be fair, we use some pretty complicated layouts.)
This is probably do to subtle timing issues or some such. I didn't waste much
time figuring out what was going on, because there's a way to cut this Gordian
knot: the iPad specific `orientationchange` event.

```javascript
window.onorientationchange = function() {
    alert(window.orientation);
}
```

window.orientation is one of 0, 90, -90, or 180. 0 and 180 are portrait; 90 and
-90 are landscape. The onorientationchange event fires whenever it changes.
For us, it was sufficient to say `viewport.doLayout()` on orientation change;
that gave [ExtJS][EXTJS] the hint it needed to get the sizes right.

Double Click
------------

Safari on the iPad co-opts the double click event for its own use (a local
zoom.) You can listen for the `dblclick` event in JavaScript... it just never
fires. That was a bit of a problem, because we'd consistently allowed the user
to double click stuff (a row in a grid, for example) to jump to a more detailed view.

We settled on a two finger touch gesture to emulate the double click:
touch an item in one place and tap it in another.
<img class="small" style="float: right" src="/post/apparently-ipad-developer/double_tap.png" alt="Diagram of a two-finger simultaneous tap">
Tapping with two figures
simultaneously also works. When I say emulate, I mean that literally: when
we detect one of these double touches, we actually tell the DOM to fire a
`dblclick` event. That way, the solution worked everywhere and we
didn't have to track down every single place we registered a dblclick
listener.

```javascript
document.body.addEventListener('touchstart', function(e) {
    touch = e.touches[0];
    if ( !touch ) return;
    var me = document.createEvent("MouseEvents");
    me.initMouseEvent('dblclick', true, true, window,
        1, // detail / mouse click count
        touch.screenX,
        touch.screenY,
        touch.clientX,
        touch.clientY,
        false, false, false, false, // key modifiers
        0, // primary mouse button
        null  // related target not used for dblclick event
    );
    touch.target.dispatchEvent(me);
});
```

Unfortunately, this code is too simple. You see, both the iPad and
iPhone use "two finger scrolling" for scrollable regions (elements with CSS
`overflow: scroll;`) within a website.
<img class="small" style="float: right" src="/post/apparently-ipad-developer/double_scroll.png" alt="Diagram of a two-finger scroll">
There's no way to turn this off, and it doesn't even show a scrollbar: it's
two finger scrolling or nothing.

If you use the above code as is, the dblclick event will fire as soon as the
user tries to use two finger scrolling. We ran into this because we have grids
with thousands of rows to scroll from where the user can double click a row to
go to a detailed view. To fix this problem, we had to make sure we only
fired an emulated `dblclick` event if the user quickly double tapped a row, not
if they pressed and dragged. So instead we only set up a timer in the
`touchstart` event and actually fired the `dblclick` from `touchend`. This
requires more code, but lets us handle "double clicking" inside of scrollable
regions.

Nitpicking
----------

Pretty much every reviewer has mentioned the iPad's "gorgeous screen," but
it's just a 1024x768 display at fairly low DPI, so I'm not sure what that's about.
We test everything down to 800x600 so we were ok, usability-wise, but it sure
looks a lot better on a large monitor.

We also embed Google maps, using them as backdrops to display geographic
data, and the web experience for Google maps is somewhat diminished compared to
the full fledged Google Maps iPad app. They still work, though.

Safari on the iPad and iPhone doesn't fire mouse events on elements it doesn't
consider "clickable". Registering a `click` event listener, even if it doesn't
do anything, will allow the element to receive the full set of mouse events.

Aftermath
---------

We made the two day deadline.

Did it work? Man, people were stopping by our booth just for the *chance*
to touch an iPad. This was less than two weeks after it launched;
there was a lot of curiosity. We use a bunch of data visualization like
Google maps and charts, and it was just stunning. It was like a thick, juicy
slice of future, served of a piece of future toast. I can't say for sure it
generated a sales lead, but it sure brought in some serious foot traffic.

But what do you expect? Web apps can and should run anywhere, even on stuff
that hasn't been invented yet.

[EXTJS]: https://extjs.com/
[EXTJS-LAYOUT]: https://www.extjs.com/deploy/dev/examples/layout-browser/layout-browser.html