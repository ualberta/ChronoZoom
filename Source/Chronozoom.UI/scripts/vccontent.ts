/// <reference path='settings.ts'/>
/// <reference path='common.ts'/>
/// <reference path='bibliography.ts'/>
/// <reference path='urlnav.ts'/>
/// <reference path='cz.ts'/>

declare var Seadragon: any;

module CZ {
    export module VCContent {
        var elementclick = (<any>$).Event("elementclick");

        export function getVisibleForElement(element, scale, viewport, use_margin) {
            var margin = 2 * (CZ.Settings.contentScaleMargin && use_margin ? CZ.Settings.contentScaleMargin : 0);
            var width = viewport.width - margin;
            if (width < 0)
                width = viewport.width;
            var scaleX = scale * element.width / width;

            var height = viewport.height - margin;
            if (height < 0)
                height = viewport.height;
            var scaleY = scale * element.height / height;

            // LANE: changing centerY to not change // changed back
            var vs = { centerX: element.x + element.width / 2.0,
                centerY: element.y + element.height / 2.0,
                scale: scaleX
            };
            return vs;
        }

        var zoomToElementHandler = function (sender, e, scale /* n [time units] / m [pixels] */) {
            var vp = sender.vc.getViewport();
            var visible = getVisibleForElement(sender, scale, vp,true);
            elementclick.newvisible = visible;

            elementclick.element = sender;
            sender.vc.element.trigger(elementclick);
            return true;
        };

        /*  Represents a base element that can be added to the VirtualCanvas.
        @remarks CanvasElement has extension in virtual space, that enables to check visibility of an object and render it.
        @param vc   (jquery to virtual canvas) note that vc.element[0] is the virtual canvas object
        @param layerid   (any type) id of the layer for this object
        @param id   (any type) id of the object
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @remarks
        If element.isRendered defined and true, the element was actually rendered on a canvas.
        If element.onIsRenderedChanged defined, it is called when isRendered changes.
        */
        export function CanvasElement(vc, layerid, id, vx, vy, vw, vh) {
            this.vc = vc;
            this.id = id;
            this.layerid = layerid;
            this.x = vx;
            this.y = vy;
            this.newY = vy;
            this.width = vw;
            this.height = vh;
            this.newHeight = vh;

            this.children = [];
            this.fadeIn = false; // indicates whether element has had fade in animation or not

            /* Checks whether this object is visible in the given visible box (in virtual space)
            @param visibleBox_v   ({Left,Top,Right,Bottom}) Visible region in virtual space
            @returns    True, if visible.
            */
            this.isVisible = function (visibleBox_v) {
                var objRight = this.x + this.width;
                var objBottom = this.y + this.height;
                return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right) &&
                            Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
            };

            /* Checks whether the given point (virtual) is inside the object
            (should take into account the shape) */
            this.isInside = function (point_v) {
                return point_v.x >= this.x && point_v.x <= this.x + this.width &&
                       point_v.y >= this.y && point_v.y <= this.y + this.height;
            };

            /* Renders a CanvasElement.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @param opacity          (float in [0,1]) 0 means transparent, 1 means opaque.
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox_v, viewport2d, size_p, opacity) {
            };
        }

        /* Adds a rectangle as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle}) Parameters of the rectangle appearance
        */
        export var addRectangle = function (element, layerid, id, vx, vy, vw, vh, settings) {
            return addChild(element, new CanvasRectangle(element.vc, layerid, id, vx, vy, vw, vh, settings), false);
        };

        /* Adds a circle as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id        (any type) id of an element
        @param vxc       (number) center x in virtual space
        @param vyc       (number) center y in virtual space
        @param vradius   (number) radius in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle}) Parameters of the circle appearance
        @remarks 
        The element is always rendered as a circle and ignores the aspect ratio of the viewport.
        For this, circle radius in pixels is computed from its virtual width.
        */
        export var addCircle = function (element, layerid, id, vxc, vyc, vradius, settings, suppressCheck) {
            return addChild(element, new CanvasCircle(element.vc, layerid, id, vxc, vyc, vradius, settings), suppressCheck);
        };

        /* Adds an image as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param z    (number) z-index
        @param imgSrc (string) image URI
        @param onload (optional callback function) called when image is loaded
        @param parent (CanvasElement) Parent element, whose children is to be new element.
        */
        export var addImage = function (element, layerid, id, vx, vy, vw, vh, imgSrc, onload?) {
            if (vw <= 0 || vh <= 0) throw "Image size must be positive";
            return addChild(element, new CanvasImage(element.vc, layerid, id, imgSrc, vx, vy, vw, vh, onload), false);
        };
        export var addLodImage = function (element, layerid, id, vx, vy, vw, vh, imgSources, onload?) {
            if (vw <= 0 || vh <= 0) throw "Image size must be positive";
            return addChild(element, new CanvasLODImage(element.vc, layerid, id, imgSources, vx, vy, vw, vh, onload), false);
        };
        export var addSeadragonImage = function (element, layerid, id, vx, vy, vw, vh, z, imgSrc, onload?) {
            if (vw <= 0 || vh <= 0) throw "Image size must be positive";
            return addChild(element, new SeadragonImage(element.vc, /*parent*/element, layerid, id, imgSrc, vx, vy, vw, vh, z, onload), false);
        };

        /* Adds a video as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param videoSource (string) video URI
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param z (number) z-index
        */
        export var addVideo = function (element, layerid, id, videoSource, vx, vy, vw, vh, z) {
            return addChild(element, new CanvasVideoItem(element.vc, layerid, id, videoSource, vx, vy, vw, vh, z), false);
        };

        /* Adds a pdf as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param pdfSource (string) pdf URI
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param z (number) z-index
        */
        export var addPdf = function (element, layerid, id, pdfSource, vx, vy, vw, vh, z) {
            return addChild(element, new CanvasPdfItem(element.vc, layerid, id, pdfSource, vx, vy, vw, vh, z), false);
        };

        /* Adds an audio as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param audioSource (string) audio URI
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param z (number) z-index
        */
        var addAudio = function (element, layerid, id, audioSource, vx, vy, vw, vh, z) {
            return addChild(element, new CanvasAudioItem(element.vc, layerid, id, audioSource, vx, vy, vw, vh, z), false);
        };

        /*  Adds a text element as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param baseline (number) y coordinate of the baseline in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings     ({ fillStyle, fontName }) Parameters of the text appearance
        @param vw (number) optional width of the text; if undefined, it is automatically asigned to width of the given text line.
        @remarks
        Text width is adjusted using measureText() on first render call. 
        */
        export function addText(element, layerid, id, vx, vy, baseline, vh, text, settings, vw?) {
            return addChild(element, new CanvasText(element.vc, layerid, id, vx, vy, baseline, vh, text, settings, vw), false);
        };

        export function addFixedHeading(element, layerid, id, vx, vy, baseline, vh, text, settings, vw?) {
            return addChild(element, new CanvasFixedHeading(element.vc, layerid, id, vx, vy, baseline, vh, text, settings, vw), false);
        };

        export function addEventHeading(element, layerid, id, vx, vy, baseline, vh, text, settings, vw?) {
            return addChild(element, new CanvasEventHeading(element.vc, layerid, id, vx, vy, baseline, vh, text, settings, vw), false);
        };

        export function addScrollText(element, layerid, id, vx, vy, vw, vh, text, z, settings) {
            return addChild(element, new CanvasScrollTextItem(element.vc, layerid, id, vx, vy, vw, vh, text, z), false);
        };

        /*  Adds a multiline text element as a child of the given virtual canvas element.
        @param element   (CanvasElement) Parent element, whose children is to be new element.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vh   (number) height of a text
        @param lineWidth (number) width of a line to text output
        @param settings     ({ fillStyle, fontName }) Parameters of the text appearance
        @remarks
        Text width is adjusted using measureText() on first render call. 
        */
        export function addMultiLineText(element, layerid, id, vx, vy, baseline, vh, text, lineWidth, settings) {
            return addChild(element, new CanvasMultiLineTextItem(element.vc, layerid, id, vx, vy, vh, text, lineWidth, settings), false);
        };

        function turnIsRenderedOff(element) {
            element.isRendered = false;
            if (element.onIsRenderedChanged)
                element.onIsRenderedChanged();
            var n = element.children.length;
            for (; --n >= 0; ) {
                if (element.children[n].isRendered)
                    turnIsRenderedOff(element.children[n]);
            }
        }

        /* Renders a CanvasElement recursively 
        @param element          (CanvasElement) element to render
        @param contexts         (map<layerid,context2d>) Contexts for layers' canvases.
        @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
        @param viewport2d       (Viewport2d) current viewport
        @param opacity          (float in [0,1]) 0 means transparent, 1 means opaque.
        */
        export var render = function (element, contexts, visibleBox_v, viewport2d, opacity) {
            if (!element.isVisible(visibleBox_v)) {
                if (element.isRendered) turnIsRenderedOff(element);
                return;
            }

            var sz = viewport2d.vectorVirtualToScreen(element.width, element.height);
            if (sz.y <= CZ.Settings.renderThreshold || (element.width != 0 && sz.x <= CZ.Settings.renderThreshold)) { // (width != 0): to render text first time, since it measures its width on first render only
                if (element.isRendered) turnIsRenderedOff(element);
                return;
            }

            var ctx = contexts[element.layerid];
            if (element.opacity != null) {
                opacity *= element.opacity;
            }

            // Rendering an element 
            if (element.isRendered == undefined || !element.isRendered) {
                element.isRendered = true;
                if (element.onIsRenderedChanged)
                    element.onIsRenderedChanged();
            }
            element.render(ctx, visibleBox_v, viewport2d, sz, opacity);

            var children = element.children;
            var n = children.length;
            for (var i = 0; i < n; i++) {
                render(children[i], contexts, visibleBox_v, viewport2d, opacity);
            }
        };

        /* Adds a CanvasElement instance to the children array of this element.
        @param  element     (CanvasElement) new child of this element
        @returns    the added element
        @remarks    Bounding box of element must be included in bounding box of the this element. Otherwise, throws an exception.
        The method must be called within the BeginEdit/EndEdit of the root item.
        */
        export var addChild = function (parent, element, suppresCheck) {
            var isWithin = parent.width == Infinity ||
                           (element.x >= parent.x && element.x + element.width <= parent.x + parent.width) &&
                           (element.y >= parent.y && element.y + element.height <= parent.y + parent.height);

            // if (!isWithin)
            //     console.log("Child element does not belong to the parent element " + parent.id + " " + element.ID);

            //if (!suppresCheck && !isWithin) throw "Child element does not belong to the parent element";
            parent.children.push(element);
            element.parent = parent;
            return element;
        };

        /* Looks up an element with given id in the children of this element and removes it with its children.
        @param id   (any) id of an element
        @returns    true, if element found and removed; otherwise, false.
        @remarks    The method must be called within the BeginEdit/EndEdit of the root item.
        If a child has onRemove() method, it is called right after removing of the child and clearing of all its children (recursively).
        */
        export var removeChild = function (parent, id) {
            var n = parent.children.length;
            for (var i = 0; i < n; i++) {
                var child = parent.children[i];
                if (child.id == id) {
                    // remove element from hash map of animating elements in dynamic layout animation
                    if (typeof CZ.Layout.animatingElements[child.id] !== 'undefined') {
                        delete CZ.Layout.animatingElements[child.id];
                        CZ.Layout.animatingElements.length--;
                    }

                    parent.children.splice(i, 1);
                    clear(child);
                    if (child.onRemove) child.onRemove();
                    child.parent = null;
                    return true;
                }
            }
            return false;
        };

        var removeTimeline = function (timeline) {
            var n = timeline.children.length;
            console.log(n);
            for (var i = 0; i < n; i++) {
                var child = timeline.children[i];
                //clear(timeline);
                if (timeline.onRemove) timeline.onRemove();
                //child.parent = null;
                child.parent = timeline.parent;
            }
        };

        /* Removes all children elements of this object (recursively).
        @remarks    The method must be called within the BeginEdit/EndEdit of the root item.
        For each descendant element that has onRemove() method, the method is called right after its removing and clearing of all its children (recursively).
        */
        function clear(element) {
            var n = element.children.length;
            for (var i = 0; i < n; i++) {
                var child = element.children[i];

                // remove element from hash map of animating elements in dynamic layout animation
                if (typeof CZ.Layout.animatingElements[child.id] !== 'undefined') {
                    delete CZ.Layout.animatingElements[child.id];
                    CZ.Layout.animatingElements.length--;
                }

                clear(child);
                if (child.onRemove) child.onRemove();
                child.parent = null;
            }
            element.children = [];
        };

        /* Finds and returns a child element with given id (no recursion)
        @param id   (any) id of a child element
        @returns    The children object (derived from CanvasContentItem) 
        @exception  if there is no child with the id
        */
        export function getChild(element, id) {
            var n = element.children.length;
            for (var i = 0; i < n; i++) {
                if (element.children[i].id == id) return element.children[i];
            }
            throw "There is no child with id [" + id + "]";
        };

        /*****************************************************************************************/
        /* Root element                                                                          */
        /*  A root of an element tree of a VirtualCanvas.
        @param vc   (VirtualCanvas) A virtual canvas that own this element tree.
        @param layerid   (any type) id of the layer for this object
        @param id   (any type) id of the object
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        */
        export function CanvasRootElement(vc, layerid, id, vx, vy, vw, vh) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.opacity = 0;

            /* Overrides base function. Root element is visible when it has at least one child. */
            this.isVisible = function (visibleBox_v) {
                return this.children.length != 0;
            };

            /* Begins editing of the element tree.
            @returns This element.
            @remarks Call BeginEdit prior to modify an element tree. The EndEdit method must be called, when editing is to be completed.
            The VirtualCanvas is invalidated on EndEdit only.
            */
            this.beginEdit = function () {
                return this;
            };

            /* Ends editing of the element tree.
            @param dontRender   (number) if zero (default value), invalidates and renders the virtual canvas content.
            @returns This element.
            @remarks Call BeginEdit prior to modify an element tree. The EndEdit method must be called, when editing is to be completed.
            The VirtualCanvas is invalidated on EndEdit only, if dontRender is false.
            */
            this.endEdit = function (dontRender) {
                if (!dontRender)
                    this.vc.invalidate();
            };

            /* Checks whether the given point (virtual) is inside the object
            (should take into account the shape) */
            this.isInside = function (point_v) {
                return true;
            };

            /* Renders a CanvasElement recursively 
            @param contexts         (map<layerid,context2d>) Contexts for layers' canvases.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            */
            this.render = function (contexts, visibleBox_v, viewport2d) {
                this.vc.breadCrumbs = [];
                if (!this.isVisible(visibleBox_v)) return;
                var n = this.children.length;
                for (var i = 0; i < n; i++) {
                    render(this.children[i], contexts, visibleBox_v, viewport2d, 1.0);
                }

                if (this.vc.breadCrumbs.length > 0 && (this.vc.recentBreadCrumb == undefined || this.vc.breadCrumbs[vc.breadCrumbs.length - 1].vcElement.id != this.vc.recentBreadCrumb.vcElement.id)) { //the deepest bread crumb is changed
                    this.vc.recentBreadCrumb = this.vc.breadCrumbs[vc.breadCrumbs.length - 1];
                    this.vc.breadCrumbsChanged();
                }
                else {
                    if (this.vc.breadCrumbs.length == 0 && this.vc.recentBreadCrumb != undefined) { //in case of no bread crumbs at all
                        this.vc.recentBreadCrumb = undefined;
                        this.vc.breadCrumbsChanged();
                    }
                }
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }

