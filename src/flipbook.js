var FlipbookController = (function(options){

    // This is a singleton because one controller is all a page should ever have. Two would
    // start having weird conflicts, and one can support any number of images, so more than
    // one is unneeded.
    var singleton;

    function createInstance(options) {
        var _my_name = "Flipbook Singleton"; // mostly for reporting.
        //  Init object and set Default configs.
        var ns = {};
        var config = {
            debug:false,
            dom:document,
            autoStart:false
        };

        /*define basic in-object utilities, these should not use any options to do their job.*/
        var extend = function(out) {
            out = out || {};
            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i])
                    continue;
                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key))
                        out[key] = arguments[i][key];
                }
            }
            return out;
        };
        var addClass = function(el,className){
            if (el.classList)
                el.classList.add(className);
            else
                el.className += ' ' + className;
        };
        var setDataAttr = function(el,attr,value){
            //if (el.dataset)
            //    el.dataset[attr]=value;
            //else
            el.setAttribute("data-"+attr, value);
        };
        var ce = function(tag,classnames,dataattrs){
            var x = document.createElement(tag);
            if(classnames){
                for(var i=0;i<classnames.length;i++){
                    addClass(x,classnames[i]);
                }
            }
            if(dataattrs){
                for(var attr in dataattrs){
                    setDataAttr(x,attr,dataattrs[attr]);
                }
            }
            return x;
        };
        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }

        // Merge options
        config = extend(config,options);

        // Private
        var flipbooks = [];
        var configured = false;
        var log = function(){ if(config.debug) console.log.apply(console, arguments); };
        var error = function(error){ throw "Error in "+_my_name+": "+error; };
        var init = function(){
            getFlipbookImgs();
            if(config.autoStart) configureAllFlipbooks();
            log(flipbooks);
        };
        var coerceDims = function(fb){
            var out = {};

            // config width
            if(fb.w.match(/^img$/)){
                out.w = fb.dom.clientWidth+"px";
            } else if(fb.w.match(/^[0-9]+$/)){
                out.w = fb.w+"px";
            } else {
                out.w = fb.w;
            }

            // config height
            if(fb.h.match(/^img$/)){
                out.h = fb.dom.clientHeight+"px";
            } else if(fb.h.match(/^[0-9]+$/)){
                out.h = fb.h+"px";
            } else {
                out.h = fb.h;
            }
            return out;
        };
        var configureFlipbook = function(fb){
            var fbdom = ce("div",["flipbook"]);
            insertAfter(fbdom,fb.dom);

            if(!fb.fill){
                var dims = coerceDims(fb);
                fbdom.style.height = dims.h;
                fbdom.style.backgroundSize = dims.h;
                fbdom.style.width = dims.w;
            } else {
                var x = function(){
                    if(fb.fill == "width"){
                        fbdom.style.height = fbdom.clientWidth+"px";
                    } else{
                        fbdom.style.width = fbdom.clientHeight+"px";
                    }
                    log(fbdom);
                    fbdom.style.backgroundSize = fbdom.clientHeight +"px";
                };
                window.addEventListener("resize",function(){x();});
                x();
            }

            fbdom.style.backgroundImage = "url("+fb.src+")";

            fb.ticking = false;
            fb.currentframe = 0;
            fb.framerate = fb.posframerate;
            fb.direction = 1; // the position will be modified by this number multiplied into the deltas,
            // so 1 = forward, -1 = backward
            fb.tick = function(direction,framerate){

                // If we got a tick with a direction, and we're already ticking,
                // just change the direction and leave.
                var cont = true;
                if(typeof direction != "undefined") {
                    fb.direction = direction;
                    if(fb.ticking) cont=false;
                }
                // same for framerate.
                if(typeof framerate != "undefined" && framerate > 0) {
                    fb.framerate = framerate;
                    if(fb.ticking) cont=false;
                }
                if(!cont)return;

                // We're always ticking if we got here
                fb.ticking = true;
                //fbdom.setAttribute("data-ticksize",)

                // If we hit (either) end of the reel, stop
                if(
                    fb.currentframe + fb.direction > (fb.frames-1) ||
                    fb.currentframe + fb.direction < 0
                ){
                    if(fb.currentframe < 1) fbdom.style.backgroundPositionY = "0px"; // Kind of a weird one, this will help with resizing a little.
                    fb.ticking = false;
                    return;
                }

                // modify framecount in memory
                fb.currentframe+=fb.direction;

                // update background position
                fbdom.style.backgroundPositionY = (fbdom.clientHeight*fb.currentframe*-1)+"px";

                // tick again after set framerate time.
                if(requestAnimationFrame) {
                    setTimeout(function(){
                        requestAnimationFrame(function(){fb.tick();});
                    },1000/fb.framerate);
                } else {
                    setTimeout(function(){
                        fb.tick();
                    },1000/fb.framerate);
                }

            };

            fbdom.addEventListener("mouseenter",function(){fb.tick(1,fb.posframerate);});
            fbdom.addEventListener("mouseleave",function(){fb.tick(-1,fb.negframerate);});
            fb.dom.style.display = "none";
        };
        var configureAllFlipbooks = function(){
            log("configureAllFlipbooks");
            if(configured) return;
            configured = true;
            log("!!");
            for(var i=0;i<flipbooks.length;i++){
                configureFlipbook(flipbooks[i]);
            }
        };
        var getFlipbookImgs = function(){
            var full = document.getElementsByTagName("img");
            flipbooks = [];
            configured = false;
            for(var i=0;i<full.length;i++){
                if(!!full[i].getAttribute("data-flipbook-src")){

                    // figuring out proper w/h is kinda tricky.
                    // If the dimention is not a number, assume it's a literal.
                    // if either demention is not defined, assume CSS will set our width/height for us
                    //      by using the .flipbook class.
                    var w = full[i].getAttribute("data-flipbook-width") || "";
                    var h = full[i].getAttribute("data-flipbook-height") || "";

                    flipbooks.push({
                        dom:full[i],
                        src:full[i].getAttribute("data-flipbook-src"),
                        frames: parseInt(full[i].getAttribute("data-flipbook-frames"),10) || 0,
                        posframerate: parseInt(full[i].getAttribute("data-flipbook-framerate"),10) || 30,
                        negframerate: parseInt(full[i].getAttribute("data-flipbook-negframerate"),10) || 0,
                        w: w,
                        h: h,
                        fill: full[i].getAttribute("data-flipbook-fill") || false,
                    });
                }
            }
        };

        // Public functions
        ns.convertAll = function(){
            configureAllFlipbooks();
        };

        // "Constructor" section
        log("I pass butter",config);

        init();

        // Done, Return configured object.
        return ns;
    }

    return {
        getInstance: function (options) {
            if (!singleton) {
                singleton = createInstance(options);
            }
            return singleton;
        }
    };
})();