# flipbook
A JS image flipbook controller.

#Build Instructions

Build with 

`grunt build` 

And find the compiled source in dist/.

#Usage
**TL:DR:** `FlipbookController.getInstance().convertAll();`

Flipbook works with data-attributes on img tags. The supported tags and their functions are as follows.

* `data-flipbook-src`

This is the URL (relative or otherwise) that will be loaded in as the flipbook. It should be a vertically-oriented set of frames, with the first frame being the top-most, and the last frame being the bottom-most

* `data-flipbook-frames`

This is the number of frames the flipbook has available. It assumes 1-indexed, so if there are 15 frames in the animation you use 15, not 14 or something.

* `data-flipbook-framerate`

The framerate of the animation. 30 is default. Higher numbers (100, 200, and so on) may not accurately play at the intended framerate, due to `setTimeout` and `requestAnimationFrame` limitations.

* `data-flipbook-negframerate`

**Optional** The framerate of the animation while played in reverse. Can be faster or slower. if omitted defaults to the normal "positive" framerate.

* `data-flipbook-height`
* `data-flipbook-width`

**Optional** The dimentions of the flipbook container. If set to an integer, the value is assumed to refer to pixels. If set to the string "img" it will inherit its size from the img tag the container is being built from. Any other value will be assumed as a literal and will be used as a CSS style (width/height) without modification.

* `data-flipbook-fill`

**Optional** Valid values are `width` and `height`. If set, the `data-flipbook-height/width` attribute will be ignored, and instead the container will rely on external CSS to control the dimentions, as well as attach a listener to the document to keep itself square. For example; if the flipbooks are being placed into floating responsive divs which have a width of 25% the window size, and you add a css style for `.flipbook{width:100%}` then setting `data-flipbook-fill="width"` would ensure the height of the container is maintained square with the dynamic width. *This setting could use some work, avoid unless you need to have the flipbook be responsive*

Include the file into a page, create a Singleton object with `var fc = FlipbookController.getInstance()`, and once ready, call `fc.convertAll();`. Flipbook will scan the page for any `<img />` tags on the page with the above data-attributes and convert them into hover-flipbooks.

#Gotchas

Right now this was built for a specific project, and so works in a specific way. That way is on mouseenter, animate forward, and on mouseleave, animate backwards, stopping at both ends. If anyone finds this and cares I could add extra functionality though an option object passed into `.getInstance()`. If you are that person, create an issue or pull request freely.