        /*****************************************************************************************/
        /* Dynamic Level of Details element                                                      */
        /* Gets the zoom level for the given size of an element (in pixels).
        @param size_p           ({x,y}) size of bounding box of this element in pixels
        @returns (number)   zoom level which minimum natural number or zero zl so that max(size_p.x,size_p.y) <= 2^zl
        */
        function getZoomLevel(size_p) {
            var sz = Math.max(size_p.x, size_p.y);
            if (sz <= 1) return 0;
            var zl = (sz & 1) ? 1 : 0;
            for (var i = 1; i < 32; i++) {
                sz = sz >>> 1;
                if (sz & 1) {
                    if (zl > 0) zl = i + 1;
                    else zl = i;
                }
            }
            return zl;
        }

        /* A base class for elements those support different content for different zoom levels.
        @remarks
        Property "removeWhenInvisible" is optional. If set, the content is completely removed every time when isRendered changes from true to false.
        */
        function CanvasDynamicLOD(vc, layerid, id, vx, vy, vw, vh) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.zoomLevel = 0;
            this.prevContent = null;
            this.newContent = null;
            this.asyncContent = null;
            this.lastRenderTime = 0;

            var self = this;

            /* Returns new content elements tree for the given zoom level, if it should change, or null.
            @returns { zoomLevel: number, content: CanvasElement}, or null.
            */
            this.changeZoomLevel = function (currentZoomLevel, newZoomLevel) {
                return null;
            }

            var startTransition = function (newContent) {
                self.lastRenderTime = new Date();

                self.prevContent = self.content;
                self.content = newContent.content;
                addChild(self, self.content, false);

                if (self.prevContent) {
                    if (!self.prevContent.opacity)
                        self.prevContent.opacity = 1.0;
                    self.content.opacity = 0.0;
                }
                self.zoomLevel = newContent.zoomLevel;
            };

            var onAsyncContentLoaded = function () {
                if (self.asyncContent) {
                    startTransition(self.asyncContent);
                    self.asyncContent = null;
                    delete this.onLoad;
                    self.vc.requestInvalidate();
                }
            };

            /* Renders a rectangle.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) { // todo: consider parent's opacity, too
                
                this.vy = vy = viewport2d.visible.centerY;
                if (this.asyncContent) return; // no animation until async content is loaded for previous zoom level
                if (!this.prevContent) { // there is not "previous content" now
                    var newZoomLevel = getZoomLevel(size_p);
                    if (this.zoomLevel != newZoomLevel) { // zoom level has changed
                        var newContent = this.changeZoomLevel(this.zoomLevel, newZoomLevel);
                        if (newContent) { // we've got new content 
                            if (newContent.content.isLoading) { // async content
                                this.asyncContent = newContent;
                                newContent.content.onLoad = onAsyncContentLoaded;
                            }
                            else { // sync content
                                startTransition(newContent);
                            }
                        }
                    }
                }
                if (this.prevContent) {
                    var renderTime = new Date();
                    var renderTimeDiff = renderTime - self.lastRenderTime;
                    self.lastRenderTime = renderTime;

                    // Override the default contentAppearanceAnimationStep,
                    // instead of being a constant it now depends on the time,
                    // such that each transition animation takes about 1.6 sec.
                    var contentAppearanceAnimationStep = renderTimeDiff / 1600;

                    var doInvalidate = false;
                    var lopacity = this.prevContent.opacity;
                    lopacity = Math.max(0.0, lopacity - contentAppearanceAnimationStep);
                    if (lopacity != this.prevContent.opacity) doInvalidate = true;
                    if (lopacity == 0) { // prevContent can be removed
                        removeChild(this, this.prevContent.id);
                        this.prevContent = null;
                    } else {
                        this.prevContent.opacity = lopacity;
                    }

                    lopacity = this.content.opacity;
                    lopacity = Math.min(1.0, lopacity + contentAppearanceAnimationStep);
                    if (!doInvalidate && lopacity != this.content.opacity) doInvalidate = true;
                    this.content.opacity = lopacity;

                    if (doInvalidate) this.vc.requestInvalidate();
                }
            }

            this.onIsRenderedChanged = function () {
                if (typeof this.removeWhenInvisible === 'undefined' || !this.removeWhenInvisible) return;
                if (!this.isRendered) {
                    if (this.asyncContent) { // we're waiting for async operation
                        this.asyncContent = null;
                    }
                    if (this.prevContent) {
                        removeChild(this, this.prevContent.id);
                        this.prevContent = null;
                    }
                    if (this.newContent) {
                        removeChild(this, this.newContent.id);
                        this.newContent.content.onLoad = null;
                        this.newContent = null;
                    }
                    if (this.content) {
                        removeChild(this, this.content.id);
                        this.content = null;
                    }

                    /* Set hasContentItems to false for parent infodot.
                    if (this.parent.hasContentItems != null || this.parent.hasContentItems)
                    this.parent.hasContentItems = false; */

