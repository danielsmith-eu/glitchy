/*global $: false, document: false */
/*jslint plusplus: true, unparam: true */
'use strict';
var Glitchy = function (el, blocksx, blocksy, glitchiness, glitchInterval) {
    var that = this;

    that.el = $(el);
    that.blocksx = blocksx || 10; // number of blocks across to split the image into
    that.blocksy = blocksy || 10; // number of blocks high to split the image into
    that.glitchiness = glitchiness || 0.25; // glitchiness between 0.0 and 1.0 (i.e. used by RNG)
    that.glitchInterval = glitchInterval || 200; // interval (ms) between glitch frames (jitters by 25%, though)

    that.blocks = that.generateBlocks();
    that.startGlitch();
};
Glitchy.prototype = {
    generateBlocks: function () {
        var that = this,
            i,
            j,
            blocks = {},
            x = 0,
            y = 0,
            blockwidth = that.el.width() / that.blocksx,
            blockheight = that.el.height() / that.blocksy;

        // create a container before the image, and put the image inside the new container
        that.container = $(document.createElement("div"));
        that.el.before(that.container);
        that.el.detach();
        that.container.append(that.el);
        that.el.hide(); // hide the image

        // TODO apply width/height css from the image to the container, so that any responsive bits are inherited

        // make sub-blocks and map the image onto them as offset background images
        for (i = 0; i < that.blocksx; i++) {
            blocks[i] = {};
            for (j = 0; j < that.blocksy; j++) {
                var block = $(document.createElement("div"));

                var glitchBlock = new GlitchBlock(that.el.attr("src"), y, x, blockwidth, blockheight, that.el.width(), that.el.height(), -x / that.el.width(), -y / that.el.height(), block);
                glitchBlock.setOriginals();
                that.container.append(block);
                blocks[i][j] = glitchBlock;
                y += blockheight;
            }
            x += blockwidth;
            y = 0;
        }
        return blocks;
    },
    startGlitch: function () {
        var that = this,
            oneGlitch = function () {
                $.each(that.blocks, function (i, blocksy) {
                    $.each(blocksy, function (j, glitchBlock) {
                        if (Math.random() < that.glitchiness) {
                            glitchBlock.setGlitched();
                        }
                    });
                });
                that.glitchTimeout = setTimeout(oneGlitch, that.glitchInterval * ((Math.random() / 3) + 0.3));
            };
        oneGlitch();
    },
    stopGlitch: function () {
        var that = this;
        if (that.glitchTimeout) {
            clearTimeout(that.glitchTimeout);
        }
        $.each(that.blocks, function (i, blocksy) {
            $.each(blocksy, function (j, glitchBlock) {
                glitchBlock.setOriginals();
            });
        });
    }
};
var GlitchBlock = function (bg, t, l, w, h, bgw, bgh, bgx, bgy, el) {
    var that = this;
    that.bg = bg;
    that.t = t;
    that.l = l;
    that.w = w;
    that.h = h;
    that.bgw = bgw;
    that.bgh = bgh;
    that.bgx = bgx;
    that.bgy = bgy;
    that.el = el;
};
GlitchBlock.prototype = {
    setOriginals: function () {
        var that = this;
        that.el.css("position", "absolute");
        that.el.css("top", that.t + "px").css("left", that.l + "px");
        that.el.css("height", that.h + "px").css("width", that.w + "px");
        that.el.css("padding", "0px").css("margin", "0px");
        that.el.css("background-image", "url(" + that.bg + ")");
        that.el.css("background-repeat", "no-repeat");
        that.el.css("background-attachment", "fixed");
        // offset the background image according to the size of the original image
        that.el.css("background-size", that.bgw + "px " + that.bgh + "px");
        that.el.css("background-position", that.bgx + "px " + that.bgy + "px");
    },
    setGlitched: function () {
        // GLITCH THIS BLOCK RIGHT UP
        var that = this,
            x = (that.bgx + ((Math.random() - 0.5) * 5)),
            y = (that.bgy + ((Math.random() - 0.5) * 5));

        that.el.css("background-position", x + "px " + y + "px");
    }
};