                    this.zoomLevel = 0;
                }
            }
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);

        }

        /*****************************************************************************************/
        /* Primitive elements                                                                    */
        /*  An element which doesn't have visual representation, but can contain other elements.
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        */
        function ContainerElement(vc, layerid, id, vx, vy, vw, vh) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);

            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);

        }

        /*  A timespan element that can be added to a VirtualCanvas.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle,outline:boolean}) Parameters of the rectangle appearance
        */
        export function CanvasTimespan(vc, layerid, id, vx, vy, vw, vh, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.settings = settings || {};
            this.settings.gradientFillStyle = false;
            this.type = "rectangle";

            var lineY = -CZ.Settings.fixedTimelineOffset;
            var sideTicks = CZ.Settings.timelineEndTicks;
            var tlOffset;

            /* Renders a time span.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */

            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;
                tlOffset = (viewport2d.height+lineY);

                var p = viewport2d.pointVirtualToScreen(this.x, this.y);    // top left point
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height); // bottom right point
                var left = Math.max(0, p.x);
                var top = Math.max(0, p.y);
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);

                //ctx.globalAlpha = 1;
                //ctx.fillStyle = 'rgba(255,255,255,0.15)';
                //ctx.fillRect(p.x, p.y, p2.x-p.x, p2.y - p.y);

                // LANE: Checking depth
                // console.log(id + ': ' + this.settings.depth);
                if (left < right) {

                    ctx.globalAlpha = opacity;
                    if (this.settings.strokeStyle) {
                        ctx.strokeStyle = this.settings.strokeStyle;
                        if (this.settings.lineWidth) {
                            if (this.settings.isLineWidthVirtual) { // in virtual coordinates
                                ctx.lineWidth = viewport2d.widthVirtualToScreen(this.settings.lineWidth);
                            } else {
                                ctx.lineWidth = this.settings.lineWidth; // in pixels
                            }
                        }
                        else ctx.lineWidth = 1;
                        ctx.lineWidth = 2;
                        var lineWidth2 = ctx.lineWidth * 2.0;

                        if (this.settings.outline) {
                            p.x += lineWidth2;
                            p.y += lineWidth2;
                            top += lineWidth2;
                            bottom -= lineWidth2;
                            left += lineWidth2;
                            right -= lineWidth2;
                            p2.x -= lineWidth2;
                            p2.y -= lineWidth2;
                        }

                        // calculate opacity based off of width
                        var pLineWidth = right - left;
                        var lineOpacity = 1;
                        if(pLineWidth < 400) {
                            lineOpacity = Math.min((pLineWidth / 400)+0.2,1);
                            if(pLineWidth <= 10) {
                                lineOpacity = 0;
                            }
                        }

                        ctx.globalAlpha = lineOpacity;

                        if(pLineWidth > 10) {

                            // LANE: Changed this from a rectangle to a line
                            // left border
                            if (p.x > 0) {
                                ctx.beginPath();
                                ctx.moveTo(p.x, tlOffset-sideTicks);
                                ctx.lineTo(p.x, tlOffset+sideTicks);
                                ctx.stroke();
                            }

                            // right border
                            if (p2.x < viewport2d.width) {
                                ctx.beginPath();
                                ctx.moveTo(p2.x, tlOffset-sideTicks);
                                ctx.lineTo(p2.x, tlOffset+sideTicks);
                                ctx.stroke();
                            }
                            
                            var lineLength = CZ.Settings.timelineFixedHeadingWidth/2;
                            if(this.settings.spanGap > 0)
                                lineLength = this.settings.spanGap/2;
                            
                            // middle line
                            var lineStart = 0;
                            var lineEnd = 0;
                            var baseLine = tlOffset;

                            if(((right-left) - lineLength*2) > 0) {
                                if(right > (right-(((right-left)/2)-lineLength-5))) {
                                    lineStart = right-(((right-left)/2)-lineLength-5);
                                    lineEnd = right;

                                    ctx.beginPath();
                                    ctx.moveTo(lineStart, baseLine);
                                    ctx.lineTo(lineEnd, baseLine);
                                    ctx.stroke();
                                }
                                if(left < (left+(((right-left)/2)-lineLength-5))) {
                                    lineStart = left;
                                    lineEnd = left+(((right-left)/2)-lineLength-5);

                                    ctx.beginPath();
                                    ctx.moveTo(lineStart, baseLine);
                                    ctx.lineTo(lineEnd, baseLine);
                                    ctx.stroke();
                                }
                            } else {
                                lineStart = left;
                                lineEnd = right;

                                ctx.beginPath();
                                ctx.moveTo(lineStart, baseLine);
                                ctx.lineTo(lineEnd, baseLine);
                                ctx.stroke();
                            }

                            if (this.settings.gradientFillStyle) {
                                var lineargradient = ctx.createLinearGradient(0, baseLine-200, 0, baseLine);
                                var transparent = "rgba(0, 0, 0, 0)";
                                lineargradient.addColorStop(0, transparent);
                                lineargradient.addColorStop(1, 'rgba(255,255,255,0.15)');

                                ctx.globalAlpha = lineOpacity;
                                ctx.fillStyle = lineargradient;
                                ctx.fillRect(p.x+3, baseLine-200, p2.x-p.x-5, 197);
                                //console.log('We have a gradient fillstyle');
                            }

                        }
                        
                        // JUNE 27: DRAW A RECTANGLE TO COVER THE HOVER AREA
                        //ctx.globalAlpha = 1;
                        //ctx.fillStyle = 'rgba(255,255,255,0.5)';
                        //ctx.fillRect(p.x, p.y, p2.x-p.x, p2.y - p.y);

                        //ctx.fillRect(p.x, tlOffset-sideTicks, p2.x-p.x, sideTicks*2);

                        //console.log(id + ': ' + viewport2d.heightScreenToVirtual(p2.y - p.y));

                    }
                }
            };

            this.intersects = function (rect) {
                return !(this.x + this.width < rect.x || this.x > rect.x + rect.width || this.y + this.height < rect.y || this.y > rect.y + rect.height);
            };

            this.contains = function (rect) {
                return (rect.x > this.x && rect.x + rect.width < this.x + this.width && rect.y > this.y && rect.y + rect.height < this.y + this.height);
            };

            this.isVisibleOnScreen = function (scale) {
                return this.width / scale >= CZ.Settings.minTimelineWidth;
            }

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }

        /*  A rectangle element that can be added to a VirtualCanvas.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle,outline:boolean}) Parameters of the rectangle appearance
        */
        export function CanvasRectangle(vc, layerid, id, vx, vy, vw, vh, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.settings = settings;
            this.type = "rectangle";


            /* Renders a rectangle.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {

                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height);
                var left = Math.max(0, p.x);
                var top = Math.max(0, p.y);
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);
                if (left < right && top < bottom) {

                    if (this.settings.fillStyle) {
                        var opacity1 = this.settings.gradientOpacity ? opacity * (1 - this.settings.gradientOpacity) : opacity;
                        ctx.globalAlpha = opacity1;
                        ctx.fillStyle = this.settings.fillStyle;
                        ctx.fillRect(left, top, right - left, bottom - top);

                        if (this.settings.gradientOpacity && this.settings.gradientFillStyle) {
                            var lineargradient = ctx.createLinearGradient(left, bottom, right, top);
                            var transparent = "rgba(0, 0, 0, 0)";
                            lineargradient.addColorStop(0, this.settings.gradientFillStyle);
                            lineargradient.addColorStop(1, transparent);

                            ctx.globalAlpha = opacity * this.settings.gradientOpacity;
                            ctx.fillStyle = lineargradient;
                            ctx.fillRect(left, top, right - left, bottom - top);
                        }
                    }

                    ctx.globalAlpha = opacity;
                    if (this.settings.strokeStyle) {
                        ctx.strokeStyle = this.settings.strokeStyle;
                        if (this.settings.lineWidth) {
                            if (this.settings.isLineWidthVirtual) { // in virtual coordinates
                                ctx.lineWidth = viewport2d.widthVirtualToScreen(this.settings.lineWidth);
                            } else {
                                ctx.lineWidth = this.settings.lineWidth; // in pixels
                            }
                        }
                        else ctx.lineWidth = 1;

                        var lineWidth2 = ctx.lineWidth / 2.0;
                        lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;

                        if (this.settings.outline) {
                            p.x += lineWidth2;
                            p.y += lineWidth2;
                            top += lineWidth2;
                            bottom -= lineWidth2;
                            left += lineWidth2;
                            right -= lineWidth2;
                            p2.x -= lineWidth2;
                            p2.y -= lineWidth2;
                        }

                        if (p.x > 0) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, top - lineWidth2);
                            ctx.lineTo(p.x, bottom + lineWidth2);
                            ctx.stroke();
                        }
                        if (p.y > 0) {
                            ctx.beginPath();
                            ctx.moveTo(left - lineWidth2, lineY);
                            ctx.lineTo(right + lineWidth2, lineY);
                            ctx.stroke();
                        }
                        if (p2.x < viewport2d.width) {
                            ctx.beginPath();
                            ctx.moveTo(p2.x, top - lineWidth2);
                            ctx.lineTo(p2.x, bottom + lineWidth2);
                            ctx.stroke();
                        }
                        if (p2.y < viewport2d.height) {
                            ctx.beginPath();
                            ctx.moveTo(left - lineWidth2, lineY);
                            ctx.lineTo(right + lineWidth2, lineY);
                            ctx.stroke();
                        }
                    }
                }
            };

            this.intersects = function (rect) {
                return !(this.x + this.width < rect.x || this.x > rect.x + rect.width || this.y + this.height < rect.y || this.y > rect.y + rect.height);
            };

            this.contains = function (rect) {
                return (rect.x > this.x && rect.x + rect.width < this.x + this.width && rect.y > this.y && rect.y + rect.height < this.y + this.height);
            };

            this.isVisibleOnScreen = function (scale) {
                return this.width / scale >= CZ.Settings.minTimelineWidth;
            }

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }

        /*  A Timeline element that can be added to a VirtualCanvas (Rect + caption + bread crumbs tracing).
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle}) Parameters of the rectangle appearance
        */
        function CanvasTimeline(vc, layerid, id, vx, vy, vw, vh, settings, timelineinfo) {
            this.base = CanvasTimespan;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.guid = timelineinfo.guid;
            this.type = 'timeline';

            this.isBuffered = timelineinfo.isBuffered;
            this.settings = settings;
            this.parent = undefined;
            this.currentlyObservedTimelineEvent = vc.currentlyObservedTimelineEvent;
            this.settings.outline = true;

            this.type = 'timeline';

            this.endDate = timelineinfo.endDate;

            var width = timelineinfo.timeEnd - timelineinfo.timeStart;

            var headerSize = timelineinfo.titleRect ? timelineinfo.titleRect.height : CZ.Settings.timelineHeaderSize * timelineinfo.height;
            var headerWidth = timelineinfo.titleRect ? timelineinfo.titleRect.width : 0;
            var marginLeft = width/2 - headerWidth/2; // size of left and top margins (e.g. if timeline is for 100 years, relative margin timelineHeaderMargin=0.05, then absolute margin is 5 years).
            var marginTop = timelineinfo.titleRect ? timelineinfo.titleRect.marginTop : (1 - CZ.Settings.timelineHeaderMargin) * timelineinfo.height - headerSize;
            var baseline = timelineinfo.top + marginTop + headerSize / 2.0;

            this.titleObject = addText(this, layerid, id + "__header__", timelineinfo.timeStart+marginLeft, timelineinfo.top+marginTop, baseline, headerSize,
                timelineinfo.header, {
                    fontName: CZ.Settings.timelineHeaderFontName,
                    fillStyle: CZ.Settings.timelineHeaderFontColor,
                    textBaseline: 'middle'
                }, headerWidth);

            this.title = this.titleObject.text;
            this.regime = timelineinfo.regime;
            this.settings.gradientOpacity = 0;
            this.settings.gradientFillStyle = timelineinfo.gradientFillStyle || timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
            //this.opacity = timelineinfo.opacity;

            this.reactsOnMouse = true;

            this.tooltipEnabled = true; //enable tooltips to timelines
            this.tooltipIsShown = false; // indicates whether tooltip is shown or not

            this.onmouseclick = function (e) { return zoomToElementHandler(this, e, 1.0); };
            this.onmousehover = function (pv, e) {
                //previous timeline also hovered and mouse leave don't appear, hide it
                //if infodot is null or undefined, we should stop animation
                //if it's ok, infodot's tooltip don't wink
                if (this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id != id) {
                    try {
                        this.vc.currentlyHoveredInfodot.id;
                    }
                    catch (ex) {
                        CZ.Common.stopAnimationTooltip();
                        this.vc.currentlyHoveredTimeline.tooltipIsShown = false;
                    }
                }

                //make currentTimeline to this
                this.vc.currentlyHoveredTimeline = this;

                this.settings.strokeStyle = CZ.Settings.timelineHoveredBoxBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineHoveredLineWidth;
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHoveredHeaderFontColor;
                this.settings.hoverAnimationDelta = 3 / 60.0;
                this.vc.requestInvalidate();

                //if title is not in visible region, try to eval its screenFontSize using 
                //formula based on height of its parent timeline
                if (this.titleObject.initialized == false) {
                    var vp = this.vc.getViewport();
                    this.titleObject.screenFontSize = CZ.Settings.timelineHeaderSize * vp.heightVirtualToScreen(this.height);
                }

                //if timeline title is small, show tooltip
                if (this.titleObject.screenFontSize <= CZ.Settings.timelineTooltipMaxHeaderSize)
                    this.tooltipEnabled = true;
                else
                    this.tooltipEnabled = false;

                if (CZ.Common.tooltipMode != "infodot") {

                    CZ.Common.tooltipMode = "timeline";

                    if (this.tooltipEnabled == false) {
                        CZ.Common.stopAnimationTooltip();
                        this.tooltipIsShown = false;
                        return;
                    }

                    // show tooltip if it is enabled and is not shown yet
                    if (this.tooltipIsShown == false) {
                        switch (this.regime) {
                            case "Cosmos": $(".bubbleInfo").attr("id", "cosmosRegimeBox");
                                break;

                            case "Earth": $(".bubbleInfo").attr("id", "earthRegimeBox");
                                break;

                            case "Life": $(".bubbleInfo").attr("id", "lifeRegimeBox");
                                break;

                            case "Pre-history": $(".bubbleInfo").attr("id", "prehistoryRegimeBox");
                                break;

                            case "Humanity": $(".bubbleInfo").attr("id", "humanityRegimeBox");
                                break;
                        }

                        $(".bubbleInfo span").text(this.title);
                        this.panelWidth = $('.bubbleInfo').outerWidth(); // complete width of tooltip panel
                        this.panelHeight = $('.bubbleInfo').outerHeight(); // complete height of tooltip panel  

                        this.tooltipIsShown = true;
                        CZ.Common.animationTooltipRunning = $('.bubbleInfo').fadeIn();
                    }
                }
            };
            this.onmouseunhover = function (pv, e) {
                if (this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id == id) {
                    this.vc.currentlyHoveredTimeline = null;

                    if ((this.tooltipIsShown == true) && (CZ.Common.tooltipMode=="timeline")) {
                        CZ.Common.tooltipMode = "default";
                        CZ.Common.stopAnimationTooltip();
                        $(".bubbleInfo").attr("id", "defaultBox");
                        this.tooltipIsShown = false;    
                    }
                }    

                this.settings.strokeStyle = timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineLineWidth;
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHeaderFontColor;
                this.settings.hoverAnimationDelta = -3 / 60.0;
                this.vc.requestInvalidate();
            };

            //saving render call before overriding it
            this.base_render = this.render;

            /* Renders a timeline.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {

                this.titleObject.initialized = false; //disable CanvasText initialized (rendered) option by default

                if (this.settings.hoverAnimationDelta) {
                    this.settings.gradientOpacity = Math.min(1, Math.max(0, this.settings.gradientOpacity + this.settings.hoverAnimationDelta));
                }

                //rendering itself
                this.base_render(ctx, visibleBox, viewport2d, size_p, opacity);

                if (this.settings.hoverAnimationDelta) {
                    if (this.settings.gradientOpacity == 0 || this.settings.gradientOpacity == 1)
                        this.settings.hoverAnimationDelta = undefined;
                    else
                        this.vc.requestInvalidate();
                }

                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = { x: p.x + size_p.x, y: p.y + size_p.y };

                // is center of canvas inside timeline
                var isCenterInside = viewport2d.visible.centerX - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.x + this.width &&
                                     viewport2d.visible.centerX + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.x &&
                                     viewport2d.visible.centerY - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.y + this.height &&
                                     viewport2d.visible.centerY + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.y;

                // is timeline inside "breadcrumb offset box"
                var isVisibleInTheRectangle = ((p.x < CZ.Settings.timelineBreadCrumbBorderOffset && p2.x > viewport2d.width - CZ.Settings.timelineBreadCrumbBorderOffset) ||
                                (p.y < CZ.Settings.timelineBreadCrumbBorderOffset && p2.y > viewport2d.height - CZ.Settings.timelineBreadCrumbBorderOffset));

                if (isVisibleInTheRectangle && isCenterInside) {
                    var length = vc.breadCrumbs.length;
                    if (length > 1)
                        if (vc.breadCrumbs[length - 1].vcElement.parent.id == this.parent.id)
                            return;
                    vc.breadCrumbs.push(
                    {
                        vcElement: this
                    });
                }
            }

            this.prototype = new CanvasTimespan(vc, layerid, id, vx, vy, vw, vh, settings);

        }

        /*  A Timeline element that can be added to a VirtualCanvas (Rect + caption + bread crumbs tracing).
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle}) Parameters of the rectangle appearance
        */
        function CanvasFixedTimeline(vc, layerid, id, vx, vy, vw, vh, settings, timelineinfo) {
            
            // LANE: Fixing the timeline to the bottom of the window
            var vp2d = vc.viewport;
            var newHeight = vp2d.heightScreenToVirtual(30);

            this.base = CanvasTimespan; // the fixed timeline uses TimeSpan as a base
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.guid = timelineinfo.guid;

            this.isBuffered = timelineinfo.isBuffered;
            this.settings = settings;
            this.parent = undefined;
            this.currentlyObservedTimelineEvent = vc.currentlyObservedTimelineEvent;
            this.settings.outline = true;
            
            this.type = 'timeline';

            this.endDate = timelineinfo.endDate;

            var width = timelineinfo.timeEnd - timelineinfo.timeStart;

            var headerSize = timelineinfo.titleRect ? timelineinfo.titleRect.height : CZ.Settings.timelineHeaderSize * timelineinfo.height;
            var headerWidth = timelineinfo.titleRect ? timelineinfo.titleRect.width : 0;
            var marginLeft = 0; // size of left and top margins (e.g. if timeline is for 100 years, relative margin timelineHeaderMargin=0.05, then absolute margin is 5 years).
            var marginTop = timelineinfo.titleRect ? timelineinfo.titleRect.marginTop : (1 - CZ.Settings.timelineHeaderMargin) * timelineinfo.height - headerSize;
            var baseline = timelineinfo.top + marginTop + headerSize / 2.0;

            this.titleObject = addFixedHeading(this, layerid, id + "__header__", timelineinfo.timeStart+marginLeft, timelineinfo.top+marginTop, baseline, headerSize,
                timelineinfo.header, {
                    fontName: CZ.Settings.timelineHeaderFontName,
                    fillStyle: CZ.Settings.timelineHeaderFontColor,
                    textBaseline: 'middle',
                    depth: timelineinfo.depth,
                    timeStart: timelineinfo.timeStart,
                    timeEnd: timelineinfo.timeEnd
                }, headerWidth);

            this.settings.spanGap = 0;
            if(this.titleObject.headingWidth)
                this.settings.spanGap = this.titleObject.headingWidth;

            this.title = this.titleObject.text;
            this.regime = timelineinfo.regime;
            this.settings.gradientOpacity = 0;
            this.settings.gradientFillStyle = timelineinfo.gradientFillStyle || timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
            //this.opacity = timelineinfo.opacity;

            this.reactsOnMouse = true;

            this.tooltipEnabled = true; //enable tooltips to timelines
            this.tooltipIsShown = false; // indicates whether tooltip is shown or not

            this.getSiblingTimeline = function(next) {
                var distance;
                var siblingTimeline;
                var curTimeline = this;
                if(this.parent && this.parent.type == 'timeline') {
                    var parentTimeline = this.parent;
                    var endDiff = Math.abs((parentTimeline.endDate)-(curTimeline.endDate));
                    var startDiff = Math.abs(parentTimeline.x-curTimeline.x);
                    if((endDiff < 1000 && next) || (startDiff < 1000 && !next)) {
                        //console.log("At the beginning or end of the timeline, getting parent sibling");
                        var nextTimeline = parentTimeline.getSiblingTimeline(next);
                        parentTimeline = siblingTimeline = nextTimeline;
                    }

                    if(!parentTimeline)
                        return false;

                    for(var i = 0; i < parentTimeline.children.length; i++) {
                        var sibling = parentTimeline.children[i];
                        if(sibling.type == 'timeline') {
                            if(next) {
                                if(Math.abs((curTimeline.endDate)-sibling.x) < 1000) {
                                    siblingTimeline = sibling;
                                    break;
                                }
                            } else {
                                if(Math.abs(sibling.endDate-curTimeline.x) < 1000) {
                                    siblingTimeline = sibling;
                                    break;
                                }
                            }
                        }
                    }              
                }
                //console.log([this,siblingTimeline]);
                if(siblingTimeline) 
                    return siblingTimeline;
            
                return false;
            };

            this.hasEvents = function() {
                var hasEvents = false;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot')
                        hasEvents = true;
                    if(this.children[i].type == 'timeline') {
                        hasEvents = this.children[i].hasEvents();
                    }
                }
                return hasEvents;
            };

            this.getFirstEvent = function() {
                if(this.children.length == 0)
                    return false;
                if(this.children.length == 1) {
                    if(this.children[0].type !== 'infodot' &&
                        this.children[0].type == 'timeline')
                        return false;
                }
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot') {
                        return this.children[i];
                    }
                    if(this.children[i].type == 'timeline') {
                        return this.children[i].getFirstEvent();
                    }
                }
                return false;
            };

            this.getLastEvent = function() {
                if(this.children.length == 0)
                    return false;
                if(this.children.length == 1) {
                    if(this.children[0].type !== 'infodot' &&
                        this.children[0].type == 'timeline')
                        return false;
                }
                for(var i = this.children.length-1; i > 0; i--) {
                    if(this.children[i].type == 'infodot') {
                        return this.children[i];
                    }
                    if(this.children[i].type == 'timeline') {
                        return this.children[i].getLastEvent();
                    }
                }
                return false;
            };

            this.getSiblingEvent = function(currentEvent, next) {
                var nextEvent;
                var distance;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' &&
                     this.children[i].x > currentEvent.x && 
                     next) {
                        // next event
                        if(distance) {
                            if(distance > (this.children[i].x - currentEvent.x)) {
                                distance = this.children[i].x - currentEvent.x;
                                nextEvent = this.children[i];
                            }
                        } else {
                            distance = this.children[i].x - currentEvent.x;
                            nextEvent = this.children[i];
                        }
                    } else if (this.children[i].type == 'infodot' &&
                        this.children[i].x < currentEvent.x && 
                        !next) {
                        // previous event
                        if(distance) {
                            if(distance > (currentEvent.x-this.children[i].x)) {
                                distance = currentEvent.x-this.children[i].x;
                                nextEvent = this.children[i];
                            }
                        } else {
                            distance = currentEvent.x-this.children[i].x;
                            nextEvent = this.children[i];
                        }
                    }
                }

                if(nextEvent)
                    return nextEvent;

                // no next event in timeline, check the next timeline.
                var sibling = this.getSiblingTimeline(next);
                while(sibling && !sibling.hasEvents()) {
                    sibling = sibling.getSiblingTimeline(next);
                }
                
                if(sibling) {
                    if(next) {
                        if(sibling.getFirstEvent())
                            return sibling.getFirstEvent();
                    } else {
                        for(var i = sibling.children.length-1; i > 0; i--) {
                            if(sibling.children[i].type == 'infodot') {
                                return sibling.getLastEvent();
                            }
                        }
                    }
                    return sibling; // no events, return the timeline
                }

                return false;
            };

            this.getNextEvent = function(currentEvent) {
                var nextEvent;
                var distance;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' &&
                     this.children[i].x > currentEvent.x) {
                        if(distance) {
                            if(distance > (this.children[i].x - currentEvent.x)) {
                                distance = this.children[i].x - currentEvent.x;
                                nextEvent = this.children[i];
                            }
                        } else {
                            distance = this.children[i].x - currentEvent.x;
                            nextEvent = this.children[i];
                        }
                    }
                }

                if(nextEvent)
                    return nextEvent;

                // no next event in timeline, check the next timeline.

            };

            this.getPreviousEvent = function(currentEvent) {
                var prevEvent;
                var distance;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' &&
                     this.children[i].x < currentEvent.x) {
                        if(distance) {
                            if(distance > (currentEvent.x-this.children[i].x)) {
                                distance = currentEvent.x-this.children[i].x;
                                prevEvent = this.children[i];
                            }
                        } else {
                            distance = currentEvent.x-this.children[i].x;
                            prevEvent = this.children[i];
                        }
                    }
                }

                if(prevEvent)
                    return prevEvent;

                // no previous event in timeline, check the previous timeline.

            };

            this.getClosestTimelineEvent = function(xCoordinate) {
                var offset;
                var closest;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' && this.children[i].canvasContentItem.isActive) {
                        if(offset) {
                            if(offset > Math.abs(xCoordinate-this.children[i].canvasContentItem.x))
                            {
                                closest = this.children[i];
                                offset = Math.abs(xCoordinate-this.children[i].canvasContentItem.x);
                            }
                        } else {
                            closest = this.children[i];
                            offset = Math.abs(xCoordinate-this.children[i].canvasContentItem.x);
                        }                 
                    }
                }
                //console.log(closest);
                return closest;
            };

            this.isVisible = function (visibleBox_v) {
                var objRight = this.x + this.width;
                return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right);
            };

            /* Checks whether the given point (virtual) is inside the object */
            this.isInside = function (point_v) {
                //for(var i = 0; i < this.children.length; i++) {
                //    if(this.children[0].isInside(point_v))
                //        return true;
                //}
                var sideTicks = CZ.Settings.timelineEndTicks;
                lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;                var tlOffset = (vc.viewport.height+lineY);
                // LANE: TODO: If the screen width is less than 18px, we'll say it's not inside. Probably a better method.
                if(vc.viewport.widthVirtualToScreen(this.width) < 18) {
                    return false;
                } else {
                    var point_s = vc.viewport.pointVirtualToScreen(point_v.x, point_v.y);
                    var insideBool = point_v.x >= this.x && point_v.x <= this.x + this.width &&
                    point_s.y <= tlOffset+sideTicks*2;
                    return insideBool;
                }
            };


            this.onmouseclick = function (e) { 
                if(this.vc.currentlyHoveredInfodot) {
                    return zoomToElementHandler(this.vc.currentlyHoveredInfodot.canvasContentItem, e, 0.35); 
                }
                return zoomToElementHandler(this, e, 1.0); 
            };
            this.onmousehover = function (pv, e) {
                //previous timeline also hovered and mouse leave don't appear, hide it
                //if infodot is null or undefined, we should stop animation
                //if it's ok, infodot's tooltip don't wink
                if (this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id != id) {
                    try {
                        this.vc.currentlyHoveredInfodot.id;
                    }
                    catch (ex) {
                        CZ.Common.stopAnimationTooltip();
                        this.vc.currentlyHoveredTimeline.tooltipIsShown = false;
                    }
                }

                //make currentTimeline to this
                this.vc.currentlyHoveredTimeline = this;

                this.settings.strokeStyle = CZ.Settings.timelineHoveredBoxBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineHoveredLineWidth;
                this.settings.gradientFillStyle = 'rgba(255,255,255,0.15)';
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHoveredHeaderFontColor;
                this.settings.hoverAnimationDelta = 3 / 60.0;
                this.vc.requestInvalidate();

                //if title is not in visible region, try to eval its screenFontSize using 
                //formula based on height of its parent timeline
                if (this.titleObject.initialized == false) {
                    var vp = this.vc.getViewport();
                    this.titleObject.screenFontSize = CZ.Settings.timelineHeaderSize * vp.heightVirtualToScreen(this.height);
                }

                //if timeline title is small, show tooltip
                if (vc.viewport.widthVirtualToScreen(this.width) <= CZ.Settings.fixedTimelineHeadingThreshold+5)
                    this.tooltipEnabled = true;
                else
                    this.tooltipEnabled = false;

                if (CZ.Common.tooltipMode != "infodot") {

                    CZ.Common.tooltipMode = "timeline";

                    if (this.tooltipEnabled == false) {
                        CZ.Common.stopAnimationTooltip();
                        this.tooltipIsShown = false;
                        return;
                    }

                    // show tooltip if it is enabled and is not shown yet
                    if (this.tooltipIsShown == false) {
                        switch (this.regime) {
                            case "Cosmos": $(".bubbleInfo").attr("id", "cosmosRegimeBox");
                                break;

                            case "Earth": $(".bubbleInfo").attr("id", "earthRegimeBox");
                                break;

                            case "Life": $(".bubbleInfo").attr("id", "lifeRegimeBox");
                                break;

                            case "Pre-history": $(".bubbleInfo").attr("id", "prehistoryRegimeBox");
                                break;

                            case "Humanity": $(".bubbleInfo").attr("id", "humanityRegimeBox");
                                break;
                        }

                        $(".bubbleInfo span").text(this.title);
                        this.panelWidth = $('.bubbleInfo').outerWidth(); // complete width of tooltip panel
                        this.panelHeight = $('.bubbleInfo').outerHeight(); // complete height of tooltip panel  

                        this.tooltipIsShown = true;
                        CZ.Common.animationTooltipRunning = $('.bubbleInfo').fadeIn();
                    }
                }
            };
            this.onmouseunhover = function (pv, e) {
                if (this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id == id) {
                    this.vc.currentlyHoveredTimeline = null;

                    if ((this.tooltipIsShown == true) && (CZ.Common.tooltipMode=="timeline")) {
                        CZ.Common.tooltipMode = "default";
                        CZ.Common.stopAnimationTooltip();
                        $(".bubbleInfo").attr("id", "defaultBox");
                        this.tooltipIsShown = false;    
                    }
                }    

                this.settings.strokeStyle = timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineLineWidth;
                this.settings.gradientFillStyle = false;
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHeaderFontColor;
                this.settings.hoverAnimationDelta = -3 / 60.0;
                this.vc.requestInvalidate();
            };

            //saving render call before overriding it
            this.base_render = this.render;

            /* Renders a timeline.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {

                this.titleObject.initialized = false; //disable CanvasText initialized (rendered) option by default

                if (this.settings.hoverAnimationDelta) {
                    this.settings.gradientOpacity = Math.min(1, Math.max(0, this.settings.gradientOpacity + this.settings.hoverAnimationDelta));
                }

                this.settings.spanGap = this.titleObject.headingWidth;

                //rendering itself
                this.base_render(ctx, visibleBox, viewport2d, size_p, opacity);

                if (this.settings.hoverAnimationDelta) {
                    if (this.settings.gradientOpacity == 0 || this.settings.gradientOpacity == 1)
                        this.settings.hoverAnimationDelta = undefined;
                    else
                        this.vc.requestInvalidate();
                }

                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = { x: p.x + size_p.x, y: p.y + size_p.y };


                if(this.vc.currentlyViewedEvent) {
                    if(this.vc.currentlyViewedEvent.parent.id == this.id)
                    { 
                        if(!this.vc.currentlyViewedEvent.canvasContentItem.isVisible(visibleBox) ||
                            !this.vc.currentlyViewedEvent.canvasContentItem.isActive) {
                            //console.log('current event is not active or visible, hiding');
                            //this.vc.currentlyViewedEvent.canvasContentItem.isActive = false;
                            this.vc.currentlyViewedEvent.hideContentItem();
                            this.vc.currentlyViewedEvent = undefined;
                        }
                    }
                }

                // is center of canvas inside timeline
                var isCenterInside = viewport2d.visible.centerX - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.x + this.width &&
                                     viewport2d.visible.centerX + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.x &&
                                     viewport2d.visible.centerY - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.y + this.height &&
                                     viewport2d.visible.centerY + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.y;

                // is timeline inside "breadcrumb offset box"
                var isVisibleInTheRectangle = ((p.x < CZ.Settings.timelineBreadCrumbBorderOffset && p2.x > viewport2d.width - CZ.Settings.timelineBreadCrumbBorderOffset) ||
                                (p.y < CZ.Settings.timelineBreadCrumbBorderOffset && p2.y > viewport2d.height - CZ.Settings.timelineBreadCrumbBorderOffset));

                if (isVisibleInTheRectangle && isCenterInside) {
                    var length = vc.breadCrumbs.length;
                    if (length > 1)
                        if (vc.breadCrumbs[length - 1].vcElement.parent.id == this.parent.id)
                            return;
                    vc.breadCrumbs.push(
                    {
                        vcElement: this
                    });

                    
                    var centerEvent = this.getClosestTimelineEvent(viewport2d.visible.centerX);
                    
                    if(centerEvent) {
                        if (centerEvent.canvasContentItem.isVisible(visibleBox)) {
                            if(!this.vc.currentlyViewedEvent || this.vc.currentlyViewedEvent.id !== centerEvent.id) {
                                //console.log('there is an active event in the center of the viewport, showing');
                                //centerEvent.canvasContentItem.isActive = true;
                                this.vc.currentlyViewedEvent = centerEvent;
                                centerEvent.showContentItem();
                            }
                            
                        }
                    } else {
                        if(typeof(this.vc.currentlyViewedEvent) !== 'undefined') {
                            if(this.vc.currentlyViewedEvent.parent.id == this.id) {
                                //console.log('no active events, unsetting current item, hiding');
                                //this.vc.currentlyViewedEvent.canvasContentItem.isActive = false;
                                this.vc.currentlyViewedEvent.hideContentItem();
                                this.vc.currentlyViewedEvent = undefined;
                            }
                        }
                        else {
                            $('#info-box').attr('class','info-box-hidden');
                        }
                    }

                }
            };

            this.checkForHoveredEvents = function() {
                return;
            };

            this.prototype = new CanvasTimespan(vc, layerid, id, vx, vy, vw, vh, settings);

        }

        /*  A circle element that can be added to a VirtualCanvas.
        @param layerid   (any type) id of the layer for this element
        @param id        (any type) id of an element
        @param vxc       (number) center x in virtual space
        @param vyc       (number) center y in virtual space
        @param vradius   (number) radius in virtual space
        @param settings  ({strokeStyle,lineWidth,fillStyle}) Parameters of the circle appearance
        @remarks 
        The element is always rendered as a circle and ignores the aspect ratio of the viewport.
        For this, circle radius in pixels is computed from its virtual width.
        */
        function CanvasCircle(vc, layerid, id, vxc, vyc, vradius, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vxc - vradius, vyc - vradius, 2.0 * vradius, 2.0 * vradius);
            this.settings = settings;
            this.isObservedNow = false; //whether the circle is the largest circle under exploration,
                                        //that takes large enough rendering space according to infoDotAxisFreezeThreshold var in settings.js
            this.type = "circle";

            /* Renders a circle.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var rad = this.width / 2.0;
                var xc = this.x + rad;
                var yc = this.y + rad;
                var p = viewport2d.pointVirtualToScreen(xc, yc);
                var radp = viewport2d.widthVirtualToScreen(rad);

                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, radp, 0, Math.PI * 2, true);
                ctx.fillStyle = this.settings.fillStyle;
                ctx.fill();

                if (this.settings.strokeStyle) {
                    ctx.strokeStyle = this.settings.strokeStyle;
                    if (this.settings.lineWidth) {
                        if (this.settings.isLineWidthVirtual) { // in virtual coordinates
                            ctx.lineWidth = viewport2d.widthVirtualToScreen(this.settings.lineWidth);
                        } else {
                            ctx.lineWidth = this.settings.lineWidth; // in pixels
                        }
                    }
                    else ctx.lineWidth = 1;
                    ctx.stroke();
                }
            };

            /* Checks whether the given point (virtual) is inside the object
            (should take into account the shape) */
            this.isInside = function (point_v) {
                var len2 = CZ.Common.sqr(point_v.x - vxc) + CZ.Common.sqr(point_v.y - this.y - this.height / 2);
                return len2 <= vradius * vradius;
            };

            this.prototype = new CanvasElement(vc, layerid, id, vxc - vradius / 2, vyc - vradius / 2, vradius, vradius);
        }

        /*A popup window element
        */
        function addPopupWindow(url, id, width, height, scrollbars, resizable) {
            var w = width;
            var h = height;
            var s = scrollbars;
            var r = resizable;
            var features = 'width=' + w + ',height=' + h + ',scrollbars=' + s + ',resizable=' + r;
            window.open(url, id, features);
        }

        /*
        Draws text by scaling canvas to match fontsize rather than change fontsize.
        This behaviour minimizes text shaking in chrome.
        */
        function drawText(text, ctx, x, y, fontSize, fontName) {
            var br = (<any>$).browser;
            var isIe9 = br.msie && parseInt(br.version, 10) >= 9;

            if (isIe9) {
                ctx.font = fontSize + "pt " + fontName;
                ctx.fillText(text, x, y);
            } else {
                var baseFontSize = 12;
                var targetFontSize = fontSize;
                var s = targetFontSize / baseFontSize;

                ctx.scale(s, s);
                ctx.font = baseFontSize + "pt " + fontName;
                ctx.fillText(text, x / s, y / s);
                ctx.scale(1 / s, 1 / s);
            }
        }

        /*  A text element on a virtual canvas.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param baseline (number) y coordinate of the baseline in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param settings     ({ fillStyle, fontName, textAlign, textBaseLine, wrapText, numberOfLines, adjustWidth }) Parameters of the text appearance
        @param vw (number) optional width of the text; if undefined, it is automatically asigned to width of the given text line.
        @remarks
        Text width is adjusted using measureText() on first render call. 
        If textAlign is center, then width must be provided.
        */
        function CanvasText(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, wv ? wv : 0, vh);  // proper text width will be computed on first render
            this.text = text;
            this.baseline = baseline;
            this.newBaseline = baseline;
            this.settings = settings;
            this.opacity = settings.opacity || 0;
            this.type = "text";

            if (typeof this.settings.textBaseline != 'undefined' && this.settings.textBaseline === 'middle') {
                    this.newBaseline = this.newY + this.newHeight / 2;
            }

            this.initialized = false;
            this.screenFontSize = 0; //not initialized

            /* Renders text.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x, this.newY);
                var bp = viewport2d.pointVirtualToScreen(this.x, this.newBaseline).y;

                ctx.globalAlpha = opacity;
                ctx.fillStyle = this.settings.fillStyle;
                var fontSize = size_p.y;
                var k = 1.5;

                if (this.screenFontSize != fontSize)
                    this.screenFontSize = fontSize;

                // initialization
                if (!this.initialized) {
                    if (this.settings.wrapText) {
                        var numberOfLines = this.settings.numberOfLines ? this.settings.numberOfLines : 1;
                        this.settings.numberOfLines = numberOfLines;
                        fontSize = size_p.y / numberOfLines / k;

                        while (true) { // adjusting font size
                            ctx.font = fontSize + "pt " + this.settings.fontName; // assign it here to measure text in next lines

                            // Splitting the text into lines 
                            var mlines = this.text.split('\n');
                            var textHeight = 0;
                            var lines = [];

                            for (var il = 0; il < mlines.length; il++) {
                                var words = mlines[il].split(' ');
                                var lineWidth = 0;
                                var currentLine = '';
                                var wsize;
                                var space = ctx.measureText(' ').width;
                                for (var iw = 0; iw < words.length; iw++) {
                                    wsize = ctx.measureText(words[iw]);
                                    var newWidth = lineWidth == 0 ? lineWidth + wsize.width : lineWidth + wsize.width + space;
                                    if (newWidth > size_p.x && lineWidth > 0) { // goes out of the limit width
                                        lines.push(currentLine);
                                        lineWidth = 0;
                                        textHeight += fontSize * k;
                                        iw--;
                                        currentLine = '';
                                    } else {
                                        // we're still within the limit
                                        if (currentLine === '') currentLine = words[iw];
                                        else currentLine += ' ' + words[iw];
                                        lineWidth = newWidth;
                                    }
                                }
                                lines.push(currentLine);
                                textHeight += fontSize * k;
                            }

                            if (textHeight > size_p.y) { // we're out of vertical limit
                                fontSize /= 1.5;
                            } else {
                                this.text = lines;
                                var fontSizeVirtual = viewport2d.heightScreenToVirtual(fontSize);
                                this.settings.fontSizeVirtual = fontSizeVirtual;
                                break; // done.
                            }
                        }

                        this.screenFontSize = fontSize; // try to save fontSize

                    } else { // no wrap

                        ctx.font = fontSize + "pt " + this.settings.fontName; // assign it here to measure text in next lines

                        this.screenFontSize = fontSize; // try to save fontSize

                        if (this.width == 0) { // first render call
                            var size = ctx.measureText(this.text);
                            size_p.x = size.width;
                            this.width = viewport2d.widthScreenToVirtual(size.width);
                        } else { // we have width for the text so we adjust font size to fit the text
                            var size = ctx.measureText(this.text);
                            if (size.width > size_p.x) {
                                this.height = this.width * size_p.y / size.width;
                                if (this.settings.textBaseline === 'middle') {
                                    this.newY = this.newBaseline - this.newHeight / 2;
                                }
                                fontSize = viewport2d.heightVirtualToScreen(this.height);

                                this.screenFontSize = fontSize; // try to save fontSize
                            }
                            else if (typeof this.settings.adjustWidth && this.settings.adjustWidth) { // we have to adjust the width of the element to be equal to real text width
                                var nwidth = viewport2d.widthScreenToVirtual(size.width);

                                if (this.settings.textAlign === 'center') {
                                    this.x = this.x + (this.width - nwidth) / 2;
                                } else if (this.settings.textAlign === 'right') {
                                    this.x = this.x + this.width - nwidth;
                                }
                                this.width = nwidth;

                                p = viewport2d.pointVirtualToScreen(this.x, this.newY);
                                size_p.x = viewport2d.widthVirtualToScreen(this.width);
                            }
                        }
                    }
                    this.initialized = true;
                } // eof initialization

                // Rendering text
                if (this.settings.textAlign) {
                    ctx.textAlign = this.settings.textAlign;
                    if (this.settings.textAlign === 'center')
                        p.x = p.x + size_p.x / 2.0;
                    else if (this.settings.textAlign === 'right')
                        p.x = p.x + size_p.x;
                }

                // LANE: overriding font size
                fontSize = 18;

                if (!this.settings.wrapText) {
                    if (this.settings.textBaseline)
                        ctx.textBaseline = this.settings.textBaseline;

                    drawText(this.text, ctx, p.x, bp, fontSize, this.settings.fontName);
                } else { // multiline text
                    fontSize = viewport2d.heightVirtualToScreen(this.settings.fontSizeVirtual);
                    this.screenFontSize = fontSize; // try to save fontSize
                    ctx.textBaseline = 'middle';

                    var bp = p.y + fontSize * k / 2;
                    for (var i = 0; i < this.text.length; i++) {
                        drawText(this.text[i], ctx, p.x, bp, fontSize, this.settings.fontName);
                        bp += fontSize * k;
                    }
                }
            };

            this.isVisible = function (visibleBox_v) {
                var objBottom = this.y + this.height;
                if (this.width > 0) {
                    var objRight = this.x + this.width;
                    return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right) &&
                            Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
                } // else we yet do not know the width, so consider the text as visible if
                return Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, wv ? wv : 0, vh);
        }

        // LANE: Extending CanvasText for headings.
        function CanvasFixedHeading(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv) {
            this.base = CanvasText;
            this.base(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv); 
            this.settings = settings;
            this.text = text;
            this.headingWidth = -1;

            this.isVisible = function (visibleBox_v) {
                // visible timeline width
                var sWidth = vc.viewport.widthVirtualToScreen(Math.min(visibleBox_v.Right,this.settings.timeEnd) - Math.max(visibleBox_v.Left,this.settings.timeStart));
                // todo: have different heading widths per depth
                if (sWidth > this.headingWidth && this.headingWidth > 0) {
                    return (sWidth - this.headingWidth) > 5;
                } // else we yet do not know the width, it needs to render
                else if (this.headingWidth < 0) {
                    return true;
                }
                return false;
            };

            this.render = function(ctx, visibleBox, viewport2d, size_p, opacity) {
                var lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;                
                var tlOffset = (viewport2d.height+lineY);
                var p = viewport2d.pointVirtualToScreen(this.x, this.newY);
                //var bp = viewport2d.pointVirtualToScreen(this.x, this.newBaseline).y;

                fontSize = CZ.Settings.fixedTimelineFontMap[this.settings.depth];
                ctx.font = fontSize + "pt " + CZ.Settings.timelineHeaderFontName; // assign it here to measure text in next lines

                var size = ctx.measureText(this.text);
                this.headingWidth = Math.max(0,size.width);
                size_p.x = size.width;
                this.width = viewport2d.widthScreenToVirtual(size.width);


                var headingOffset = size.width;

                //if(this.settings.timeStart >= visibleBox.Left)

                var screenLeft = viewport2d.pointVirtualToScreen(Math.max(visibleBox.Left,this.settings.timeStart),this.y).x;

                var visibleWidth = 
                    Math.min(visibleBox.Right,this.settings.timeEnd) - Math.max(visibleBox.Left,this.settings.timeStart);

                var visibleScreenWidth = viewport2d.widthVirtualToScreen(visibleWidth);

                var xPos = screenLeft+(visibleScreenWidth-headingOffset)/2;
                

                // LANE: overriding font size
                
                if (this.settings.textBaseline)
                    ctx.textBaseline = this.settings.textBaseline;

                ctx.fillStyle = 'rgba(255,2555,255,1)';

                drawText(this.text, ctx, xPos, tlOffset, fontSize, this.settings.fontName);
            };

            this.prototype = new CanvasText(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv); 
        }

        function CanvasEventHeading(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv) {
            this.base = CanvasFixedHeading;
            this.base(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv); 
            this.settings = settings || {};
            this.settings.opacity = 1;
            this.settings.strokeStyle = 'rgb(255,255,255)';
            this.showHeading = false;

            this.isVisible = function(vbox) {
                return this.showHeading;
            }

            this.isInside = function(vbox) {
                return false;
            };

            this.onmouseclick = function(e) {
                return zoomToElementHandler(this.parent, e, 0.35);
            };

            this.render = function(ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x+this.width/2, this.y);
                //var bp = viewport2d.pointVirtualToScreen(this.x, this.newBaseline).y;
                //var ap = viewport2d.pointVirtualToScreen(this.x, this.y);
                //var ap2 = viewport2d.pointVirtualToScreen(this.x+this.width, this.y+this.height);

                fontSize = CZ.Settings.fixedTimelineFontMap[this.settings.depth];
                ctx.font = fontSize + "pt " + CZ.Settings.timelineHeaderFontName; // assign it here to measure text in next lines

                var size = ctx.measureText(this.text);
                this.headingWidth = Math.max(0,size.width);
                size_p.x = headingOffset = size.width;
                //this.width = viewport2d.widthScreenToVirtual(size.width);

                ctx.globalAlpha = this.settings.opacity;
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.fillRect(p.x-headingOffset/2-20, p.y+115, headingOffset+40, 40);

                ctx.lineWidth = 2; 
                ctx.strokeStyle = this.settings.strokeStyle;
                ctx.strokeRect(p.x-headingOffset/2-20, p.y+115, headingOffset+40, 40);
                
                //ctx.fillRect(ap.x, ap.y, ap2.x-ap.x, ap2.y-ap.y);


                // LANE: overriding font size
                
                if (this.settings.textBaseline)
                    ctx.textBaseline = this.settings.textBaseline;

                ctx.fillStyle = 'rgba(255,255,255,1)';

                drawText(this.text, ctx, p.x-headingOffset/2, p.y+135, fontSize, this.settings.fontName);
            };

            this.prototype = new CanvasText(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv); 

        }

        /*  A multiline text element on a virtual canvas.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vh   (number) height of a text
        @param lineWidth (number) width of a line to text output
        @param settings     ({ fillStyle, fontName }) Parameters of the text appearance
        @remarks
        Text width is adjusted using measureText() on first render call. 
        */
        function CanvasMultiLineTextItem(vc, layerid, id, vx, vy, vh, text, lineWidth, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vh * 10, vh);  // todo: measure properly text width
            this.settings = settings;
            this.text = text;

            this.render = function (ctx, visibleBox, viewport2d, size_p) {
                function textOutput(context, text, x, y, lineHeight, fitWidth) {
                    fitWidth = fitWidth || 0;

                    if (fitWidth <= 0) {
                        context.fillText(text, x, y);
                        return;
                    }
                    var words = text.split(' ');
                    var currentLine = 0;
                    var idx = 1;
                    while (words.length > 0 && idx <= words.length) {
                        var str = words.slice(0, idx).join(' ');
                        var w = context.measureText(str).width;
                        if (w > fitWidth) {
                            if (idx == 1) {
                                idx = 2;
                            }
                            context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));
                            currentLine++;
                            words = words.splice(idx - 1);
                            idx = 1;
                        }
                        else
                        { idx++; }
                    }
                    if (idx > 0)
                        context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
                };


                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                ctx.fillStyle = settings.fillStyle;
                ctx.font = size_p.y + "pt " + settings.fontName;
                ctx.textBaseline = 'top';
                var height = viewport2d.heightVirtualToScreen(this.height);
                textOutput(ctx, this.text, p.x, p.y, height, lineWidth * height);
                // ctx.fillText(this.text, p.x, p.y);
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vh * 10, vh);
        }

        /*  Represents an image on a virtual canvas.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param onload (optional callback function) called when image is loaded
        @remarks 
        optional property onLoad() is called if defined when the image is loaded and the element is completely initialized.
        */
        function CanvasImage(vc, layerid, id, imageSource, vx, vy, vw, vh, onload?) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.onload = onload;

            this.isLoading = true; // I am async
            var img = new Image(); // todo: be aware and do not get circular reference here! 
            this.img = img;
            this.img.isLoaded = false;

            var self = this;
            var onCanvasImageLoad = function (s) { // in FireFox "s" doesn't contain any reference to the image, so we use closure here
                img['isLoading'] = false;
                if (!img['isRemoved']) {
                    // adjusting aspect ratio
                    if (img.naturalHeight) {
                        var ar0 = self.width / self.height;
                        var ar1 = img.naturalWidth / img.naturalHeight;
                        if (ar0 > ar1) {
                            // vh ~ img.height, vw is to be adjusted
                            //var imgWidth = self.height / ar0;
                            var imgWidth = ar1 * self.height;
                            var offset = (self.width - imgWidth) / 2.0;
                            self.x += offset;
                            self.width = imgWidth;
                        } else if (ar0 < ar1) {
                            // vw ~ img.width, vh is to be adjusted
                            var imgHeight = self.width / ar1;
                            var offset = (self.height - imgHeight) / 2.0;
                            self.y += offset;
                            self.height = imgHeight;
                        }
                    }



                    img['isLoaded'] = true;
                    if (self.onLoad) self.onLoad();
                    self.vc.requestInvalidate();
                } else {
                    delete img['isRemoved'];
                    delete img['isLoaded'];
                }
            };
            var onCanvasImageLoadError = function (e) {
                if (!img['isFallback']) {
                    img['isFallback'] = true;
                    img.src = CZ.Settings.fallbackImageUri;
                } else {
                    throw "Cannot load an image!";
                }
            };

            this.img.addEventListener("load", onCanvasImageLoad, false);
            if (onload) this.img.addEventListener("load", onload, false);
            this.img.addEventListener("error", onCanvasImageLoadError, false);
            this.img.src = imageSource; // todo: stop image loading if it is not needed anymore (see http://stackoverflow.com/questions/1339901/stop-loading-of-images-with-javascript-lazyload)

            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                if (!this.img.isLoaded) return;
                var p = viewport2d.pointVirtualToScreen(vx+vw/2, vy+vh/2);
                ctx.globalAlpha = opacity;
                //ctx.drawImage(this.img, p.x, p.y, size_p.x, size_p.y);

                var imageScale = size_p.x / this.img.width;
                var imageStrokeWidth = imageScale * 10;
                var imageStrokeColor = 'white';

                ctx.drawImage(this.img, p.x-size_p.x/2, p.y-size_p.y/2, size_p.x, size_p.y);
                                //ctx.save();
                ctx.beginPath();
                ctx.rect(p.x-size_p.x/2, p.y-size_p.y/2, size_p.x, size_p.y);
                //ctx.arc(p.x + imageWidth/2 + circleRadius, p.y + circleRadius, circleRadius, 0, Math.PI * 2, true);
                //ctx.clip();
                //ctx.drawImage(this.img, p.x, p.y, imageWidth, imageHeight);
                //ctx.restore();
                ctx.lineWidth = imageStrokeWidth;
                ctx.strokeStyle = imageStrokeColor;
                ctx.stroke();
            };
            this.onRemove = function () {
                this.img.removeEventListener("load", onCanvasImageLoad, false);
                this.img.removeEventListener("error", onCanvasImageLoadError, false);
                if (this.onload) this.img.removeEventListener("load", this.onload, false);
                this.img.isRemoved = true;
                delete this.img;
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }

        function CanvasBorderImage(vc, layerid, id, imageSource, vx, vy, vw, vh, onload?) {
            this.base = CanvasImage;
            this.base(vc, layerid, id, imageSource, vx, vy, vw, vh, onload);
        
            // save image load
            this.base_onCanvasImageLoad = this.onCanvasImageLoad
            var self = this;

            var onCanvasImageLoad = function (s) { // in FireFox "s" doesn't contain any reference to the image, so we use closure here
                //this.base_onCanvasImageLoad(s);


            this.prototype = new CanvasImage(vc, layerid, id, imageSource, vx, vy, vw, vh, onload);
        }

        /*  Represents an image on a virtual canvas with support of dynamic level of detail.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param imageSources   [{ zoomLevel, imageSource }] Ordered array of image sources for different zoom levels
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param onload (optional callback function) called when image is loaded
        */
        function CanvasLODImage(vc, layerid, id, imageSources, vx, vy, vw, vh, onload) {
            this.base = CanvasDynamicLOD;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.imageSources = imageSources;

            this.changeZoomLevel = function (currentZoomLevel, newZoomLevel) {
                var n = this.imageSources.length;
                if (n == 0) return null;
                for (; --n >= 0; ) {
                    if (this.imageSources[n].zoomLevel <= newZoomLevel) {
                        if (this.imageSources[n].zoomLevel === currentZoomLevel) return null; // we found the same level as we already have
                        return {
                            zoomLevel: this.imageSources[n].zoomLevel,
                            content: new CanvasImage(vc, layerid, id + "@" + this.imageSources[n].zoomLevel, this.imageSources[n].imageSource, vx, vy, vw, vh, onload)
                        };
                    }
                }
                return null;
            }

            this.prototype = new CanvasDynamicLOD(vc, layerid, id, vx, vy, vw, vh);
        }

        /* A canvas element which can host any of HTML elements.
        @param vc        (jquery to virtual canvas) note that vc.element[0] is the virtual canvas object
        @param layerid   (any type) id of the layer for this element
        @param id        (any type) id of an element
        @param vx        (number)   x of left top corner in virtual space
        @param vy        (number)   y of left top corner in virtual space
        @param vw        (number)   width of in virtual space
        @param vh        (number)   height of in virtual space
        @param z         (number) z-index
        */
        function CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);

            /* Initializes content of the CanvasDomItem.
            @param content          HTML element to add to virtual canvas
            @remarks The method assigns this.content property and sets up the styles of the content. */
            this.initializeContent = function (content) {
                this.content = content; // todo: ref to DOM potentially causes memory leak.
                if (content) {
                    content.style.position = 'absolute';
                    content.style.overflow = 'hidden';
                    content.style.zIndex = z;
                }
            }

            /* This function is called when isRendered changes, i.e. when we stop or start render this element. */
            this.onIsRenderedChanged = function () {
                if (!this.content) return;

                if (this.isRendered) { /* If we start render it, we add the content element to the tree to make it visible */
                    if (!this.content.isAdded) {
                        this.vc.element[0].appendChild(this.content);
                        this.content.isAdded = true;
                    }
                    this.content.style.display = 'block';
                }
                else {
                    /* If we stop render it, we make it invisible */
                    this.content.style.display = 'none';
                }
            };
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                if (!this.content) return;
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                // p.x = p.x + 8; p.y = p.y + 8; // todo: properly position relative to VC and remove this offset

                //Define screen rectangle
                var screenTop = 0;
                var screenBottom = viewport2d.height;
                var screenLeft = 0;
                var screenRight = viewport2d.width;

                //Define clip rectangle. By defautlt, video is not clipped. If video element crawls from screen rect, clip it
                var clipRectTop = 0, clipRectLeft = 0, clipRectBottom = size_p.y, clipRectRight = size_p.x;

                //Vertical intersection ([a1,a2] are screen top and bottom, [b1,b2] are iframe top and bottom)
                var a1 = screenTop; var a2 = screenBottom;
                var b1 = p.y; var b2 = p.y + size_p.y;
                var c1 = Math.max(a1, b1); var c2 = Math.min(a2, b2); //[c1,c2] is intersection        
                if (c1 <= c2) { //clip, if [c1,c2] is not empty (if c1<=c2)
                    clipRectTop = c1 - p.y;
                    clipRectBottom = c2 - p.y;
                }

                //Horizontal intersection ([a1,a2] are screen left and right, [b1,b2] are iframe left and right)
                a1 = screenLeft; a2 = screenRight;
                b1 = p.x; b2 = p.x + size_p.x;
                c1 = Math.max(a1, b1); c2 = Math.min(a2, b2); //[c1,c2] is intersection        
                if (c1 <= c2) { //clip, if [c1,c2] is not empty (if c1<=c2)
                    clipRectLeft = c1 - p.x;
                    clipRectRight = c2 - p.x;
                }

                //Finally, reset iframe style.
                this.content.style.left = p.x + 'px';
                this.content.style.top = p.y + 'px';
                this.content.style.width = size_p.x + 'px';
                this.content.style.height = size_p.y + 'px';
                this.content.style.clip = 'rect(' + clipRectTop + 'px,' + clipRectRight + 'px,' + clipRectBottom + 'px,' + clipRectLeft + 'px)';
                this.content.style.opacity = opacity;
                this.content.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
            };

            /* The functions is called when the canvas element is removed from the elements tree */
            this.onRemove = function () {
                if (!this.content) return;
                try {
                    if (this.content.isAdded) {
                        if (this.content.src) this.content.src = ""; // Stop loading content
                        this.vc.element[0].removeChild(this.content);
                        this.content.isAdded = false;
                    }
                } catch (ex) {
                    alert(ex.Description);
                }
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }

        /*Represents Text block with scroll*/
        /*  Represents an image on a virtual canvas.
        @param videoSrc     video source
        @param vx           x of left top corner in virtual space
        @param vy           y of left top corner in virtual space
        @param vw           width of in virtual space
        @param vh           height of in virtual space
        @param z            z-index
        @param settings     Parameters of the appearance
        */
        function CanvasScrollTextItem(vc, layerid, id, vx, vy, vw, vh, text, z) {
            this.base = CanvasDomItem;
            this.base(vc, layerid, id, vx, vy, vw, vh, z);

            //Creating content element
            //Our text will be drawn on div

            //To enable overflow:auto effect in IE, we have to use position:relative
            //But in vccontent we use position:absolute
            //So, we create "wrapping" div elemWrap, with position:absolute
            //Inside elemWrap, create child div with position:relative
            var elem = $("<div></div>", {
                id: "citext_" + id,
                class: "contentItemDescription"
            }).appendTo(vc);
            
            elem[0].addEventListener("mousemove", CZ.Common.preventbubble, false);
            elem[0].addEventListener("mousedown", CZ.Common.preventbubble, false);
            elem[0].addEventListener("DOMMouseScroll", CZ.Common.preventbubble, false);
            elem[0].addEventListener("mousewheel", CZ.Common.preventbubble, false);
            var textElem = $("<div style='position:relative' class='text'></div>");
            textElem.text(text).appendTo(elem);

            //Initialize content
            this.initializeContent(elem[0]);

            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                //Scale new font size
                var fontSize = size_p.y / CZ.Settings.contentItemDescriptionNumberOfLines;
                elem.css('font-size', fontSize + "px");

                this.prototype.render.call(this, ctx, visibleBox, viewport2d, size_p, opacity);
            }

            this.onRemove = function () {
                this.prototype.onRemove.call(this);
                elem[0].removeEventListener("mousemove", CZ.Common.preventbubble, false);
                elem[0].removeEventListener("mouseup", CZ.Common.preventbubble, false);
                elem[0].removeEventListener("mousedown", CZ.Common.preventbubble, false);
                elem[0].removeEventListener("DOMMouseScroll", CZ.Common.preventbubble, false);
                elem[0].removeEventListener("mousewheel", CZ.Common.preventbubble, false);
                elem = undefined;
            }

            this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
        }

        /*Represents PDF element
        @param pdfSrc     pdf source
        @param vx           x of left top corner in virtual space
        @param vy           y of left top corner in virtual space
        @param vw           width of in virtual space
        @param vh           height of in virtual space
        @param z            z-index
        */
        function CanvasPdfItem(vc, layerid, id, pdfSrc, vx, vy, vw, vh, z) {
            this.base = CanvasDomItem;
            this.base(vc, layerid, id, vx, vy, vw, vh, z);

            var elem = document.createElement('iframe');
            elem.setAttribute("id", id);
            if (pdfSrc.indexOf('?') == -1)
                pdfSrc += '?wmode=opaque';
            else
                pdfSrc += '&wmode=opaque';
            elem.setAttribute("src", pdfSrc);
            elem.setAttribute("visible", 'true');
            elem.setAttribute("controls", 'true');

            this.initializeContent(elem);

            this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
        }

        /*Represents video element
        @param videoSrc     video source
        @param vx           x of left top corner in virtual space
        @param vy           y of left top corner in virtual space
        @param vw           width of in virtual space
        @param vh           height of in virtual space
        @param z            z-index
        */
        function CanvasVideoItem(vc, layerid, id, videoSrc, vx, vy, vw, vh, z) {
            this.base = CanvasDomItem;
            this.base(vc, layerid, id, vx, vy, vw, vh, z);

            var elem = document.createElement('iframe');
            elem.setAttribute("id", id);
            if (videoSrc.indexOf('?') == -1)
                videoSrc += '?wmode=opaque';
            else
                videoSrc += '&wmode=opaque';
            elem.setAttribute("src", videoSrc);
            elem.setAttribute("visible", 'true');
            elem.setAttribute("controls", 'true');

            this.initializeContent(elem);

            this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
        }

        /*Represents Audio element*/
        /*  Represents an image on a virtual canvas.
        @param audioSrc     audio source
        @param vx           x of left top corner in virtual space
        @param vy           y of left top corner in virtual space
        @param vw           width of in virtual space
        @param vh           height of in virtual space
        @param z            z-index
        @param settings     Parameters of the appearance
        */
        function CanvasAudioItem(vc, layerid, id, audioSrc, vx, vy, vw, vh, z) {
            this.base = CanvasDomItem;
            this.base(vc, layerid, id, vx, vy, vw, vh, z);

            var elem = document.createElement('audio');
            elem.setAttribute("id", id);
            elem.setAttribute("src", audioSrc);
            elem.setAttribute("visible", 'true');
            elem.setAttribute("controls", 'true');
            this.initializeContent(elem);

            this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
        }

        /*Represents a Seadragon based image
        @param imageSource  image source
        @param vx           x of left top corner in virtual space
        @param vy           y of left top corner in virtual space
        @param vw           width of in virtual space
        @param vh           height of in virtual space
        @param z            z-index
        @param onload       (optional callback function) called when image is loaded
        @oaram parent       parent element, whose child is to be seadragon image.
        */
        function SeadragonImage(vc, parent, layerid, id, imageSource, vx, vy, vw, vh, z, onload) {
            var self = this;
            this.base = CanvasDomItem;
            this.base(vc, layerid, id, vx, vy, vw, vh, z);
            this.onload = onload;
            this.nAttempts = 0;
            this.timeoutHandles = [];

            var container = document.createElement('div');
            container.setAttribute("id", id);
            container.setAttribute("style", "color: white"); // color to use for displaying messages
            this.initializeContent(container);

            this.viewer = new Seadragon.Viewer(container);
            this.viewer.elmt.addEventListener("mousemove", CZ.Common.preventbubble, false);
            this.viewer.elmt.addEventListener("mousedown", CZ.Common.preventbubble, false);
            this.viewer.elmt.addEventListener("DOMMouseScroll", CZ.Common.preventbubble, false);
            this.viewer.elmt.addEventListener("mousewheel", CZ.Common.preventbubble, false);

            this.viewer.addEventListener("open", function (e) {
                if (self.onload) self.onload();
                self.vc.requestInvalidate();
            });

            this.viewer.addEventListener("resize", function (e) {
                self.viewer.setDashboardEnabled(e.elmt.clientWidth > 250);
            });

            this.onSuccess = function (resp) {
                if (resp.error) {
                    // the URL is malformed or the service is down
                    self.showFallbackImage();
                    return;
                }

                var content = resp.content;
                if (content.ready) {
                    for (var i = 0; i < self.timeoutHandles.length; i++)
                        clearTimeout(self.timeoutHandles[i]);

                    self.viewer.openDzi(content.dzi);
                } else if (content.failed) {
                    self.showFallbackImage();
                } else { // conversion to dzi (deepzoom image format) is in progress
                    if (self.nAttempts < CZ.Settings.seadragonMaxConnectionAttempts) {
                        self.viewer.showMessage("Loading " + Math.round(100 * content.progress) + "% done.");
                        self.timeoutHandles.push(setTimeout(self.requestDZI, CZ.Settings.seadragonRetryInterval)); // retry
                    } else {
                        self.showFallbackImage();
                    }
                }
            }

            this.onError = function () {
                // ajax query failed
                if (self.nAttempts < CZ.Settings.seadragonMaxConnectionAttempts) {
                    self.timeoutHandles.push(setTimeout(self.requestDZI, CZ.Settings.seadragonRetryInterval)); // retry
                } else {
                    self.showFallbackImage();
                }
            }

            this.requestDZI = function () {
                self.nAttempts++;
                $.ajax({
                    url: CZ.Settings.seadragonServiceURL + encodeURIComponent(imageSource),
                    dataType: "jsonp",
                    success: self.onSuccess,
                    error: self.onError
                });
            }

            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                if (self.viewer.isFullPage())
                    return;

                this.prototype.render.call(this, ctx, visibleBox, viewport2d, size_p, opacity);
                if (self.viewer.viewport) {
                    self.viewer.viewport.resize({ x: size_p.x, y: size_p.y });
                    self.viewer.viewport.update();
                }
            }

            this.onRemove = function () {
                self.viewer.close(); // closes any open content
                this.prototype.onRemove.call(this);
            }

            this.showFallbackImage = function () {
                for (var i = 0; i < self.timeoutHandles.length; i++)
                    clearTimeout(self.timeoutHandles[i]);

                self.onRemove(); // removes the dom element
                removeChild(parent, self.id); // removes the cur seadragon object from the scene graph
                addImage(parent, layerid, id, vx, vy, vw, vh, imageSource);
            }

            // run
            self.requestDZI();

            this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
        } }

        /*******************************************************************************************************/
        /* Timelines                                                                                           */
        /*******************************************************************************************************/
        /* Adds a timeline composite element into a virtual canvas.
        @param element   (CanvasElement) Parent element, whose children is to be new timeline.
        @param layerid   (any type) id of the layer for this element
        @param id        (any type) id of an element
        @param timelineinfo  ({ timeStart (minus number of years BP), timeEnd (minus number of years BP), top (number), height (number),
        header (string), fillStyle (color) })
        @returns         root of the timeline tree
        */
        export function addTimeline(element, layerid, id, timelineinfo) {
            var width = timelineinfo.timeEnd - timelineinfo.timeStart;
            var timeline = addChild(element, new CanvasFixedTimeline(element.vc, layerid, id,
                                    timelineinfo.timeStart, timelineinfo.top,
                                    width, timelineinfo.height, {
                                        strokeStyle: timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineStrokeStyle,
                                        lineWidth: CZ.Settings.timelineLineWidth,
                                        depth: timelineinfo.depth,
                                        fillStyle: timelineinfo.fillStyle,
                                        opacity: typeof timelineinfo.opacity !== 'undefined' ? timelineinfo.opacity : 1
                                    }, timelineinfo), true);
            return timeline;
        }

        /*******************************************************************************************************/
        /* Infodots & content items                                                                            */
        /*******************************************************************************************************/
        /*  Represents an image on a virtual canvas with support of dynamic level of detail.
        @param layerid   (any type) id of the layer for this element
        @param id   (any type) id of an element
        @param vx   (number) x of left top corner in virtual space
        @param vy   (number) y of left top corner in virtual space
        @param vw   (number) width of a bounding box in virtual space
        @param vh   (number) height of a bounding box in virtual space
        @param contentItem ({ id, guid, date (string), title (string), description (string), mediaUrl (string), mediaType (string) }) describes content of this content item
        @remarks Supported media types (contentItem.mediaType) are:
        - image
        - video
        - audio
        - pdf
        */
        function ContentItem(vc, layerid, id, vx, vy, vw, vh, contentItem) {
            this.base = CanvasDynamicLOD;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.guid = contentItem.id;
            this.type = 'contentItem';
            this.contentItem = contentItem;

            //console.log(contentItem.date);

            // Building content of the item
            var titleHeight = vh * CZ.Settings.contentItemTopTitleHeight * 0.8;
            var mediaHeight = vh * CZ.Settings.contentItemMediaHeight;
            var descrHeight = CZ.Settings.contentItemFontHeight * vh;

            var contentWidth = vw * CZ.Settings.contentItemContentWidth;
            var leftOffset = (vw - contentWidth) / 2.0;
            var verticalMargin = vh * CZ.Settings.contentItemVerticalMargin;

            var mediaTop = vy + verticalMargin;  //vy + titleHeight + 2 * verticalMargin;
            var sourceVertMargin = verticalMargin * 0.4;
            var sourceTop = mediaTop + mediaHeight + sourceVertMargin;
            var sourceRight = vx + vw - leftOffset;
            var sourceHeight = vh * CZ.Settings.contentItemSourceHeight * 0.8;
            var titleTop = sourceTop + verticalMargin + sourceHeight;

            this.reactsOnMouse = true;

            this.isVisible = function (visibleBox_v) {
                var objRight = this.x + this.width;
                var objBottom = this.y + this.height;
                return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right) &&
                            Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
            };

            this.onmouseenter = function (e) {
                //rect.settings.strokeStyle = CZ.Settings.contentItemBoundingHoveredBoxBorderColor;
                this.vc.currentlyHoveredContentItem = this;
                this.vc.requestInvalidate();
            };

            this.onmouseleave = function (e) {
                //rect.settings.strokeStyle = CZ.Settings.contentItemBoundingBoxBorderColor;
                this.vc.currentlyHoveredContentItem = null;
                this.isMouseIn = false;
                this.vc.requestInvalidate();
            };
            this.onmouseclick = function (e) {
                return zoomToElementHandler(this, e, 0.35);
            };

            var self = this;
            this.changeZoomLevel = function (curZl, newZl) {
                var vy = self.newY;
                var mediaTop = vy + verticalMargin;
                var sourceTop = mediaTop + mediaHeight + sourceVertMargin;
                var titleTop = mediaTop;

                if (newZl >= CZ.Settings.contentItemShowContentZoomLevel) { // building content for an infodot
                    if (curZl >= CZ.Settings.contentItemShowContentZoomLevel) return null;


                    var container = new ContainerElement(vc, layerid, id + "__content", vx, vy, vw, vh);

                    // Media
                    var mediaID = id + "__media__";
                    var imageElem = null;
                    if (this.contentItem.mediaType.toLowerCase() === 'image' || this.contentItem.mediaType.toLowerCase() === 'picture') {
                        imageElem = addImage(container, layerid, mediaID, vx+vw/4, vy+vh/4, vw/2, vh/2, CZ.Settings.eventImageBasePath+CZ.Settings.eventFullResFolder+this.contentItem.uri+'_FullRes.jpg');
                    }
                    else if (this.contentItem.mediaType.toLowerCase() === 'deepimage') {
                        imageElem = addSeadragonImage(container, layerid, mediaID, vx-vw/4, vy, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex, this.contentItem.uri);
                    } else if (this.contentItem.mediaType.toLowerCase() === 'video') {
                        addVideo(container, layerid, mediaID, this.contentItem.uri, vx + leftOffset, mediaTop, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex);
                    }
                    else if (this.contentItem.mediaType.toLowerCase() === 'audio') {
                        mediaTop += CZ.Settings.contentItemAudioTopMargin * vh;
                        mediaHeight = vh * CZ.Settings.contentItemAudioHeight;
                        addAudio(container, layerid, mediaID, this.contentItem.uri, vx + leftOffset, mediaTop, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex);
                    }
                    else if (this.contentItem.mediaType.toLowerCase() === 'pdf') {
                        addPdf(container, layerid, mediaID, this.contentItem.uri, vx + leftOffset, mediaTop, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex);
                    }

                    this.isActive = true;



                    /* Maybe display this in a dom element? 
                    // Title                    
                    var titleText = this.contentItem.title;
                    addText(container, layerid, id + "__title__", vx + vw/100, titleTop, titleTop + titleHeight / 2.0,
                            0.9 * titleHeight, titleText, {
                                fontName: CZ.Settings.contentItemHeaderFontName,
                                fillStyle: CZ.Settings.contentItemHeaderFontColor,
                                textBaseline: 'middle',
                                textAlign: 'left',
                                opacity: 1,
                                wrapText: true,
                                numberOfLines: 1
                            },
                            contentWidth);

                    // Description
                    var descrTop = titleTop + titleHeight + verticalMargin;
                    var descr = addScrollText(container, layerid, id + "__description__", vx + vw/100, descrTop,
                                    contentWidth/3,
                                    descrHeight,
                                    this.contentItem.description, 30,
                                    {});
                    */


                    return {
                        zoomLevel: CZ.Settings.contentItemShowContentZoomLevel,
                        content: container
                    };
                } else { // building thumbnails

                    this.isActive = false;

                    /*
                    var zl = newZl;
                    if (zl >= CZ.Settings.contentItemThumbnailMaxLevel) {
                        if (curZl >= CZ.Settings.contentItemThumbnailMaxLevel && curZl < CZ.Settings.contentItemShowContentZoomLevel)
                            return null; // we already show this level
                        zl = CZ.Settings.contentItemThumbnailMaxLevel;
                    }
                    else if (zl <= CZ.Settings.contentItemThumbnailMinLevel) {
                        if (curZl <= CZ.Settings.contentItemThumbnailMinLevel && curZl > 0) return null;
                        zl = CZ.Settings.contentItemThumbnailMinLevel;
                    }
                    var sz = 1 << zl;
                    var thumbnailUri = CZ.Settings.contentItemImageBaseUri + 'thumbs/' + contentItem.guid + '.jpg';

                    

                    addImage(container, layerid, id + "@" + 1, vx, vy, vw, vh, thumbnailUri);

                    */
                    var container = new ContainerElement(vc, layerid, id + "__content", vx, vy, vw, vh);
                    // Title       
                    /*             
                    var titleText = this.contentItem.title;
                    addText(container, layerid, id + "__title__", vx + vw/100, titleTop, titleTop + titleHeight / 2.0,
                            0.9 * titleHeight, titleText, {
                                fontName: CZ.Settings.contentItemHeaderFontName,
                                fillStyle: CZ.Settings.contentItemHeaderFontColor,
                                textBaseline: 'middle',
                                textAlign: 'left',
                                opacity: 1,
                                wrapText: true,
                                numberOfLines: 1
                            },
                            contentWidth);
                    */

                    return {
                        zoomLevel: newZl,
                        content: container
                    };
                }
            };

            this.prototype = new CanvasDynamicLOD(vc, layerid, id, vx, vy, vw, vh);
        }

        /* Simplified Infodot */
        function CanvasEvent(vc, layerid, id, vx, vy, vw, contentItems, infodotDescription) {
            var vh = vw;
            var time = vx;
            var vp2d = vc.viewport;
            this.actualWidth = 1;
            this.actualY = 1;
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.y = vp2d.heightScreenToVirtual(vp2d.eventRegion/2);
            this.guid = infodotDescription.guid;
            this.type = 'infodot';
            //this.fadeIn = true;
            this.isBuffered = infodotDescription.isBuffered;
            this.contentItem = contentItems[0];
            this.hasContentItems = false;
            this.infodotDescription = infodotDescription;
            this.title = infodotDescription.title;
            this.recentlyActive = false;


            this.titleObject = addEventHeading(this, layerid, id + "__title__", vx, vy+vh/2, vy+vh/2, vh,
                this.contentItem.title, {
                    fontName: CZ.Settings.timelineHeaderFontName,
                    fillStyle: CZ.Settings.timelineHeaderFontColor,
                    textBaseline: 'middle',
                    depth: 5,
                    timeStart: vx,
                    timeEnd: vx+vw
            },vw);

            //this.opacity = typeof infodotDescription.opacity !== 'undefined' ? infodotDescription.opacity : 1;
            this.settings = {
                strokeStyle : CZ.Settings.infoDotBorderColor,
                opacity: 1
            };
            this.screenDimensions = null;

            this.reactsOnMouse = true;

            this.tooltipEnabled = true; // indicates whether tooltip is enabled for this infodot at this moment or not
            this.tooltipIsShown = false; // indicates whether tooltip is shown or not

            this.isLoading = true; // I am async
            var img = new Image(); // todo: be aware and do not get circular reference here! 
            this.img = img;
            this.img.isLoaded = false;

            var self = this;
            var onCanvasImageLoad = function (s) { // in FireFox "s" doesn't contain any reference to the image, so we use closure here
                img['isLoading'] = false;
                if (!img['isRemoved']) {
                    // adjusting aspect ratio
                    if (img.naturalHeight) {
                        var ar0 = self.width / self.height;
                        var ar1 = img.naturalWidth / img.naturalHeight;
                        if (ar0 > ar1) {
                            // vh ~ img.height, vw is to be adjusted
                            var imgWidth = self.height / ar0;
                            var offset = (self.width - imgWidth) / 2.0;
                            self.x += offset;
                            self.width = imgWidth;
                        } else if (ar0 < ar1) {
                            // vw ~ img.width, vh is to be adjusted
                            var imgHeight = self.width / ar1;
                            var offset = (self.height - imgHeight) / 2.0;
                            self.y += offset;
                            self.height = imgHeight;
                        }
                    }



                    img['isLoaded'] = true;
                    if (self.onLoad) self.onLoad();
                    self.vc.requestInvalidate();
                } else {
                    delete img['isRemoved'];
                    delete img['isLoaded'];
                }
            };
            var onCanvasImageLoadError = function (e) {
                if (!img['isFallback']) {
                    img['isFallback'] = true;
                    img.src = CZ.Settings.fallbackImageUri;
                } else {
                    throw "Cannot load an image!";
                }
            };

            this.img.addEventListener("load", onCanvasImageLoad, false);
            if (onload) this.img.addEventListener("load", onload, false);
            this.img.addEventListener("error", onCanvasImageLoadError, false);
            //this.img.src = 'http://d101.loc/Events/1_moon-formation_thumb.jpg'; // todo: stop image loading if it is not needed anymore (see http://stackoverflow.com/questions/1339901/stop-loading-of-images-with-javascript-lazyload)
            this.img.src = CZ.Settings.eventImageBasePath+CZ.Settings.eventThumbnailFolder+this.contentItem.uri+'_thumb.jpg';

            /* Checks whether the given point (virtual) is inside the object
            (should take into account the shape) */
            this.isInside = function (point_v) {
                if(this.screenDimensions === null) {
                    return false;
                }
                    
                var vp2d = vc.viewport;
                var screenPoint = vp2d.pointVirtualToScreen(point_v.x, point_v.y);
                var len2 = CZ.Common.sqr(screenPoint.x - (this.screenDimensions.centerX)) + CZ.Common.sqr(screenPoint.y - this.screenDimensions.centerY);
                return len2 <= this.screenDimensions.radius * this.screenDimensions.radius;
            };

            this.onmousehover = function (pv, e) {
                if(typeof(this.vc.currentlyHoveredInfodot) === 'undefined')
                {
                    this.vc.currentlyHoveredInfodot = this;
                    this.vc.requestInvalidate();
                }
            };

            this.onmouseclick = function (e) {
                // LANE: quick fix for overlapping dots
                if(typeof(this.vc.currentlyHoveredInfodot) === 'undefined')
                    return zoomToElementHandler(this.canvasContentItem, e, 0.35); // TODO: assuming content item is in position 1, fix this to nake sure it is the right child
                else
                    return zoomToElementHandler(this.vc.currentlyHoveredInfodot.canvasContentItem, e, 0.35);
            };

            this.onmouseenter = function (e) {
                //console.log('entering infodot:');
                //console.log(this.vc.currentlyHoveredInfodot);
                this.isMouseIn = true;
                var visibleV = {
                    Left: this.x,
                    Right: this.x+this.width,
                    Top: this.y,
                    Bottom: this.y+this.height
                };
                if(this.titleObject.isVisible(visibleV)) {
                    this.tooltipEnabled = false
                } else {
                    this.tooltipEnabled = true;
                }

                if(typeof(this.vc.currentlyHoveredInfodot) === 'undefined' ) {
                    this.vc.requestInvalidate();
                    // clear tooltipIsShown flag for currently hovered timeline
                    // it can be null because of mouse events sequence: mouseenter for infodot -> mousehover for timeline -> mouseunhover for timeline 
                    if (this.vc.currentlyHoveredTimeline != null) {
                        // stop active tooltip fadein animation and hide tooltip
                        CZ.Common.stopAnimationTooltip();
                        this.vc.currentlyHoveredTimeline.tooltipIsShown = false;
                    }

                    $(".bubbleInfo span").text(infodotDescription.title);
                    this.panelWidth = $('.bubbleInfo').outerWidth(); // complete width of tooltip panel
                    this.panelHeight = $('.bubbleInfo').outerHeight(); // complete height of tooltip panel        

                    CZ.Common.tooltipMode = "infodot"; //set tooltip mode to infodot

                    // start tooltip fadein animation for this infodot
                    if ((this.tooltipEnabled == true)) {
                        this.tooltipIsShown = true;
                        $(".bubbleInfo").attr("id", "defaultBox");
                        CZ.Common.animationTooltipRunning = $('.bubbleInfo').fadeIn();
                    }

                    this.vc.cursorPosition = vx+vw/2;
                    this.vc.currentlyHoveredInfodot = this;

                    // make sure we don't add the hovered event more than once
                    var count = 0;
                    for(var i = 0; i < this.parent.children.length; i++) {
                        if(this.id == this.parent.children[i].id) {
                            count++;
                        }
                    }
                    if(count < 2)
                        this.parent.children.push(this);

                    this.vc._setConstraintsByInfodotHover(this);
                    this.vc.RaiseCursorChanged();
                }
                
            };

            //this.onmousemove =function(e) {
            //    console.log(this.title);
            //};

            this.onmouseleave = function (e) {
                //console.log('leaving infodot:');
                //console.log(this.vc.currentlyHoveredInfodot);

                this.isMouseIn = false;

                var otherHoveredInfoDot;

                if(this.vc.currentlyHoveredInfodot && this.vc.currentlyHoveredInfodot.id == this.id) {
                    var count = 0;
                    var indexMatch;
                    for(var i = 0; i < this.parent.children.length; i++) {
                        if(this.id == this.parent.children[i].id) {
                            count++;
                            indexMatch = i;
                        }
                    }
                    if(count > 1)
                        this.parent.children.splice(indexMatch,1);
                    //console.log('popping infodot:');
                    //console.log(tmpd);
                    for(var i = 0; i < this.parent.children.length; i++) {
                        if(this.parent.children[i].type == 'infodot' && this.parent.children[i].isMouseIn) {
                            otherHoveredInfoDot = this.parent.children[i];
                            break;
                        }   
                    }
                }
                    

                this.settings.strokeStyle = CZ.Settings.infoDotBorderColor;
                this.settings.lineWidth = CZ.Settings.infoDotBorderWidth;

                this.vc.requestInvalidate();

                // stop active fadein animation and hide tooltip
                //if (this.tooltipIsShown == true) 
                    //CZ.Common.stopAnimationTooltip();

                this.tooltipIsShown = false;
                CZ.Common.tooltipMode = "default";

                this.vc.currentlyHoveredInfodot = undefined;
                this.vc._setConstraintsByInfodotHover(undefined);
                //this.parent.checkForHoveredEvents();

                if(otherHoveredInfoDot)
                    otherHoveredInfoDot.onmouseenter();

                this.vc.RaiseCursorChanged();
            };

            this.checkIfHovered = function() {
                try {
                    if(this.vc.currentlyHoveredInfodot.id == this.id) {
                        this.settings.strokeStyle = this.titleObject.settings.strokeStyle = CZ.Settings.infoDotHoveredBorderColor;
                        this.settings.opacity = this.titleObject.settings.opacity = this.newOpacity = 1;
                    }
                    else
                    {
                        this.settings.opacity = this.titleObject.settings.opacity = this.newOpacity = 0.1;
                    }
                }
                catch (ex) {
                    this.settings.strokeStyle = this.titleObject.settings.strokeStyle = CZ.Settings.infoDotBorderColor;
                    this.settings.opacity = this.titleObject.settings.opacity = this.newOpacity = 1;
                }
            };

            //Bibliography flag accroding to BUG 215750
            var bibliographyFlag = true;

            var self = this;
            
            this.canvasContentItem = addChild(this, new ContentItem(vc, layerid, this.contentItem.id, vx+vw/2-vw/30, vy+vw/2-vw/30, vw/15, vw/15, this.contentItem),false);

            this.isVisible = function(visibleBox_v) {
                var visVal = false;
                if(CZ.Viewport.allowVerticalPan) {
                    visVal = this.x < visibleBox_v.Left && this.x+this.width > visibleBox_v.Right;
                } else {          
                    //var objRight = this.x + this.width;
                    //var objBottom = this.y + this.height;
                    var vp2d = vc.viewport;
                    var actualWidth = this.width;
                    if(vp2d.widthVirtualToScreen(this.width) > CZ.Settings.fixedTimelineEventWidth) {
                        actualWidth = vp2d.widthScreenToVirtual(CZ.Settings.fixedTimelineEventWidth);
                    }
                    var middle = this.x+this.width/2;
                    //var visVal = middle+actualWidth/2 > visibleBox_v.Left && middle-actualWidth/2 < visibleBox_v.Right;
                    visVal = middle > visibleBox_v.Left && middle < visibleBox_v.Right;
                }
                if(!visVal) {
                    this.screenDimensions = null;
                }
                    

                return visVal;
            };

            /* Renders an infodot.
            @param ctx              (context2d) Canvas context2d to render on.
            @param visibleBox_v     ({Left,Right,Top,Bottom}) describes visible region in the virtual space
            @param viewport2d       (Viewport2d) current viewport
            @param size_p           ({x,y}) size of bounding box of this element in pixels
            @remarks The method is implemented for each particular VirtualCanvas element.
            */
            
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height);
                var scrHeight = viewport2d.heightVirtualToScreen(this.height);
                var left = Math.max(0, p.x);
                var top = Math.max(0, p.y);
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);
                var middle = p.x + (p2.x-p.x)/2; 

                this.checkIfHovered();

                var eventRegion = {
                    top:0,
                    left:0,
                    width: viewport2d.width,
                    height: (viewport2d.height-CZ.Settings.fixedTimelineAreaHeight)
                };

                var maxWidth = Math.min(eventRegion.height,CZ.Settings.fixedTimelineEventWidth); // radius of circle

                if((right-left) > maxWidth)
                {
                    left = middle - maxWidth/2;
                    right = middle + maxWidth/2;
                    this.titleObject.showHeading = true;
                }
                else {
                    this.titleObject.showHeading = false;
                }

                this.screenDimensions = {
                    centerX: left+(right-left)/2,
                    centerY: p.y+(p2.y-p.y)/2,
                    radius: (right-left)/2
                };

                if (left < right && top < bottom) {

                    this.actualWidth = right-left;
                    this.actualY = eventRegion.height/2;

                    top = (p.y+(p2.y-p.y)/2-this.actualWidth/2);
                    bottom = (p.y+(p2.y-p.y)/2+this.actualWidth/2);

                    var circStroke = ctx.lineWidth = Math.min(this.actualWidth/150,1)*6;

                    // event content
                    //ctx.globalAlpha = 1;
                    //ctx.fillStyle = 'rgba(255,255,255,1)';
                    //ctx.fillRect(left, top, right - left, scrHeight);
                    var opacity = Math.min(0.1+this.actualWidth/100,this.settings.opacity);
                    var eventLineWidth = Math.min(1+Math.round(this.actualWidth/200),2);
                    var triangleBase = 4+eventLineWidth;
                    var circleBaseY = bottom+circStroke/2;
                    var triangleOffset = 0;
                    if(eventLineWidth > 1)
                        triangleOffset = 1;
                    ctx.globalAlpha = opacity;

                    // render the image as a circle
                    ctx.save();
                    ctx.beginPath();
                    //console.log([middle, p.y+(p2.y-p.y)/2, this.actualWidth/2, 0, Math.PI * 2, true]);
                    ctx.arc(middle, p.y+(p2.y-p.y)/2, this.actualWidth/2, 0, Math.PI * 2, true);
                    ctx.clip();
                    //console.log([this.img, middle - this.actualWidth / 2, p.y + (p2.y - p.y) / 2 - this.actualWidth / 2, this.actualWidth, this.actualWidth]);
                    ctx.drawImage(this.img, middle-this.actualWidth/2, p.y+(p2.y-p.y)/2-this.actualWidth/2, this.actualWidth, this.actualWidth);
                    ctx.restore();

                    // draw the shadow
                    if(circStroke > 2) {
                        ctx.globalAlpha = opacity;
                        ctx.beginPath();
                        ctx.arc(middle+3, p.y+(p2.y-p.y)/2+3, this.actualWidth/2, 0, Math.PI * 2, true);
                        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                        ctx.stroke();
                    }

                    // draw the outline
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(middle, p.y+(p2.y-p.y)/2, this.actualWidth/2, 0, Math.PI * 2, true);
                    ctx.strokeStyle = this.settings.strokeStyle;
                    ctx.stroke();

                    // event line
                    ctx.globalAlpha = Math.min(opacity,0.35);
                    ctx.lineWidth = eventLineWidth;
                    ctx.strokeStyle = this.settings.strokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(middle,circleBaseY+triangleBase-triangleOffset);
                    ctx.lineTo(middle,viewport2d.height-8);
                    ctx.stroke();

                    // top triangle
                    ctx.fillStyle = this.settings.strokeStyle;
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.moveTo(middle-triangleBase,circleBaseY);
                    ctx.lineTo(middle,circleBaseY+triangleBase);
                    ctx.lineTo(middle+triangleBase,circleBaseY);
                    ctx.lineTo(middle,circleBaseY-1);
                    ctx.closePath();
                    ctx.fill();

                    // bottom triangle
                    ctx.fillStyle = this.settings.strokeStyle;
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.moveTo(middle-8,viewport2d.height);
                    ctx.lineTo(middle,viewport2d.height-8);
                    ctx.lineTo(middle+8,viewport2d.height);
                    ctx.closePath();
                    ctx.fill();
                }
            };

/*
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x, this.y - this.height/2);
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height/2);
                var scrHeight = viewport2d.heightVirtualToScreen(this.height);
                var left = Math.max(0, p.x);
                var top = (viewport2d.height/2)-scrHeight/2;
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);
                if (left < right && scrHeight > 1) {
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'rgba(255,255,255,1)';
                    ctx.fillRect(left, top, right - left, scrHeight);
                }
            };
 */

            this.onRemove = function () {
                this.img.removeEventListener("load", onCanvasImageLoad, false);
                this.img.removeEventListener("error", onCanvasImageLoadError, false);
                if (this.onload) this.img.removeEventListener("load", this.onload, false);
                this.img.isRemoved = true;
                delete this.img;
            };

            this.getNextEvent = function() {
                return this.parent.getNextEvent(this);
            };

            this.getPreviousEvent = function() {
                return this.parent.getPreviousEvent(this);
            };

            this.showContentItem = function() {

                

                this.recentlyActive = true;
                
                $('#info-heading').text(this.contentItem.title);
                $('#info-date').text(CZ.Dates.convertCoordinateToYearString(this.x+this.width/2));
                $('#event-content').html('<p>'+this.contentItem.description+'</p>');

                // set event controls
                $('#event-timeline-label').text(this.parent.title + ' Timeline');
                $('#event-timeline-link').data('timelineId', this.parent.id);
                $('#event-timeline-link').attr('href', '#'+this.parent.id);

                var nextEvent = this.parent.getSiblingEvent(this, true);
                var prevEvent = this.parent.getSiblingEvent(this, false);
                
                if(nextEvent) { // next
                    //console.log(this.parent.getSiblingEvent(this,true));
                    $('#event-next-link').data('eventId', nextEvent.id);
                    $('#event-next-link').removeClass('no-event');
                } else {
                    $('#event-next-link').addClass('no-event');
                }

                if(prevEvent) { // prev
                    //console.log(this.parent.getSiblingEvent(this,false));
                    $('#event-previous-link').data('eventId', prevEvent.id);
                    $('#event-previous-link').removeClass('no-event');
                } else {
                    $('#event-previous-link').addClass('no-event');
                }

                var headerOffset = ($('#info-header').outerHeight()+33);
                
                var totalHeight = $('#info-header').outerHeight(true)+$('#event-content').outerHeight(true)+16+60;
                var maxHeight = (this.vc.canvasHeight - 104);
                var contentHeight = Math.min(totalHeight,maxHeight)-headerOffset-44+36;
                $('#info-content').css('top', headerOffset+'px');
                $('#info-content').css('height', contentHeight+'px');
                $('#info-box').css({
                    'height' : totalHeight+'px',
                    'max-height' : maxHeight+'px'
                });
                setTimeout(function() { $('#info-box').removeClass('info-box-hidden') }, 200);
                
                // unlock panning
                CZ.Viewport.allowVerticalPan = true;
            };

            this.hideContentItem = function() {
                $('#info-box').addClass('info-box-hidden');

                setTimeout(function() { self.recentlyActive = false; }, 1000);

                // lock it up
                CZ.Viewport.allowVerticalPan = false;
            };

            this.intersects = function (rect) {
                return !(this.x + this.width < rect.x || this.x > rect.x + rect.width || this.y + this.height < rect.y || this.y > rect.y + rect.height);
            };

            this.contains = function (rect) {
                return (rect.x > this.x && rect.x + rect.width < this.x + this.width && rect.y > this.y && rect.y + rect.height < this.y + this.height);
            };

            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }


        /* 
        @param infodot {CanvasElement}  Parent of the content item
        @param cid  {string}            id of the content item
        Returns {id,x,y,width,height,parent,type,vc} of a content item even if it is not presented yet in the infodot children collection.
        */
        export function getContentItem(infodot, cid) {
            if (infodot.type !== 'infodot' || infodot.contentItems.length === 0) return null;
            var radv = infodot.width / 2;
            var innerRad = radv - CZ.Settings.infoDotHoveredBorderWidth * radv;
            var citems = buildVcContentItems(infodot.contentItems, infodot.x + infodot.width / 2, infodot.y + infodot.height / 2, innerRad, infodot.vc, infodot.layerid);
            if (!citems) return null;
            for (var i = 0; i < citems.length; i++) {
                if (citems[i].id == cid)
                    return {
                        id: cid,
                        x: citems[i].x, y: citems[i].y, width: citems[i].width, height: citems[i].height,
                        parent: infodot,
                        type: "contentItem",
                        vc: infodot.vc
                    };
            }
            return null;
        }

        /* Adds an infodot composite element into a virtual canvas.
        @param vc        (VirtualCanvas) VirtualCanvas hosting this element
        @param element   (CanvasElement) Parent element, whose children is to be new timeline.
        @param layerid   (any type) id of the layer for this element
        @param id        (any type) id of an element
        @param contentItems (array of { id, date (string), title (string), description (string), mediaUrl (string), mediaType (string) }) content items of the infodot, first is central.
        @returns         root of the content item tree
        */
        export function addEvent(element, layerid, id, time, vyc, radv, contentItems, infodotDescription) {
            var eventItem = new CanvasEvent(element.vc, layerid, id, time, vyc, radv, contentItems, infodotDescription);
            return addChild(element, eventItem, true);
        }

        function buildVcContentItems(contentItems, xc, yc, rad, vc, layerid) {
            var n = contentItems.length;
            if (n <= 0) return null;

            var _rad = 450.0 / 2.0; //489.0 / 2.0;
            var k = 1.0 / _rad;
            var _wc = 260.0 * k;
            var _hc = 270.0 * k;

            var _xlc = -_wc / 2 - 38.0 * k;
            var _xrc = -_xlc;
            var _lw = 60.0 * k;
            var _lh = _lw;
            var lw = _lw * rad;
            var lh = _lh * rad;

            var _ytc = -_hc / 2 - 9.0 * k - _lh / 2;
            var _ybc = -_ytc;

            var arrangeLeft = arrangeContentItemsInField(3, _lh);
            var arrangeRight = arrangeContentItemsInField(3, _lh);
            var arrangeBottom = arrangeContentItemsInField(3, _lw);

            var xl = xc + rad * (_xlc - _lw / 2);
            var xr = xc + rad * (_xrc - _lw / 2);
            var yb = yc + rad * (_ybc - _lh / 2);

            // build content items
            var vcitems = [];


            for (var i = 0, len = Math.min(10, n); i < len; i++) {
                var ci = contentItems[i];
                ci.date = xc+rad/2;
                if (i === 0) { // center
                    vcitems.push(new ContentItem(vc, layerid, ci.id, xc - rad, yc - rad, rad*2, rad*2, ci));
                } else if (i >= 1 && i <= 3) { // left
                    vcitems.push(new ContentItem(vc, layerid, ci.id, xl, yc + rad * arrangeLeft[(i - 1) % 3], lw, lh, ci));
                } else if (i >= 4 && i <= 6) { // right
                    vcitems.push(new ContentItem(vc, layerid, ci.id, xr, yc + rad * arrangeRight[(i - 1) % 3], lw, lh, ci));
                } else if (i >= 7 && i <= 9) { // bottom
                    vcitems.push(new ContentItem(vc, layerid, ci.id, xc + rad * arrangeBottom[(i - 1) % 3], yb, lw, lh, ci));
                }
            }

            return vcitems;
        }

        /* Arranges given number of content items in a single part of an infodot, along a single coordinate axis (either x or y).
        @param n    (number) Number of content items to arrange
        @param dx   (number) Size of content item along the axis on which we arrange content items.
        @returns null, if n is 0; array of lefts (tops) for each coordinate item. */
        function arrangeContentItemsInField(n, dx) {
            if (n == 0) return null;
            var margin = 0.05 * dx;
            var x1, x2, x3, x4;
            if (n % 2 == 0) { // n = 2 or 4
                // 3 1 2 4
                x1 = -margin / 2 - dx;
                x2 = margin / 2;
                if (n == 4) {
                    x3 = x1 - dx - margin;
                    x4 = x2 + margin + dx;
                    return [x3, x1, x2, x4]
                }
                return [x1, x2];
            }
            else { // n = 1 or 3
                // 3 1 2
                x1 = -dx / 2;
                if (n > 1) {
                    x2 = dx / 2 + margin;
                    x3 = x1 - dx - margin;
                    return [x3, x1, x2];
                }
                return [x1];
            }
        }
    }
}
