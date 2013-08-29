var CZ;
(function (CZ) {
    (function (VCContent) {
        var elementclick = ($).Event("elementclick");
        function getVisibleForElement(element, scale, viewport, use_margin) {
            var margin = 2 * (CZ.Settings.contentScaleMargin && use_margin ? CZ.Settings.contentScaleMargin : 0);
            var width = viewport.width - margin;
            if(width < 0) {
                width = viewport.width;
            }
            var scaleX = scale * element.width / width;
            var height = viewport.height - margin;
            if(height < 0) {
                height = viewport.height;
            }
            var scaleY = scale * element.height / height;
            var vs = {
                centerX: element.x + element.width / 2,
                centerY: element.y + element.height / 2,
                scale: scaleX
            };
            return vs;
        }
        VCContent.getVisibleForElement = getVisibleForElement;
        var zoomToElementHandler = function (sender, e, scale) {
            var vp = sender.vc.getViewport();
            var visible = getVisibleForElement(sender, scale, vp, true);
            elementclick.newvisible = visible;
            elementclick.element = sender;
            sender.vc.element.trigger(elementclick);
            return true;
        };
        function CanvasElement(vc, layerid, id, vx, vy, vw, vh) {
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
            this.fadeIn = false;
            this.isVisible = function (visibleBox_v) {
                var objRight = this.x + this.width;
                var objBottom = this.y + this.height;
                return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right) && Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
            };
            this.isInside = function (point_v) {
                return point_v.x >= this.x && point_v.x <= this.x + this.width && point_v.y >= this.y && point_v.y <= this.y + this.height;
            };
            this.render = function (ctx, visibleBox_v, viewport2d, size_p, opacity) {
            };
        }
        VCContent.CanvasElement = CanvasElement;
        VCContent.addRectangle = function (element, layerid, id, vx, vy, vw, vh, settings) {
            return VCContent.addChild(element, new CanvasRectangle(element.vc, layerid, id, vx, vy, vw, vh, settings), false);
        };
        VCContent.addCircle = function (element, layerid, id, vxc, vyc, vradius, settings, suppressCheck) {
            return VCContent.addChild(element, new CanvasCircle(element.vc, layerid, id, vxc, vyc, vradius, settings), suppressCheck);
        };
        VCContent.addImage = function (element, layerid, id, vx, vy, vw, vh, imgSrc, onload) {
            if(vw <= 0 || vh <= 0) {
                throw "Image size must be positive";
            }
            return VCContent.addChild(element, new CanvasImage(element.vc, layerid, id, imgSrc, vx, vy, vw, vh, onload), false);
        };
        VCContent.addLodImage = function (element, layerid, id, vx, vy, vw, vh, imgSources, onload) {
            if(vw <= 0 || vh <= 0) {
                throw "Image size must be positive";
            }
            return VCContent.addChild(element, new CanvasLODImage(element.vc, layerid, id, imgSources, vx, vy, vw, vh, onload), false);
        };
        VCContent.addSeadragonImage = function (element, layerid, id, vx, vy, vw, vh, z, imgSrc, onload) {
            if(vw <= 0 || vh <= 0) {
                throw "Image size must be positive";
            }
            return VCContent.addChild(element, new SeadragonImage(element.vc, element, layerid, id, imgSrc, vx, vy, vw, vh, z, onload), false);
        };
        VCContent.addVideo = function (element, layerid, id, videoSource, vx, vy, vw, vh, z) {
            return VCContent.addChild(element, new CanvasVideoItem(element.vc, layerid, id, videoSource, vx, vy, vw, vh, z), false);
        };
        VCContent.addPdf = function (element, layerid, id, pdfSource, vx, vy, vw, vh, z) {
            return VCContent.addChild(element, new CanvasPdfItem(element.vc, layerid, id, pdfSource, vx, vy, vw, vh, z), false);
        };
        var addAudio = function (element, layerid, id, audioSource, vx, vy, vw, vh, z) {
            return VCContent.addChild(element, new CanvasAudioItem(element.vc, layerid, id, audioSource, vx, vy, vw, vh, z), false);
        };
        function addText(element, layerid, id, vx, vy, baseline, vh, text, settings, vw) {
            return VCContent.addChild(element, new CanvasText(element.vc, layerid, id, vx, vy, baseline, vh, text, settings, vw), false);
        }
        VCContent.addText = addText;
        ; ;
        function addFixedHeading(element, layerid, id, vx, vy, baseline, vh, text, settings, vw) {
            return VCContent.addChild(element, new CanvasFixedHeading(element.vc, layerid, id, vx, vy, baseline, vh, text, settings, vw), false);
        }
        VCContent.addFixedHeading = addFixedHeading;
        ; ;
        function addEventHeading(element, layerid, id, vx, vy, baseline, vh, text, settings, vw) {
            return VCContent.addChild(element, new CanvasEventHeading(element.vc, layerid, id, vx, vy, baseline, vh, text, settings, vw), false);
        }
        VCContent.addEventHeading = addEventHeading;
        ; ;
        function addScrollText(element, layerid, id, vx, vy, vw, vh, text, z, settings) {
            return VCContent.addChild(element, new CanvasScrollTextItem(element.vc, layerid, id, vx, vy, vw, vh, text, z), false);
        }
        VCContent.addScrollText = addScrollText;
        ; ;
        function addMultiLineText(element, layerid, id, vx, vy, baseline, vh, text, lineWidth, settings) {
            return VCContent.addChild(element, new CanvasMultiLineTextItem(element.vc, layerid, id, vx, vy, vh, text, lineWidth, settings), false);
        }
        VCContent.addMultiLineText = addMultiLineText;
        ; ;
        function turnIsRenderedOff(element) {
            element.isRendered = false;
            if(element.onIsRenderedChanged) {
                element.onIsRenderedChanged();
            }
            var n = element.children.length;
            for(; --n >= 0; ) {
                if(element.children[n].isRendered) {
                    turnIsRenderedOff(element.children[n]);
                }
            }
        }
        VCContent.render = function (element, contexts, visibleBox_v, viewport2d, opacity) {
            if(!element.isVisible(visibleBox_v)) {
                if(element.isRendered) {
                    turnIsRenderedOff(element);
                }
                return;
            }
            var sz = viewport2d.vectorVirtualToScreen(element.width, element.height);
            if(sz.y <= CZ.Settings.renderThreshold || (element.width != 0 && sz.x <= CZ.Settings.renderThreshold)) {
                if(element.isRendered) {
                    turnIsRenderedOff(element);
                }
                return;
            }
            var ctx = contexts[element.layerid];
            if(element.opacity != null) {
                opacity *= element.opacity;
            }
            if(element.isRendered == undefined || !element.isRendered) {
                element.isRendered = true;
                if(element.onIsRenderedChanged) {
                    element.onIsRenderedChanged();
                }
            }
            element.render(ctx, visibleBox_v, viewport2d, sz, opacity);
            var children = element.children;
            var n = children.length;
            for(var i = 0; i < n; i++) {
                VCContent.render(children[i], contexts, visibleBox_v, viewport2d, opacity);
            }
        };
        VCContent.addChild = function (parent, element, suppresCheck) {
            var isWithin = parent.width == Infinity || (element.x >= parent.x && element.x + element.width <= parent.x + parent.width) && (element.y >= parent.y && element.y + element.height <= parent.y + parent.height);
            parent.children.push(element);
            element.parent = parent;
            return element;
        };
        VCContent.removeChild = function (parent, id) {
            var n = parent.children.length;
            for(var i = 0; i < n; i++) {
                var child = parent.children[i];
                if(child.id == id) {
                    if(typeof CZ.Layout.animatingElements[child.id] !== 'undefined') {
                        delete CZ.Layout.animatingElements[child.id];
                        CZ.Layout.animatingElements.length--;
                    }
                    parent.children.splice(i, 1);
                    clear(child);
                    if(child.onRemove) {
                        child.onRemove();
                    }
                    child.parent = null;
                    return true;
                }
            }
            return false;
        };
        var removeTimeline = function (timeline) {
            var n = timeline.children.length;
            console.log(n);
            for(var i = 0; i < n; i++) {
                var child = timeline.children[i];
                if(timeline.onRemove) {
                    timeline.onRemove();
                }
                child.parent = timeline.parent;
            }
        };
        function clear(element) {
            var n = element.children.length;
            for(var i = 0; i < n; i++) {
                var child = element.children[i];
                if(typeof CZ.Layout.animatingElements[child.id] !== 'undefined') {
                    delete CZ.Layout.animatingElements[child.id];
                    CZ.Layout.animatingElements.length--;
                }
                clear(child);
                if(child.onRemove) {
                    child.onRemove();
                }
                child.parent = null;
            }
            element.children = [];
        }
        ; ;
        function getChild(element, id) {
            var n = element.children.length;
            for(var i = 0; i < n; i++) {
                if(element.children[i].id == id) {
                    return element.children[i];
                }
            }
            throw "There is no child with id [" + id + "]";
        }
        VCContent.getChild = getChild;
        ; ;
        function CanvasRootElement(vc, layerid, id, vx, vy, vw, vh) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.opacity = 0;
            this.isVisible = function (visibleBox_v) {
                return this.children.length != 0;
            };
            this.beginEdit = function () {
                return this;
            };
            this.endEdit = function (dontRender) {
                if(!dontRender) {
                    this.vc.invalidate();
                }
            };
            this.isInside = function (point_v) {
                return true;
            };
            this.render = function (contexts, visibleBox_v, viewport2d) {
                this.vc.breadCrumbs = [];
                if(!this.isVisible(visibleBox_v)) {
                    return;
                }
                var n = this.children.length;
                for(var i = 0; i < n; i++) {
                    VCContent.render(this.children[i], contexts, visibleBox_v, viewport2d, 1);
                }
                if(this.vc.breadCrumbs.length > 0 && (this.vc.recentBreadCrumb == undefined || this.vc.breadCrumbs[vc.breadCrumbs.length - 1].vcElement.id != this.vc.recentBreadCrumb.vcElement.id)) {
                    this.vc.recentBreadCrumb = this.vc.breadCrumbs[vc.breadCrumbs.length - 1];
                    this.vc.breadCrumbsChanged();
                } else {
                    if(this.vc.breadCrumbs.length == 0 && this.vc.recentBreadCrumb != undefined) {
                        this.vc.recentBreadCrumb = undefined;
                        this.vc.breadCrumbsChanged();
                    }
                }
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }
        VCContent.CanvasRootElement = CanvasRootElement;
        function getZoomLevel(size_p) {
            var sz = Math.max(size_p.x, size_p.y);
            if(sz <= 1) {
                return 0;
            }
            var zl = (sz & 1) ? 1 : 0;
            for(var i = 1; i < 32; i++) {
                sz = sz >>> 1;
                if(sz & 1) {
                    if(zl > 0) {
                        zl = i + 1;
                    } else {
                        zl = i;
                    }
                }
            }
            return zl;
        }
        function CanvasDynamicLOD(vc, layerid, id, vx, vy, vw, vh) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.zoomLevel = 0;
            this.prevContent = null;
            this.newContent = null;
            this.asyncContent = null;
            this.lastRenderTime = 0;
            var self = this;
            this.changeZoomLevel = function (currentZoomLevel, newZoomLevel) {
                return null;
            };
            var startTransition = function (newContent) {
                self.lastRenderTime = new Date();
                self.prevContent = self.content;
                self.content = newContent.content;
                VCContent.addChild(self, self.content, false);
                if(self.prevContent) {
                    if(!self.prevContent.opacity) {
                        self.prevContent.opacity = 1;
                    }
                    self.content.opacity = 0;
                }
                self.zoomLevel = newContent.zoomLevel;
            };
            var onAsyncContentLoaded = function () {
                if(self.asyncContent) {
                    startTransition(self.asyncContent);
                    self.asyncContent = null;
                    delete this.onLoad;
                    self.vc.requestInvalidate();
                }
            };
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                this.vy = vy = viewport2d.visible.centerY;
                if(this.asyncContent) {
                    return;
                }
                if(!this.prevContent) {
                    var newZoomLevel = getZoomLevel(size_p);
                    if(this.zoomLevel != newZoomLevel) {
                        var newContent = this.changeZoomLevel(this.zoomLevel, newZoomLevel);
                        if(newContent) {
                            if(newContent.content.isLoading) {
                                this.asyncContent = newContent;
                                newContent.content.onLoad = onAsyncContentLoaded;
                            } else {
                                startTransition(newContent);
                            }
                        }
                    }
                }
                if(this.prevContent) {
                    var renderTime = new Date();
                    var renderTimeDiff = renderTime - self.lastRenderTime;
                    self.lastRenderTime = renderTime;
                    var contentAppearanceAnimationStep = renderTimeDiff / 1600;
                    var doInvalidate = false;
                    var lopacity = this.prevContent.opacity;
                    lopacity = Math.max(0, lopacity - contentAppearanceAnimationStep);
                    if(lopacity != this.prevContent.opacity) {
                        doInvalidate = true;
                    }
                    if(lopacity == 0) {
                        VCContent.removeChild(this, this.prevContent.id);
                        this.prevContent = null;
                    } else {
                        this.prevContent.opacity = lopacity;
                    }
                    lopacity = this.content.opacity;
                    lopacity = Math.min(1, lopacity + contentAppearanceAnimationStep);
                    if(!doInvalidate && lopacity != this.content.opacity) {
                        doInvalidate = true;
                    }
                    this.content.opacity = lopacity;
                    if(doInvalidate) {
                        this.vc.requestInvalidate();
                    }
                }
            };
            this.onIsRenderedChanged = function () {
                if(typeof this.removeWhenInvisible === 'undefined' || !this.removeWhenInvisible) {
                    return;
                }
                if(!this.isRendered) {
                    if(this.asyncContent) {
                        this.asyncContent = null;
                    }
                    if(this.prevContent) {
                        VCContent.removeChild(this, this.prevContent.id);
                        this.prevContent = null;
                    }
                    if(this.newContent) {
                        VCContent.removeChild(this, this.newContent.id);
                        this.newContent.content.onLoad = null;
                        this.newContent = null;
                    }
                    if(this.content) {
                        VCContent.removeChild(this, this.content.id);
                        this.content = null;
                    }
                    this.zoomLevel = 0;
                }
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }
        function ContainerElement(vc, layerid, id, vx, vy, vw, vh) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }
        function CanvasTimespan(vc, layerid, id, vx, vy, vw, vh, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.settings = settings || {
            };
            this.settings.gradientFillStyle = false;
            this.type = "rectangle";
            var lineY = -CZ.Settings.fixedTimelineOffset;
            var sideTicks = CZ.Settings.timelineEndTicks;
            var tlOffset;
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;
                tlOffset = (viewport2d.height + lineY);
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height);
                var left = Math.max(0, p.x);
                var top = Math.max(0, p.y);
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);
                if(left < right) {
                    ctx.globalAlpha = opacity;
                    if(this.settings.strokeStyle) {
                        ctx.strokeStyle = this.settings.strokeStyle;
                        if(this.settings.lineWidth) {
                            if(this.settings.isLineWidthVirtual) {
                                ctx.lineWidth = viewport2d.widthVirtualToScreen(this.settings.lineWidth);
                            } else {
                                ctx.lineWidth = this.settings.lineWidth;
                            }
                        } else {
                            ctx.lineWidth = 1;
                        }
                        ctx.lineWidth = 2;
                        var lineWidth2 = ctx.lineWidth * 2;
                        if(this.settings.outline) {
                            p.x += lineWidth2;
                            p.y += lineWidth2;
                            top += lineWidth2;
                            bottom -= lineWidth2;
                            left += lineWidth2;
                            right -= lineWidth2;
                            p2.x -= lineWidth2;
                            p2.y -= lineWidth2;
                        }
                        var pLineWidth = right - left;
                        var lineOpacity = 1;
                        if(pLineWidth < 400) {
                            lineOpacity = Math.min((pLineWidth / 400) + 0.2, 1);
                            if(pLineWidth <= 10) {
                                lineOpacity = 0;
                            }
                        }
                        ctx.globalAlpha = lineOpacity;
                        if(pLineWidth > 10) {
                            if(p.x > 0) {
                                ctx.beginPath();
                                ctx.moveTo(p.x, tlOffset - sideTicks);
                                ctx.lineTo(p.x, tlOffset + sideTicks);
                                ctx.stroke();
                            }
                            if(p2.x < viewport2d.width) {
                                ctx.beginPath();
                                ctx.moveTo(p2.x, tlOffset - sideTicks);
                                ctx.lineTo(p2.x, tlOffset + sideTicks);
                                ctx.stroke();
                            }
                            var lineLength = CZ.Settings.timelineFixedHeadingWidth / 2;
                            if(this.settings.spanGap > 0) {
                                lineLength = this.settings.spanGap / 2;
                            }
                            var lineStart = 0;
                            var lineEnd = 0;
                            var baseLine = tlOffset;
                            if(((right - left) - lineLength * 2) > 0) {
                                if(right > (right - (((right - left) / 2) - lineLength - 5))) {
                                    lineStart = right - (((right - left) / 2) - lineLength - 5);
                                    lineEnd = right;
                                    ctx.beginPath();
                                    ctx.moveTo(lineStart, baseLine);
                                    ctx.lineTo(lineEnd, baseLine);
                                    ctx.stroke();
                                }
                                if(left < (left + (((right - left) / 2) - lineLength - 5))) {
                                    lineStart = left;
                                    lineEnd = left + (((right - left) / 2) - lineLength - 5);
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
                            if(this.settings.gradientFillStyle) {
                                var lineargradient = ctx.createLinearGradient(0, baseLine - 200, 0, baseLine);
                                var transparent = "rgba(0, 0, 0, 0)";
                                lineargradient.addColorStop(0, transparent);
                                lineargradient.addColorStop(1, 'rgba(255,255,255,0.15)');
                                ctx.globalAlpha = lineOpacity;
                                ctx.fillStyle = lineargradient;
                                ctx.fillRect(p.x + 3, baseLine - 200, p2.x - p.x - 5, 197);
                            }
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
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }
        VCContent.CanvasTimespan = CanvasTimespan;
        function CanvasRectangle(vc, layerid, id, vx, vy, vw, vh, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.settings = settings;
            this.type = "rectangle";
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height);
                var left = Math.max(0, p.x);
                var top = Math.max(0, p.y);
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);
                if(left < right && top < bottom) {
                    if(this.settings.fillStyle) {
                        var opacity1 = this.settings.gradientOpacity ? opacity * (1 - this.settings.gradientOpacity) : opacity;
                        ctx.globalAlpha = opacity1;
                        ctx.fillStyle = this.settings.fillStyle;
                        ctx.fillRect(left, top, right - left, bottom - top);
                        if(this.settings.gradientOpacity && this.settings.gradientFillStyle) {
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
                    if(this.settings.strokeStyle) {
                        ctx.strokeStyle = this.settings.strokeStyle;
                        if(this.settings.lineWidth) {
                            if(this.settings.isLineWidthVirtual) {
                                ctx.lineWidth = viewport2d.widthVirtualToScreen(this.settings.lineWidth);
                            } else {
                                ctx.lineWidth = this.settings.lineWidth;
                            }
                        } else {
                            ctx.lineWidth = 1;
                        }
                        var lineWidth2 = ctx.lineWidth / 2;
                        lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;
                        if(this.settings.outline) {
                            p.x += lineWidth2;
                            p.y += lineWidth2;
                            top += lineWidth2;
                            bottom -= lineWidth2;
                            left += lineWidth2;
                            right -= lineWidth2;
                            p2.x -= lineWidth2;
                            p2.y -= lineWidth2;
                        }
                        if(p.x > 0) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, top - lineWidth2);
                            ctx.lineTo(p.x, bottom + lineWidth2);
                            ctx.stroke();
                        }
                        if(p.y > 0) {
                            ctx.beginPath();
                            ctx.moveTo(left - lineWidth2, lineY);
                            ctx.lineTo(right + lineWidth2, lineY);
                            ctx.stroke();
                        }
                        if(p2.x < viewport2d.width) {
                            ctx.beginPath();
                            ctx.moveTo(p2.x, top - lineWidth2);
                            ctx.lineTo(p2.x, bottom + lineWidth2);
                            ctx.stroke();
                        }
                        if(p2.y < viewport2d.height) {
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
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }
        VCContent.CanvasRectangle = CanvasRectangle;
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
            var marginLeft = width / 2 - headerWidth / 2;
            var marginTop = timelineinfo.titleRect ? timelineinfo.titleRect.marginTop : (1 - CZ.Settings.timelineHeaderMargin) * timelineinfo.height - headerSize;
            var baseline = timelineinfo.top + marginTop + headerSize / 2;
            this.titleObject = addText(this, layerid, id + "__header__", timelineinfo.timeStart + marginLeft, timelineinfo.top + marginTop, baseline, headerSize, timelineinfo.header, {
                fontName: CZ.Settings.timelineHeaderFontName,
                fillStyle: CZ.Settings.timelineHeaderFontColor,
                textBaseline: 'middle'
            }, headerWidth);
            this.title = this.titleObject.text;
            this.regime = timelineinfo.regime;
            this.settings.gradientOpacity = 0;
            this.settings.gradientFillStyle = timelineinfo.gradientFillStyle || timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
            this.reactsOnMouse = true;
            this.tooltipEnabled = true;
            this.tooltipIsShown = false;
            this.onmouseclick = function (e) {
                return zoomToElementHandler(this, e, 1);
            };
            this.onmousehover = function (pv, e) {
                if(this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id != id) {
                    try  {
                        this.vc.currentlyHoveredInfodot.id;
                    } catch (ex) {
                        CZ.Common.stopAnimationTooltip();
                        this.vc.currentlyHoveredTimeline.tooltipIsShown = false;
                    }
                }
                this.vc.currentlyHoveredTimeline = this;
                this.settings.strokeStyle = CZ.Settings.timelineHoveredBoxBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineHoveredLineWidth;
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHoveredHeaderFontColor;
                this.settings.hoverAnimationDelta = 3 / 60;
                this.vc.requestInvalidate();
                if(this.titleObject.initialized == false) {
                    var vp = this.vc.getViewport();
                    this.titleObject.screenFontSize = CZ.Settings.timelineHeaderSize * vp.heightVirtualToScreen(this.height);
                }
                if(this.titleObject.screenFontSize <= CZ.Settings.timelineTooltipMaxHeaderSize) {
                    this.tooltipEnabled = true;
                } else {
                    this.tooltipEnabled = false;
                }
                if(CZ.Common.tooltipMode != "infodot") {
                    CZ.Common.tooltipMode = "timeline";
                    if(this.tooltipEnabled == false) {
                        CZ.Common.stopAnimationTooltip();
                        this.tooltipIsShown = false;
                        return;
                    }
                    if(this.tooltipIsShown == false) {
                        switch(this.regime) {
                            case "Cosmos": {
                                $(".bubbleInfo").attr("id", "cosmosRegimeBox");
                                break;

                            }
                            case "Earth": {
                                $(".bubbleInfo").attr("id", "earthRegimeBox");
                                break;

                            }
                            case "Life": {
                                $(".bubbleInfo").attr("id", "lifeRegimeBox");
                                break;

                            }
                            case "Pre-history": {
                                $(".bubbleInfo").attr("id", "prehistoryRegimeBox");
                                break;

                            }
                            case "Humanity": {
                                $(".bubbleInfo").attr("id", "humanityRegimeBox");
                                break;

                            }
                        }
                        $(".bubbleInfo span").text(this.title);
                        this.panelWidth = $('.bubbleInfo').outerWidth();
                        this.panelHeight = $('.bubbleInfo').outerHeight();
                        this.tooltipIsShown = true;
                        CZ.Common.animationTooltipRunning = $('.bubbleInfo').fadeIn();
                    }
                }
            };
            this.onmouseunhover = function (pv, e) {
                if(this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id == id) {
                    this.vc.currentlyHoveredTimeline = null;
                    if((this.tooltipIsShown == true) && (CZ.Common.tooltipMode == "timeline")) {
                        CZ.Common.tooltipMode = "default";
                        CZ.Common.stopAnimationTooltip();
                        $(".bubbleInfo").attr("id", "defaultBox");
                        this.tooltipIsShown = false;
                    }
                }
                this.settings.strokeStyle = timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineLineWidth;
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHeaderFontColor;
                this.settings.hoverAnimationDelta = -3 / 60;
                this.vc.requestInvalidate();
            };
            this.base_render = this.render;
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                this.titleObject.initialized = false;
                if(this.settings.hoverAnimationDelta) {
                    this.settings.gradientOpacity = Math.min(1, Math.max(0, this.settings.gradientOpacity + this.settings.hoverAnimationDelta));
                }
                this.base_render(ctx, visibleBox, viewport2d, size_p, opacity);
                if(this.settings.hoverAnimationDelta) {
                    if(this.settings.gradientOpacity == 0 || this.settings.gradientOpacity == 1) {
                        this.settings.hoverAnimationDelta = undefined;
                    } else {
                        this.vc.requestInvalidate();
                    }
                }
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = {
                    x: p.x + size_p.x,
                    y: p.y + size_p.y
                };
                var isCenterInside = viewport2d.visible.centerX - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.x + this.width && viewport2d.visible.centerX + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.x && viewport2d.visible.centerY - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.y + this.height && viewport2d.visible.centerY + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.y;
                var isVisibleInTheRectangle = ((p.x < CZ.Settings.timelineBreadCrumbBorderOffset && p2.x > viewport2d.width - CZ.Settings.timelineBreadCrumbBorderOffset) || (p.y < CZ.Settings.timelineBreadCrumbBorderOffset && p2.y > viewport2d.height - CZ.Settings.timelineBreadCrumbBorderOffset));
                if(isVisibleInTheRectangle && isCenterInside) {
                    var length = vc.breadCrumbs.length;
                    if(length > 1) {
                        if(vc.breadCrumbs[length - 1].vcElement.parent.id == this.parent.id) {
                            return;
                        }
                    }
                    vc.breadCrumbs.push({
                        vcElement: this
                    });
                }
            };
            this.prototype = new CanvasTimespan(vc, layerid, id, vx, vy, vw, vh, settings);
        }
        function CanvasFixedTimeline(vc, layerid, id, vx, vy, vw, vh, settings, timelineinfo) {
            var vp2d = vc.viewport;
            var newHeight = vp2d.heightScreenToVirtual(30);
            this.base = CanvasTimespan;
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
            var marginLeft = 0;
            var marginTop = timelineinfo.titleRect ? timelineinfo.titleRect.marginTop : (1 - CZ.Settings.timelineHeaderMargin) * timelineinfo.height - headerSize;
            var baseline = timelineinfo.top + marginTop + headerSize / 2;
            this.titleObject = addFixedHeading(this, layerid, id + "__header__", timelineinfo.timeStart + marginLeft, timelineinfo.top + marginTop, baseline, headerSize, timelineinfo.header, {
                fontName: CZ.Settings.timelineHeaderFontName,
                fillStyle: CZ.Settings.timelineHeaderFontColor,
                textBaseline: 'middle',
                depth: timelineinfo.depth,
                timeStart: timelineinfo.timeStart,
                timeEnd: timelineinfo.timeEnd
            }, headerWidth);
            this.settings.spanGap = 0;
            if(this.titleObject.headingWidth) {
                this.settings.spanGap = this.titleObject.headingWidth;
            }
            this.title = this.titleObject.text;
            this.regime = timelineinfo.regime;
            this.settings.gradientOpacity = 0;
            this.settings.gradientFillStyle = timelineinfo.gradientFillStyle || timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineBorderColor;
            this.reactsOnMouse = true;
            this.tooltipEnabled = true;
            this.tooltipIsShown = false;
            this.getSiblingTimeline = function (next) {
                var distance;
                var siblingTimeline;
                var curTimeline = this;
                if(this.parent && this.parent.type == 'timeline') {
                    var parentTimeline = this.parent;
                    var endDiff = Math.abs((parentTimeline.endDate) - (curTimeline.endDate));
                    var startDiff = Math.abs(parentTimeline.x - curTimeline.x);
                    if((endDiff < 1000 && next) || (startDiff < 1000 && !next)) {
                        var nextTimeline = parentTimeline.getSiblingTimeline(next);
                        parentTimeline = siblingTimeline = nextTimeline;
                    }
                    if(!parentTimeline) {
                        return false;
                    }
                    for(var i = 0; i < parentTimeline.children.length; i++) {
                        var sibling = parentTimeline.children[i];
                        if(sibling.type == 'timeline') {
                            if(next) {
                                if(Math.abs((curTimeline.endDate) - sibling.x) < 1000) {
                                    siblingTimeline = sibling;
                                    break;
                                }
                            } else {
                                if(Math.abs(sibling.endDate - curTimeline.x) < 1000) {
                                    siblingTimeline = sibling;
                                    break;
                                }
                            }
                        }
                    }
                }
                if(siblingTimeline) {
                    return siblingTimeline;
                }
                return false;
            };
            this.hasEvents = function () {
                var hasEvents = false;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot') {
                        hasEvents = true;
                    }
                    if(this.children[i].type == 'timeline') {
                        hasEvents = this.children[i].hasEvents();
                    }
                }
                return hasEvents;
            };
            this.getFirstEvent = function () {
                if(this.children.length == 0) {
                    return false;
                }
                if(this.children.length == 1) {
                    if(this.children[0].type !== 'infodot' && this.children[0].type == 'timeline') {
                        return false;
                    }
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
            this.getLastEvent = function () {
                if(this.children.length == 0) {
                    return false;
                }
                if(this.children.length == 1) {
                    if(this.children[0].type !== 'infodot' && this.children[0].type == 'timeline') {
                        return false;
                    }
                }
                for(var i = this.children.length - 1; i > 0; i--) {
                    if(this.children[i].type == 'infodot') {
                        return this.children[i];
                    }
                    if(this.children[i].type == 'timeline') {
                        return this.children[i].getLastEvent();
                    }
                }
                return false;
            };
            this.getSiblingEvent = function (currentEvent, next) {
                var nextEvent;
                var distance;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' && this.children[i].x > currentEvent.x && next) {
                        if(distance) {
                            if(distance > (this.children[i].x - currentEvent.x)) {
                                distance = this.children[i].x - currentEvent.x;
                                nextEvent = this.children[i];
                            }
                        } else {
                            distance = this.children[i].x - currentEvent.x;
                            nextEvent = this.children[i];
                        }
                    } else {
                        if(this.children[i].type == 'infodot' && this.children[i].x < currentEvent.x && !next) {
                            if(distance) {
                                if(distance > (currentEvent.x - this.children[i].x)) {
                                    distance = currentEvent.x - this.children[i].x;
                                    nextEvent = this.children[i];
                                }
                            } else {
                                distance = currentEvent.x - this.children[i].x;
                                nextEvent = this.children[i];
                            }
                        }
                    }
                }
                if(nextEvent) {
                    return nextEvent;
                }
                var sibling = this.getSiblingTimeline(next);
                while(sibling && !sibling.hasEvents()) {
                    sibling = sibling.getSiblingTimeline(next);
                }
                if(sibling) {
                    if(next) {
                        if(sibling.getFirstEvent()) {
                            return sibling.getFirstEvent();
                        }
                    } else {
                        for(var i = sibling.children.length - 1; i > 0; i--) {
                            if(sibling.children[i].type == 'infodot') {
                                return sibling.getLastEvent();
                            }
                        }
                    }
                    return sibling;
                }
                return false;
            };
            this.getNextEvent = function (currentEvent) {
                var nextEvent;
                var distance;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' && this.children[i].x > currentEvent.x) {
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
                if(nextEvent) {
                    return nextEvent;
                }
            };
            this.getPreviousEvent = function (currentEvent) {
                var prevEvent;
                var distance;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' && this.children[i].x < currentEvent.x) {
                        if(distance) {
                            if(distance > (currentEvent.x - this.children[i].x)) {
                                distance = currentEvent.x - this.children[i].x;
                                prevEvent = this.children[i];
                            }
                        } else {
                            distance = currentEvent.x - this.children[i].x;
                            prevEvent = this.children[i];
                        }
                    }
                }
                if(prevEvent) {
                    return prevEvent;
                }
            };
            this.getClosestTimelineEvent = function (visibleBox) {
                var offset;
                var closest;
                var center = visibleBox.Left + (visibleBox.Right - visibleBox.Left) / 2;
                for(var i = 0; i < this.children.length; i++) {
                    if(this.children[i].type == 'infodot' && this.children[i].isVisible(visibleBox)) {
                        if(offset) {
                            if(offset > Math.abs(center - this.children[i].canvasContentItem.x)) {
                                closest = this.children[i];
                                offset = Math.abs(center - this.children[i].canvasContentItem.x);
                            }
                        } else {
                            closest = this.children[i];
                            offset = Math.abs(center - this.children[i].canvasContentItem.x);
                        }
                    }
                    if(this.children[i].type == 'timeline') {
                        var childTimeline = this.children[i];
                        if(childTimeline.isVisible(visibleBox) && childTimeline.hasEvents()) {
                            var closestEvent = childTimeline.getClosestTimelineEvent(visibleBox);
                            if(closestEvent) {
                                if(offset) {
                                    if(offset > Math.abs(center - closestEvent.canvasContentItem.x)) {
                                        closest = closestEvent;
                                        offset = Math.abs(center - closestEvent.canvasContentItem.x);
                                    }
                                } else {
                                    closest = closestEvent;
                                    offset = Math.abs(center - closestEvent.canvasContentItem.x);
                                }
                            }
                        }
                    }
                }
                return closest;
            };
            this.isVisible = function (visibleBox_v) {
                var objRight = this.x + this.width;
                return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right);
            };
            this.isInside = function (point_v) {
                var sideTicks = CZ.Settings.timelineEndTicks;
                lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;
                var tlOffset = (vc.viewport.height + lineY);
                if(vc.viewport.widthVirtualToScreen(this.width) < 18) {
                    return false;
                } else {
                    var point_s = vc.viewport.pointVirtualToScreen(point_v.x, point_v.y);
                    var insideBool = point_v.x >= this.x && point_v.x <= this.x + this.width && point_s.y <= tlOffset + sideTicks * 2;
                    return insideBool;
                }
            };
            this.onmouseclick = function (e) {
                CZ.Viewport.lockEvents = true;
                if(this.vc.currentlyHoveredInfodot) {
                    return zoomToElementHandler(this.vc.currentlyHoveredInfodot.canvasContentItem, e, 0.35);
                }
                return zoomToElementHandler(this, e, 1);
            };
            this.onmousehover = function (pv, e) {
                if(this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id != id) {
                    try  {
                        this.vc.currentlyHoveredInfodot.id;
                    } catch (ex) {
                        CZ.Common.stopAnimationTooltip();
                        this.vc.currentlyHoveredTimeline.tooltipIsShown = false;
                    }
                }
                this.vc.currentlyHoveredTimeline = this;
                this.settings.strokeStyle = CZ.Settings.timelineHoveredBoxBorderColor;
                this.settings.lineWidth = CZ.Settings.timelineHoveredLineWidth;
                this.settings.gradientFillStyle = 'rgba(255,255,255,0.15)';
                this.titleObject.settings.fillStyle = CZ.Settings.timelineHoveredHeaderFontColor;
                this.settings.hoverAnimationDelta = 3 / 60;
                this.vc.requestInvalidate();
                if(this.titleObject.initialized == false) {
                    var vp = this.vc.getViewport();
                    this.titleObject.screenFontSize = CZ.Settings.timelineHeaderSize * vp.heightVirtualToScreen(this.height);
                }
                if(vc.viewport.widthVirtualToScreen(this.width) <= CZ.Settings.fixedTimelineHeadingThreshold + 5) {
                    this.tooltipEnabled = true;
                } else {
                    this.tooltipEnabled = false;
                }
                if(CZ.Common.tooltipMode != "infodot") {
                    CZ.Common.tooltipMode = "timeline";
                    if(this.tooltipEnabled == false) {
                        CZ.Common.stopAnimationTooltip();
                        this.tooltipIsShown = false;
                        return;
                    }
                    if(this.tooltipIsShown == false) {
                        switch(this.regime) {
                            case "Cosmos": {
                                $(".bubbleInfo").attr("id", "cosmosRegimeBox");
                                break;

                            }
                            case "Earth": {
                                $(".bubbleInfo").attr("id", "earthRegimeBox");
                                break;

                            }
                            case "Life": {
                                $(".bubbleInfo").attr("id", "lifeRegimeBox");
                                break;

                            }
                            case "Pre-history": {
                                $(".bubbleInfo").attr("id", "prehistoryRegimeBox");
                                break;

                            }
                            case "Humanity": {
                                $(".bubbleInfo").attr("id", "humanityRegimeBox");
                                break;

                            }
                        }
                        $(".bubbleInfo span").text(this.title);
                        this.panelWidth = $('.bubbleInfo').outerWidth();
                        this.panelHeight = $('.bubbleInfo').outerHeight();
                        this.tooltipIsShown = true;
                        CZ.Common.animationTooltipRunning = $('.bubbleInfo').fadeIn();
                    }
                }
            };
            this.onmouseunhover = function (pv, e) {
                if(this.vc.currentlyHoveredTimeline != null && this.vc.currentlyHoveredTimeline.id == id) {
                    this.vc.currentlyHoveredTimeline = null;
                    if((this.tooltipIsShown == true) && (CZ.Common.tooltipMode == "timeline")) {
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
                this.settings.hoverAnimationDelta = -3 / 60;
                this.vc.requestInvalidate();
            };
            this.base_render = this.render;
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                this.titleObject.initialized = false;
                if(this.settings.hoverAnimationDelta) {
                    this.settings.gradientOpacity = Math.min(1, Math.max(0, this.settings.gradientOpacity + this.settings.hoverAnimationDelta));
                }
                this.settings.spanGap = this.titleObject.headingWidth;
                this.base_render(ctx, visibleBox, viewport2d, size_p, opacity);
                if(this.settings.hoverAnimationDelta) {
                    if(this.settings.gradientOpacity == 0 || this.settings.gradientOpacity == 1) {
                        this.settings.hoverAnimationDelta = undefined;
                    } else {
                        this.vc.requestInvalidate();
                    }
                }
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = {
                    x: p.x + size_p.x,
                    y: p.y + size_p.y
                };
                if(this.vc.currentlyViewedEvent) {
                    if(this.vc.currentlyViewedEvent.parent.id == this.id) {
                        if(!this.vc.currentlyViewedEvent.canvasContentItem.isVisible(visibleBox) || !this.vc.currentlyViewedEvent.canvasContentItem.isActive) {
                            this.vc.currentlyViewedEvent.hideContentItem();
                            this.vc.currentlyViewedEvent = undefined;
                        }
                    }
                }
                var isCenterInside = viewport2d.visible.centerX - CZ.Settings.timelineCenterOffsetAcceptableImplicity <= this.x + this.width && viewport2d.visible.centerX + CZ.Settings.timelineCenterOffsetAcceptableImplicity >= this.x;
                var isVisibleInTheRectangle = (p.x < CZ.Settings.timelineBreadCrumbBorderOffset && p2.x > viewport2d.width - CZ.Settings.timelineBreadCrumbBorderOffset);
                if(isVisibleInTheRectangle && isCenterInside) {
                    var length = vc.breadCrumbs.length;
                    if(length > 1) {
                        if(vc.breadCrumbs[length - 1].vcElement.parent.id == this.parent.id) {
                            return;
                        }
                    }
                    vc.breadCrumbs.push({
                        vcElement: this
                    });
                }
                if(isVisibleInTheRectangle) {
                    var centerEvent = this.getClosestTimelineEvent(visibleBox);
                    if(centerEvent) {
                        if(centerEvent.canvasContentItem.isActive) {
                            if(centerEvent.canvasContentItem.isVisible(visibleBox)) {
                                if(!this.vc.currentlyViewedEvent || this.vc.currentlyViewedEvent.id !== centerEvent.id) {
                                    this.vc.currentlyViewedEvent = centerEvent;
                                    centerEvent.showContentItem();
                                }
                            }
                        } else {
                            if(typeof (this.vc.currentlyViewedEvent) !== 'undefined') {
                                if(this.vc.currentlyViewedEvent.parent.id == this.id || !this.vc.currentlyViewedEvent.canvasContentItem.isActive) {
                                    this.vc.currentlyViewedEvent.hideContentItem();
                                    this.vc.currentlyViewedEvent = undefined;
                                }
                            } else {
                                $('#info-box').addClass('info-box-hidden');
                            }
                        }
                    } else {
                        if(typeof (this.vc.currentlyViewedEvent) !== 'undefined') {
                            if(this.vc.currentlyViewedEvent.parent.id == this.id) {
                                this.vc.currentlyViewedEvent.hideContentItem();
                                this.vc.currentlyViewedEvent = undefined;
                            }
                        } else {
                            $('#info-box').addClass('info-box-hidden');
                        }
                    }
                }
            };
            this.checkForHoveredEvents = function () {
                return;
            };
            this.prototype = new CanvasTimespan(vc, layerid, id, vx, vy, vw, vh, settings);
        }
        function CanvasCircle(vc, layerid, id, vxc, vyc, vradius, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vxc - vradius, vyc - vradius, 2 * vradius, 2 * vradius);
            this.settings = settings;
            this.isObservedNow = false;
            this.type = "circle";
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var rad = this.width / 2;
                var xc = this.x + rad;
                var yc = this.y + rad;
                var p = viewport2d.pointVirtualToScreen(xc, yc);
                var radp = viewport2d.widthVirtualToScreen(rad);
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, radp, 0, Math.PI * 2, true);
                ctx.fillStyle = this.settings.fillStyle;
                ctx.fill();
                if(this.settings.strokeStyle) {
                    ctx.strokeStyle = this.settings.strokeStyle;
                    if(this.settings.lineWidth) {
                        if(this.settings.isLineWidthVirtual) {
                            ctx.lineWidth = viewport2d.widthVirtualToScreen(this.settings.lineWidth);
                        } else {
                            ctx.lineWidth = this.settings.lineWidth;
                        }
                    } else {
                        ctx.lineWidth = 1;
                    }
                    ctx.stroke();
                }
            };
            this.isInside = function (point_v) {
                var len2 = CZ.Common.sqr(point_v.x - vxc) + CZ.Common.sqr(point_v.y - this.y - this.height / 2);
                return len2 <= vradius * vradius;
            };
            this.prototype = new CanvasElement(vc, layerid, id, vxc - vradius / 2, vyc - vradius / 2, vradius, vradius);
        }
        function addPopupWindow(url, id, width, height, scrollbars, resizable) {
            var w = width;
            var h = height;
            var s = scrollbars;
            var r = resizable;
            var features = 'width=' + w + ',height=' + h + ',scrollbars=' + s + ',resizable=' + r;
            window.open(url, id, features);
        }
        function drawText(text, ctx, x, y, fontSize, fontName) {
            var br = ($).browser;
            var isIe9 = br.msie && parseInt(br.version, 10) >= 9;
            if(isIe9) {
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
        function CanvasText(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, wv ? wv : 0, vh);
            this.text = text;
            this.baseline = baseline;
            this.newBaseline = baseline;
            this.settings = settings;
            this.opacity = settings.opacity || 0;
            this.type = "text";
            if(typeof this.settings.textBaseline != 'undefined' && this.settings.textBaseline === 'middle') {
                this.newBaseline = this.newY + this.newHeight / 2;
            }
            this.initialized = false;
            this.screenFontSize = 0;
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x, this.newY);
                var bp = viewport2d.pointVirtualToScreen(this.x, this.newBaseline).y;
                ctx.globalAlpha = opacity;
                ctx.fillStyle = this.settings.fillStyle;
                var fontSize = size_p.y;
                var k = 1.5;
                if(this.screenFontSize != fontSize) {
                    this.screenFontSize = fontSize;
                }
                if(!this.initialized) {
                    if(this.settings.wrapText) {
                        var numberOfLines = this.settings.numberOfLines ? this.settings.numberOfLines : 1;
                        this.settings.numberOfLines = numberOfLines;
                        fontSize = size_p.y / numberOfLines / k;
                        while(true) {
                            ctx.font = fontSize + "pt " + this.settings.fontName;
                            var mlines = this.text.split('\n');
                            var textHeight = 0;
                            var lines = [];
                            for(var il = 0; il < mlines.length; il++) {
                                var words = mlines[il].split(' ');
                                var lineWidth = 0;
                                var currentLine = '';
                                var wsize;
                                var space = ctx.measureText(' ').width;
                                for(var iw = 0; iw < words.length; iw++) {
                                    wsize = ctx.measureText(words[iw]);
                                    var newWidth = lineWidth == 0 ? lineWidth + wsize.width : lineWidth + wsize.width + space;
                                    if(newWidth > size_p.x && lineWidth > 0) {
                                        lines.push(currentLine);
                                        lineWidth = 0;
                                        textHeight += fontSize * k;
                                        iw--;
                                        currentLine = '';
                                    } else {
                                        if(currentLine === '') {
                                            currentLine = words[iw];
                                        } else {
                                            currentLine += ' ' + words[iw];
                                        }
                                        lineWidth = newWidth;
                                    }
                                }
                                lines.push(currentLine);
                                textHeight += fontSize * k;
                            }
                            if(textHeight > size_p.y) {
                                fontSize /= 1.5;
                            } else {
                                this.text = lines;
                                var fontSizeVirtual = viewport2d.heightScreenToVirtual(fontSize);
                                this.settings.fontSizeVirtual = fontSizeVirtual;
                                break;
                            }
                        }
                        this.screenFontSize = fontSize;
                    } else {
                        ctx.font = fontSize + "pt " + this.settings.fontName;
                        this.screenFontSize = fontSize;
                        if(this.width == 0) {
                            var size = ctx.measureText(this.text);
                            size_p.x = size.width;
                            this.width = viewport2d.widthScreenToVirtual(size.width);
                        } else {
                            var size = ctx.measureText(this.text);
                            if(size.width > size_p.x) {
                                this.height = this.width * size_p.y / size.width;
                                if(this.settings.textBaseline === 'middle') {
                                    this.newY = this.newBaseline - this.newHeight / 2;
                                }
                                fontSize = viewport2d.heightVirtualToScreen(this.height);
                                this.screenFontSize = fontSize;
                            } else {
                                if(typeof this.settings.adjustWidth && this.settings.adjustWidth) {
                                    var nwidth = viewport2d.widthScreenToVirtual(size.width);
                                    if(this.settings.textAlign === 'center') {
                                        this.x = this.x + (this.width - nwidth) / 2;
                                    } else {
                                        if(this.settings.textAlign === 'right') {
                                            this.x = this.x + this.width - nwidth;
                                        }
                                    }
                                    this.width = nwidth;
                                    p = viewport2d.pointVirtualToScreen(this.x, this.newY);
                                    size_p.x = viewport2d.widthVirtualToScreen(this.width);
                                }
                            }
                        }
                    }
                    this.initialized = true;
                }
                if(this.settings.textAlign) {
                    ctx.textAlign = this.settings.textAlign;
                    if(this.settings.textAlign === 'center') {
                        p.x = p.x + size_p.x / 2;
                    } else {
                        if(this.settings.textAlign === 'right') {
                            p.x = p.x + size_p.x;
                        }
                    }
                }
                fontSize = 18;
                if(!this.settings.wrapText) {
                    if(this.settings.textBaseline) {
                        ctx.textBaseline = this.settings.textBaseline;
                    }
                    drawText(this.text, ctx, p.x, bp, fontSize, this.settings.fontName);
                } else {
                    fontSize = viewport2d.heightVirtualToScreen(this.settings.fontSizeVirtual);
                    this.screenFontSize = fontSize;
                    ctx.textBaseline = 'middle';
                    var bp = p.y + fontSize * k / 2;
                    for(var i = 0; i < this.text.length; i++) {
                        drawText(this.text[i], ctx, p.x, bp, fontSize, this.settings.fontName);
                        bp += fontSize * k;
                    }
                }
            };
            this.isVisible = function (visibleBox_v) {
                var objBottom = this.y + this.height;
                if(this.width > 0) {
                    var objRight = this.x + this.width;
                    return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right) && Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
                }
                return Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, wv ? wv : 0, vh);
        }
        function CanvasFixedHeading(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv) {
            this.base = CanvasText;
            this.base(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv);
            this.settings = settings;
            this.text = text;
            this.headingWidth = -1;
            this.isVisible = function (visibleBox_v) {
                var sWidth = vc.viewport.widthVirtualToScreen(Math.min(visibleBox_v.Right, this.settings.timeEnd) - Math.max(visibleBox_v.Left, this.settings.timeStart));
                if(sWidth > this.headingWidth && this.headingWidth > 0) {
                    return (sWidth - this.headingWidth) > 5;
                } else {
                    if(this.headingWidth < 0) {
                        return true;
                    }
                }
                return false;
            };
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var lineY = (this.settings.depth * -CZ.Settings.fixedTimelineHeight) - CZ.Settings.fixedTimelineOffset;
                var tlOffset = (viewport2d.height + lineY);
                var p = viewport2d.pointVirtualToScreen(this.x, this.newY);
                fontSize = CZ.Settings.fixedTimelineFontMap[this.settings.depth];
                ctx.font = fontSize + "pt " + CZ.Settings.timelineHeaderFontName;
                var size = ctx.measureText(this.text);
                this.headingWidth = Math.max(0, size.width);
                size_p.x = size.width;
                this.width = viewport2d.widthScreenToVirtual(size.width);
                var headingOffset = size.width;
                var screenLeft = viewport2d.pointVirtualToScreen(Math.max(visibleBox.Left, this.settings.timeStart), this.y).x;
                var visibleWidth = Math.min(visibleBox.Right, this.settings.timeEnd) - Math.max(visibleBox.Left, this.settings.timeStart);
                var visibleScreenWidth = viewport2d.widthVirtualToScreen(visibleWidth);
                var xPos = screenLeft + (visibleScreenWidth - headingOffset) / 2;
                if(this.settings.textBaseline) {
                    ctx.textBaseline = this.settings.textBaseline;
                }
                ctx.fillStyle = 'rgba(255,2555,255,1)';
                drawText(this.text, ctx, xPos, tlOffset, fontSize, this.settings.fontName);
            };
            this.prototype = new CanvasText(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv);
        }
        function CanvasEventHeading(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv) {
            this.base = CanvasFixedHeading;
            this.base(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv);
            this.settings = settings || {
            };
            this.settings.opacity = 1;
            this.settings.strokeStyle = 'rgb(255,255,255)';
            this.showHeading = false;
            this.isVisible = function (vbox) {
                return this.showHeading;
            };
            this.isInside = function (vbox) {
                return false;
            };
            this.onmouseclick = function (e) {
                return zoomToElementHandler(this.parent, e, 0.35);
            };
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x + this.width / 2, this.y);
                fontSize = CZ.Settings.fixedTimelineFontMap[this.settings.depth];
                ctx.font = fontSize + "pt " + CZ.Settings.timelineHeaderFontName;
                var size = ctx.measureText(this.text);
                this.headingWidth = Math.max(0, size.width);
                size_p.x = headingOffset = size.width;
                ctx.globalAlpha = this.settings.opacity;
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.fillRect(p.x - headingOffset / 2 - 20, p.y + 115, headingOffset + 40, 40);
                ctx.lineWidth = 2;
                ctx.strokeStyle = this.settings.strokeStyle;
                ctx.strokeRect(p.x - headingOffset / 2 - 20, p.y + 115, headingOffset + 40, 40);
                if(this.settings.textBaseline) {
                    ctx.textBaseline = this.settings.textBaseline;
                }
                ctx.fillStyle = 'rgba(255,255,255,1)';
                drawText(this.text, ctx, p.x - headingOffset / 2, p.y + 135, fontSize, this.settings.fontName);
            };
            this.prototype = new CanvasText(vc, layerid, id, vx, vy, baseline, vh, text, settings, wv);
        }
        function CanvasMultiLineTextItem(vc, layerid, id, vx, vy, vh, text, lineWidth, settings) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vh * 10, vh);
            this.settings = settings;
            this.text = text;
            this.render = function (ctx, visibleBox, viewport2d, size_p) {
                function textOutput(context, text, x, y, lineHeight, fitWidth) {
                    fitWidth = fitWidth || 0;
                    if(fitWidth <= 0) {
                        context.fillText(text, x, y);
                        return;
                    }
                    var words = text.split(' ');
                    var currentLine = 0;
                    var idx = 1;
                    while(words.length > 0 && idx <= words.length) {
                        var str = words.slice(0, idx).join(' ');
                        var w = context.measureText(str).width;
                        if(w > fitWidth) {
                            if(idx == 1) {
                                idx = 2;
                            }
                            context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));
                            currentLine++;
                            words = words.splice(idx - 1);
                            idx = 1;
                        } else {
                            idx++;
                        }
                    }
                    if(idx > 0) {
                        context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
                    }
                }
                ; ;
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                ctx.fillStyle = settings.fillStyle;
                ctx.font = size_p.y + "pt " + settings.fontName;
                ctx.textBaseline = 'top';
                var height = viewport2d.heightVirtualToScreen(this.height);
                textOutput(ctx, this.text, p.x, p.y, height, lineWidth * height);
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vh * 10, vh);
        }
        function CanvasImage(vc, layerid, id, imageSource, vx, vy, vw, vh, onload) {
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.onload = onload;
            this.isLoading = true;
            var img = new Image();
            this.img = img;
            this.img.isLoaded = false;
            var self = this;
            var onCanvasImageLoad = function (s) {
                img['isLoading'] = false;
                if(!img['isRemoved']) {
                    if(img.naturalHeight) {
                        var ar0 = self.width / self.height;
                        var ar1 = img.naturalWidth / img.naturalHeight;
                        if(ar0 > ar1) {
                            var imgWidth = ar1 * self.height;
                            var offset = (self.width - imgWidth) / 2;
                            self.x += offset;
                            self.width = imgWidth;
                        } else {
                            if(ar0 < ar1) {
                                var imgHeight = self.width / ar1;
                                var offset = (self.height - imgHeight) / 2;
                                self.y += offset;
                                self.height = imgHeight;
                            }
                        }
                    }
                    img['isLoaded'] = true;
                    if(self.onLoad) {
                        self.onLoad();
                    }
                    self.vc.requestInvalidate();
                } else {
                    delete img['isRemoved'];
                    delete img['isLoaded'];
                }
            };
            var onCanvasImageLoadError = function (e) {
                if(!img['isFallback']) {
                    img['isFallback'] = true;
                    img.src = CZ.Settings.fallbackImageUri;
                } else {
                    throw "Cannot load an image!";
                }
            };
            this.img.addEventListener("load", onCanvasImageLoad, false);
            if(onload) {
                this.img.addEventListener("load", onload, false);
            }
            this.img.addEventListener("error", onCanvasImageLoadError, false);
            this.img.src = imageSource;
            $('#info-box').addClass('loading');
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                if(!this.img.isLoaded) {
                    return;
                }
                $('#info-box').removeClass('loading');
                var p = viewport2d.pointVirtualToScreen(vx + vw / 2, vy + vh / 2);
                ctx.globalAlpha = opacity;
                var imageScale = size_p.x / this.img.width;
                var imageStrokeWidth = imageScale * 10;
                var imageStrokeColor = 'white';
                ctx.drawImage(this.img, p.x - size_p.x / 2, p.y - size_p.y / 2, size_p.x, size_p.y);
                ctx.beginPath();
                ctx.rect(p.x - size_p.x / 2, p.y - size_p.y / 2, size_p.x, size_p.y);
                ctx.lineWidth = imageStrokeWidth;
                ctx.strokeStyle = imageStrokeColor;
                ctx.stroke();
            };
            this.onRemove = function () {
                this.img.removeEventListener("load", onCanvasImageLoad, false);
                this.img.removeEventListener("error", onCanvasImageLoadError, false);
                if(this.onload) {
                    this.img.removeEventListener("load", this.onload, false);
                }
                this.img.isRemoved = true;
                delete this.img;
            };
            this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
        }
        function CanvasBorderImage(vc, layerid, id, imageSource, vx, vy, vw, vh, onload) {
            this.base = CanvasImage;
            this.base(vc, layerid, id, imageSource, vx, vy, vw, vh, onload);
            this.base_onCanvasImageLoad = this.onCanvasImageLoad;
            var self = this;
            var onCanvasImageLoad = function (s) {
                this.prototype = new CanvasImage(vc, layerid, id, imageSource, vx, vy, vw, vh, onload);
            };
            function CanvasLODImage(vc, layerid, id, imageSources, vx, vy, vw, vh, onload) {
                this.base = CanvasDynamicLOD;
                this.base(vc, layerid, id, vx, vy, vw, vh);
                this.imageSources = imageSources;
                this.changeZoomLevel = function (currentZoomLevel, newZoomLevel) {
                    var n = this.imageSources.length;
                    if(n == 0) {
                        return null;
                    }
                    for(; --n >= 0; ) {
                        if(this.imageSources[n].zoomLevel <= newZoomLevel) {
                            if(this.imageSources[n].zoomLevel === currentZoomLevel) {
                                return null;
                            }
                            return {
                                zoomLevel: this.imageSources[n].zoomLevel,
                                content: new CanvasImage(vc, layerid, id + "@" + this.imageSources[n].zoomLevel, this.imageSources[n].imageSource, vx, vy, vw, vh, onload)
                            };
                        }
                    }
                    return null;
                };
                this.prototype = new CanvasDynamicLOD(vc, layerid, id, vx, vy, vw, vh);
            }
            function CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z) {
                this.base = CanvasElement;
                this.base(vc, layerid, id, vx, vy, vw, vh);
                this.initializeContent = function (content) {
                    this.content = content;
                    if(content) {
                        content.style.position = 'absolute';
                        content.style.overflow = 'hidden';
                        content.style.zIndex = z;
                    }
                };
                this.onIsRenderedChanged = function () {
                    if(!this.content) {
                        return;
                    }
                    if(this.isRendered) {
                        if(!this.content.isAdded) {
                            this.vc.element[0].appendChild(this.content);
                            this.content.isAdded = true;
                        }
                        this.content.style.display = 'block';
                    } else {
                        this.content.style.display = 'none';
                    }
                };
                this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                    if(!this.content) {
                        return;
                    }
                    var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                    var screenTop = 0;
                    var screenBottom = viewport2d.height;
                    var screenLeft = 0;
                    var screenRight = viewport2d.width;
                    var clipRectTop = 0;
                    var clipRectLeft = 0;
                    var clipRectBottom = size_p.y;
                    var clipRectRight = size_p.x;

                    var a1 = screenTop;
                    var a2 = screenBottom;
                    var b1 = p.y;
                    var b2 = p.y + size_p.y;
                    var c1 = Math.max(a1, b1);
                    var c2 = Math.min(a2, b2);
                    if(c1 <= c2) {
                        clipRectTop = c1 - p.y;
                        clipRectBottom = c2 - p.y;
                    }
                    a1 = screenLeft;
                    a2 = screenRight;
                    b1 = p.x;
                    b2 = p.x + size_p.x;
                    c1 = Math.max(a1, b1);
                    c2 = Math.min(a2, b2);
                    if(c1 <= c2) {
                        clipRectLeft = c1 - p.x;
                        clipRectRight = c2 - p.x;
                    }
                    this.content.style.left = p.x + 'px';
                    this.content.style.top = p.y + 'px';
                    this.content.style.width = size_p.x + 'px';
                    this.content.style.height = size_p.y + 'px';
                    this.content.style.clip = 'rect(' + clipRectTop + 'px,' + clipRectRight + 'px,' + clipRectBottom + 'px,' + clipRectLeft + 'px)';
                    this.content.style.opacity = opacity;
                    this.content.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
                };
                this.onRemove = function () {
                    if(!this.content) {
                        return;
                    }
                    try  {
                        if(this.content.isAdded) {
                            if(this.content.src) {
                                this.content.src = "";
                            }
                            this.vc.element[0].removeChild(this.content);
                            this.content.isAdded = false;
                        }
                    } catch (ex) {
                        alert(ex.Description);
                    }
                };
                this.prototype = new CanvasElement(vc, layerid, id, vx, vy, vw, vh);
            }
            function CanvasScrollTextItem(vc, layerid, id, vx, vy, vw, vh, text, z) {
                this.base = CanvasDomItem;
                this.base(vc, layerid, id, vx, vy, vw, vh, z);
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
                this.initializeContent(elem[0]);
                this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                    var fontSize = size_p.y / CZ.Settings.contentItemDescriptionNumberOfLines;
                    elem.css('font-size', fontSize + "px");
                    this.prototype.render.call(this, ctx, visibleBox, viewport2d, size_p, opacity);
                };
                this.onRemove = function () {
                    this.prototype.onRemove.call(this);
                    elem[0].removeEventListener("mousemove", CZ.Common.preventbubble, false);
                    elem[0].removeEventListener("mouseup", CZ.Common.preventbubble, false);
                    elem[0].removeEventListener("mousedown", CZ.Common.preventbubble, false);
                    elem[0].removeEventListener("DOMMouseScroll", CZ.Common.preventbubble, false);
                    elem[0].removeEventListener("mousewheel", CZ.Common.preventbubble, false);
                    elem = undefined;
                };
                this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
            }
            function CanvasPdfItem(vc, layerid, id, pdfSrc, vx, vy, vw, vh, z) {
                this.base = CanvasDomItem;
                this.base(vc, layerid, id, vx, vy, vw, vh, z);
                var elem = document.createElement('iframe');
                elem.setAttribute("id", id);
                if(pdfSrc.indexOf('?') == -1) {
                    pdfSrc += '?wmode=opaque';
                } else {
                    pdfSrc += '&wmode=opaque';
                }
                elem.setAttribute("src", pdfSrc);
                elem.setAttribute("visible", 'true');
                elem.setAttribute("controls", 'true');
                this.initializeContent(elem);
                this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
            }
            function CanvasVideoItem(vc, layerid, id, videoSrc, vx, vy, vw, vh, z) {
                this.base = CanvasDomItem;
                this.base(vc, layerid, id, vx, vy, vw, vh, z);
                var elem = document.createElement('iframe');
                elem.setAttribute("id", id);
                if(videoSrc.indexOf('?') == -1) {
                    videoSrc += '?wmode=opaque';
                } else {
                    videoSrc += '&wmode=opaque';
                }
                elem.setAttribute("src", videoSrc);
                elem.setAttribute("visible", 'true');
                elem.setAttribute("controls", 'true');
                this.initializeContent(elem);
                this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
            }
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
            function SeadragonImage(vc, parent, layerid, id, imageSource, vx, vy, vw, vh, z, onload) {
                var self = this;
                this.base = CanvasDomItem;
                this.base(vc, layerid, id, vx, vy, vw, vh, z);
                this.onload = onload;
                this.nAttempts = 0;
                this.timeoutHandles = [];
                var container = document.createElement('div');
                container.setAttribute("id", id);
                container.setAttribute("style", "color: white");
                this.initializeContent(container);
                this.viewer = new Seadragon.Viewer(container);
                this.viewer.elmt.addEventListener("mousemove", CZ.Common.preventbubble, false);
                this.viewer.elmt.addEventListener("mousedown", CZ.Common.preventbubble, false);
                this.viewer.elmt.addEventListener("DOMMouseScroll", CZ.Common.preventbubble, false);
                this.viewer.elmt.addEventListener("mousewheel", CZ.Common.preventbubble, false);
                this.viewer.addEventListener("open", function (e) {
                    if(self.onload) {
                        self.onload();
                    }
                    self.vc.requestInvalidate();
                });
                this.viewer.addEventListener("resize", function (e) {
                    self.viewer.setDashboardEnabled(e.elmt.clientWidth > 250);
                });
                this.onSuccess = function (resp) {
                    if(resp.error) {
                        self.showFallbackImage();
                        return;
                    }
                    var content = resp.content;
                    if(content.ready) {
                        for(var i = 0; i < self.timeoutHandles.length; i++) {
                            clearTimeout(self.timeoutHandles[i]);
                        }
                        self.viewer.openDzi(content.dzi);
                    } else {
                        if(content.failed) {
                            self.showFallbackImage();
                        } else {
                            if(self.nAttempts < CZ.Settings.seadragonMaxConnectionAttempts) {
                                self.viewer.showMessage("Loading " + Math.round(100 * content.progress) + "% done.");
                                self.timeoutHandles.push(setTimeout(self.requestDZI, CZ.Settings.seadragonRetryInterval));
                            } else {
                                self.showFallbackImage();
                            }
                        }
                    }
                };
                this.onError = function () {
                    if(self.nAttempts < CZ.Settings.seadragonMaxConnectionAttempts) {
                        self.timeoutHandles.push(setTimeout(self.requestDZI, CZ.Settings.seadragonRetryInterval));
                    } else {
                        self.showFallbackImage();
                    }
                };
                this.requestDZI = function () {
                    self.nAttempts++;
                    $.ajax({
                        url: CZ.Settings.seadragonServiceURL + encodeURIComponent(imageSource),
                        dataType: "jsonp",
                        success: self.onSuccess,
                        error: self.onError
                    });
                };
                this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                    if(self.viewer.isFullPage()) {
                        return;
                    }
                    this.prototype.render.call(this, ctx, visibleBox, viewport2d, size_p, opacity);
                    if(self.viewer.viewport) {
                        self.viewer.viewport.resize({
                            x: size_p.x,
                            y: size_p.y
                        });
                        self.viewer.viewport.update();
                    }
                };
                this.onRemove = function () {
                    self.viewer.close();
                    this.prototype.onRemove.call(this);
                };
                this.showFallbackImage = function () {
                    for(var i = 0; i < self.timeoutHandles.length; i++) {
                        clearTimeout(self.timeoutHandles[i]);
                    }
                    self.onRemove();
                    VCContent.removeChild(parent, self.id);
                    VCContent.addImage(parent, layerid, id, vx, vy, vw, vh, imageSource);
                };
                self.requestDZI();
                this.prototype = new CanvasDomItem(vc, layerid, id, vx, vy, vw, vh, z);
            }
        }
        function addTimeline(element, layerid, id, timelineinfo) {
            var width = timelineinfo.timeEnd - timelineinfo.timeStart;
            var timeline = VCContent.addChild(element, new CanvasFixedTimeline(element.vc, layerid, id, timelineinfo.timeStart, timelineinfo.top, width, timelineinfo.height, {
                strokeStyle: timelineinfo.strokeStyle ? timelineinfo.strokeStyle : CZ.Settings.timelineStrokeStyle,
                lineWidth: CZ.Settings.timelineLineWidth,
                depth: timelineinfo.depth,
                fillStyle: timelineinfo.fillStyle,
                opacity: typeof timelineinfo.opacity !== 'undefined' ? timelineinfo.opacity : 1
            }, timelineinfo), true);
            return timeline;
        }
        VCContent.addTimeline = addTimeline;
        function ContentItem(vc, layerid, id, vx, vy, vw, vh, contentItem) {
            this.base = CanvasDynamicLOD;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.guid = contentItem.id;
            this.type = 'contentItem';
            this.contentItem = contentItem;
            var titleHeight = vh * CZ.Settings.contentItemTopTitleHeight * 0.8;
            var mediaHeight = vh * CZ.Settings.contentItemMediaHeight;
            var descrHeight = CZ.Settings.contentItemFontHeight * vh;
            var contentWidth = vw * CZ.Settings.contentItemContentWidth;
            var leftOffset = (vw - contentWidth) / 2;
            var verticalMargin = vh * CZ.Settings.contentItemVerticalMargin;
            var mediaTop = vy + verticalMargin;
            var sourceVertMargin = verticalMargin * 0.4;
            var sourceTop = mediaTop + mediaHeight + sourceVertMargin;
            var sourceRight = vx + vw - leftOffset;
            var sourceHeight = vh * CZ.Settings.contentItemSourceHeight * 0.8;
            var titleTop = sourceTop + verticalMargin + sourceHeight;
            this.reactsOnMouse = true;
            this.isVisible = function (visibleBox_v) {
                var objRight = this.x + this.width;
                var objBottom = this.y + this.height;
                return Math.max(this.x, visibleBox_v.Left) <= Math.min(objRight, visibleBox_v.Right) && Math.max(this.y, visibleBox_v.Top) <= Math.min(objBottom, visibleBox_v.Bottom);
            };
            this.onmouseenter = function (e) {
                this.vc.currentlyHoveredContentItem = this;
                this.vc.requestInvalidate();
            };
            this.onmouseleave = function (e) {
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
                if(newZl >= CZ.Settings.contentItemShowContentZoomLevel) {
                    if(curZl >= CZ.Settings.contentItemShowContentZoomLevel) {
                        return null;
                    }
                    var container = new ContainerElement(vc, layerid, id + "__content", vx, vy, vw, vh);
                    var mediaID = id + "__media__";
                    var imageElem = null;
                    if(this.contentItem.mediaType.toLowerCase() === 'image' || this.contentItem.mediaType.toLowerCase() === 'picture') {
                        imageElem = VCContent.addImage(container, layerid, mediaID, vx + vw / 4, vy + vh / 4, vw / 2, vh / 2, CZ.Settings.eventImageBasePath + CZ.Settings.eventFullResFolder + this.contentItem.uri + '_FullRes.jpg');
                    } else {
                        if(this.contentItem.mediaType.toLowerCase() === 'deepimage') {
                            imageElem = VCContent.addSeadragonImage(container, layerid, mediaID, vx - vw / 4, vy, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex, this.contentItem.uri);
                        } else {
                            if(this.contentItem.mediaType.toLowerCase() === 'video') {
                                VCContent.addVideo(container, layerid, mediaID, this.contentItem.uri, vx + leftOffset, mediaTop, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex);
                            } else {
                                if(this.contentItem.mediaType.toLowerCase() === 'audio') {
                                    mediaTop += CZ.Settings.contentItemAudioTopMargin * vh;
                                    mediaHeight = vh * CZ.Settings.contentItemAudioHeight;
                                    addAudio(container, layerid, mediaID, this.contentItem.uri, vx + leftOffset, mediaTop, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex);
                                } else {
                                    if(this.contentItem.mediaType.toLowerCase() === 'pdf') {
                                        VCContent.addPdf(container, layerid, mediaID, this.contentItem.uri, vx + leftOffset, mediaTop, contentWidth, mediaHeight, CZ.Settings.mediaContentElementZIndex);
                                    }
                                }
                            }
                        }
                    }
                    this.isActive = true;
                    return {
                        zoomLevel: CZ.Settings.contentItemShowContentZoomLevel,
                        content: container
                    };
                } else {
                    this.isActive = false;
                    var container = new ContainerElement(vc, layerid, id + "__content", vx, vy, vw, vh);
                    return {
                        zoomLevel: newZl,
                        content: container
                    };
                }
            };
            this.prototype = new CanvasDynamicLOD(vc, layerid, id, vx, vy, vw, vh);
        }
        function CanvasEvent(vc, layerid, id, vx, vy, vw, contentItems, infodotDescription) {
            var vh = vw;
            var time = vx;
            var vp2d = vc.viewport;
            this.actualWidth = 1;
            this.actualY = 1;
            this.base = CanvasElement;
            this.base(vc, layerid, id, vx, vy, vw, vh);
            this.y = vp2d.heightScreenToVirtual(vp2d.eventRegion / 2);
            this.guid = infodotDescription.guid;
            this.type = 'infodot';
            this.isBuffered = infodotDescription.isBuffered;
            this.contentItem = contentItems[0];
            this.hasContentItems = false;
            this.infodotDescription = infodotDescription;
            this.title = infodotDescription.title;
            this.recentlyActive = false;
            this.titleObject = addEventHeading(this, layerid, id + "__title__", vx, vy + vh / 2, vy + vh / 2, vh, this.contentItem.title, {
                fontName: CZ.Settings.timelineHeaderFontName,
                fillStyle: CZ.Settings.timelineHeaderFontColor,
                textBaseline: 'middle',
                depth: 5,
                timeStart: vx,
                timeEnd: vx + vw
            }, vw);
            this.settings = {
                strokeStyle: CZ.Settings.infoDotBorderColor,
                opacity: 1
            };
            this.screenDimensions = null;
            this.reactsOnMouse = true;
            this.tooltipEnabled = true;
            this.tooltipIsShown = false;
            this.isLoading = true;
            var img = new Image();
            this.img = img;
            this.img.isLoaded = false;
            var self = this;
            var onCanvasImageLoad = function (s) {
                img['isLoading'] = false;
                if(!img['isRemoved']) {
                    if(img.naturalHeight) {
                        var ar0 = self.width / self.height;
                        var ar1 = img.naturalWidth / img.naturalHeight;
                        if(ar0 > ar1) {
                            var imgWidth = self.height / ar0;
                            var offset = (self.width - imgWidth) / 2;
                            self.x += offset;
                            self.width = imgWidth;
                        } else {
                            if(ar0 < ar1) {
                                var imgHeight = self.width / ar1;
                                var offset = (self.height - imgHeight) / 2;
                                self.y += offset;
                                self.height = imgHeight;
                            }
                        }
                    }
                    img['isLoaded'] = true;
                    if(self.onLoad) {
                        self.onLoad();
                    }
                    self.vc.requestInvalidate();
                } else {
                    delete img['isRemoved'];
                    delete img['isLoaded'];
                }
            };
            var onCanvasImageLoadError = function (e) {
                if(!img['isFallback']) {
                    img['isFallback'] = true;
                    img.src = CZ.Settings.fallbackImageUri;
                } else {
                    throw "Cannot load an image!";
                }
            };
            this.img.addEventListener("load", onCanvasImageLoad, false);
            if(onload) {
                this.img.addEventListener("load", onload, false);
            }
            this.img.addEventListener("error", onCanvasImageLoadError, false);
            this.img.src = CZ.Settings.eventImageBasePath + CZ.Settings.eventThumbnailFolder + this.contentItem.uri + '_thumb.jpg';
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
                if(typeof (this.vc.currentlyHoveredInfodot) === 'undefined') {
                    this.vc.currentlyHoveredInfodot = this;
                    this.vc.requestInvalidate();
                }
            };
            this.onmouseclick = function (e) {
                if(typeof (this.vc.currentlyHoveredInfodot) === 'undefined') {
                    return zoomToElementHandler(this.canvasContentItem, e, 0.35);
                } else {
                    return zoomToElementHandler(this.vc.currentlyHoveredInfodot.canvasContentItem, e, 0.35);
                }
            };
            this.onmouseenter = function (e) {
                this.isMouseIn = true;
                var visibleV = {
                    Left: this.x,
                    Right: this.x + this.width,
                    Top: this.y,
                    Bottom: this.y + this.height
                };
                if(this.titleObject.isVisible(visibleV)) {
                    this.tooltipEnabled = false;
                } else {
                    this.tooltipEnabled = true;
                }
                if(typeof (this.vc.currentlyHoveredInfodot) === 'undefined') {
                    this.vc.requestInvalidate();
                    if(this.vc.currentlyHoveredTimeline != null) {
                        CZ.Common.stopAnimationTooltip();
                        this.vc.currentlyHoveredTimeline.tooltipIsShown = false;
                    }
                    $(".bubbleInfo span").text(infodotDescription.title);
                    this.panelWidth = $('.bubbleInfo').outerWidth();
                    this.panelHeight = $('.bubbleInfo').outerHeight();
                    CZ.Common.tooltipMode = "infodot";
                    if((this.tooltipEnabled == true)) {
                        this.tooltipIsShown = true;
                        $(".bubbleInfo").attr("id", "defaultBox");
                        CZ.Common.animationTooltipRunning = $('.bubbleInfo').fadeIn();
                    }
                    this.vc.cursorPosition = vx + vw / 2;
                    this.vc.currentlyHoveredInfodot = this;
                    var count = 0;
                    for(var i = 0; i < this.parent.children.length; i++) {
                        if(this.id == this.parent.children[i].id) {
                            count++;
                        }
                    }
                    if(count < 2) {
                        this.parent.children.push(this);
                    }
                    this.vc._setConstraintsByInfodotHover(this);
                    this.vc.RaiseCursorChanged();
                }
            };
            this.onmouseleave = function (e) {
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
                    if(count > 1) {
                        this.parent.children.splice(indexMatch, 1);
                    }
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
                this.tooltipIsShown = false;
                CZ.Common.tooltipMode = "default";
                this.vc.currentlyHoveredInfodot = undefined;
                this.vc._setConstraintsByInfodotHover(undefined);
                if(otherHoveredInfoDot) {
                    otherHoveredInfoDot.onmouseenter();
                }
                this.vc.RaiseCursorChanged();
            };
            this.checkIfHovered = function () {
                try  {
                    if(this.vc.currentlyHoveredInfodot.id == this.id) {
                        this.settings.strokeStyle = this.titleObject.settings.strokeStyle = CZ.Settings.infoDotHoveredBorderColor;
                        this.settings.opacity = this.titleObject.settings.opacity = this.newOpacity = 1;
                    } else {
                        this.settings.opacity = this.titleObject.settings.opacity = this.newOpacity = 0.1;
                    }
                } catch (ex) {
                    this.settings.strokeStyle = this.titleObject.settings.strokeStyle = CZ.Settings.infoDotBorderColor;
                    this.settings.opacity = this.titleObject.settings.opacity = this.newOpacity = 1;
                }
            };
            var bibliographyFlag = true;
            var self = this;
            this.canvasContentItem = VCContent.addChild(this, new ContentItem(vc, layerid, this.contentItem.id, vx + vw / 2 - vw / 30, vy + vw / 2 - vw / 30, vw / 15, vw / 15, this.contentItem), false);
            this.isVisible = function (visibleBox_v) {
                var visVal = false;
                if(CZ.Viewport.allowVerticalPan) {
                    visVal = this.x < visibleBox_v.Left && this.x + this.width > visibleBox_v.Right;
                } else {
                    var vp2d = vc.viewport;
                    var actualWidth = this.width;
                    if(vp2d.widthVirtualToScreen(this.width) > CZ.Settings.fixedTimelineEventWidth) {
                        actualWidth = vp2d.widthScreenToVirtual(CZ.Settings.fixedTimelineEventWidth);
                    }
                    var middle = this.x + this.width / 2;
                    visVal = middle > visibleBox_v.Left && middle < visibleBox_v.Right;
                }
                if(!visVal) {
                    this.screenDimensions = null;
                }
                return visVal;
            };
            this.render = function (ctx, visibleBox, viewport2d, size_p, opacity) {
                var p = viewport2d.pointVirtualToScreen(this.x, this.y);
                var p2 = viewport2d.pointVirtualToScreen(this.x + this.width, this.y + this.height);
                var scrHeight = viewport2d.heightVirtualToScreen(this.height);
                var left = Math.max(0, p.x);
                var top = Math.max(0, p.y);
                var right = Math.min(viewport2d.width, p2.x);
                var bottom = Math.min(viewport2d.height, p2.y);
                var middle = p.x + (p2.x - p.x) / 2;
                this.checkIfHovered();
                var eventRegion = {
                    top: 0,
                    left: 0,
                    width: viewport2d.width,
                    height: (viewport2d.height - CZ.Settings.fixedTimelineAreaHeight)
                };
                var maxWidth = Math.min(eventRegion.height, CZ.Settings.fixedTimelineEventWidth);
                if((right - left) > maxWidth) {
                    left = middle - maxWidth / 2;
                    right = middle + maxWidth / 2;
                    this.titleObject.showHeading = true;
                } else {
                    this.titleObject.showHeading = false;
                }
                this.screenDimensions = {
                    centerX: left + (right - left) / 2,
                    centerY: p.y + (p2.y - p.y) / 2,
                    radius: (right - left) / 2
                };
                if(left < right && top < bottom) {
                    this.actualWidth = right - left;
                    this.actualY = eventRegion.height / 2;
                    top = (p.y + (p2.y - p.y) / 2 - this.actualWidth / 2);
                    bottom = (p.y + (p2.y - p.y) / 2 + this.actualWidth / 2);
                    var circStroke = ctx.lineWidth = Math.min(this.actualWidth / 150, 1) * 6;
                    var opacity = Math.min(0.1 + this.actualWidth / 100, this.settings.opacity);
                    var eventLineWidth = Math.min(1 + Math.round(this.actualWidth / 200), 2);
                    var triangleBase = 4 + eventLineWidth;
                    var circleBaseY = bottom + circStroke / 2;
                    var triangleOffset = 0;
                    if(eventLineWidth > 1) {
                        triangleOffset = 1;
                    }
                    ctx.globalAlpha = opacity;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(middle, p.y + (p2.y - p.y) / 2, this.actualWidth / 2, 0, Math.PI * 2, true);
                    ctx.clip();
                    ctx.drawImage(this.img, middle - this.actualWidth / 2, p.y + (p2.y - p.y) / 2 - this.actualWidth / 2, this.actualWidth, this.actualWidth);
                    ctx.restore();
                    if(circStroke > 2) {
                        ctx.globalAlpha = opacity;
                        ctx.beginPath();
                        ctx.arc(middle + 3, p.y + (p2.y - p.y) / 2 + 3, this.actualWidth / 2, 0, Math.PI * 2, true);
                        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                        ctx.stroke();
                    }
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(middle, p.y + (p2.y - p.y) / 2, this.actualWidth / 2, 0, Math.PI * 2, true);
                    ctx.strokeStyle = this.settings.strokeStyle;
                    ctx.stroke();
                    ctx.globalAlpha = Math.min(opacity, 0.35);
                    ctx.lineWidth = eventLineWidth;
                    ctx.strokeStyle = this.settings.strokeStyle;
                    ctx.beginPath();
                    ctx.moveTo(middle, circleBaseY + triangleBase - triangleOffset);
                    ctx.lineTo(middle, viewport2d.height - 8);
                    ctx.stroke();
                    ctx.fillStyle = this.settings.strokeStyle;
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.moveTo(middle - triangleBase, circleBaseY);
                    ctx.lineTo(middle, circleBaseY + triangleBase);
                    ctx.lineTo(middle + triangleBase, circleBaseY);
                    ctx.lineTo(middle, circleBaseY - 1);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = this.settings.strokeStyle;
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.moveTo(middle - 8, viewport2d.height);
                    ctx.lineTo(middle, viewport2d.height - 8);
                    ctx.lineTo(middle + 8, viewport2d.height);
                    ctx.closePath();
                    ctx.fill();
                }
            };
            this.onRemove = function () {
                this.img.removeEventListener("load", onCanvasImageLoad, false);
                this.img.removeEventListener("error", onCanvasImageLoadError, false);
                if(this.onload) {
                    this.img.removeEventListener("load", this.onload, false);
                }
                this.img.isRemoved = true;
                delete this.img;
            };
            this.getNextEvent = function () {
                return this.parent.getNextEvent(this);
            };
            this.getPreviousEvent = function () {
                return this.parent.getPreviousEvent(this);
            };
            this.showContentItem = function () {
                if(!CZ.Viewport.lockEvents) {
                    this.recentlyActive = true;
                    $('#info-heading').text(this.contentItem.title);
                    $('#info-date').text(CZ.Dates.convertCoordinateToYearString(this.x + this.width / 2));
                    $('#event-content').html('<p>' + this.contentItem.description + '</p>');
                    $('#info-content').scrollTop(0);
                    $('#event-timeline-label').text(this.parent.title + ' Timeline');
                    $('#event-timeline-link').data('timelineId', this.parent.id);
                    $('#event-timeline-link').attr('href', '#' + this.parent.id);
                    var nextEvent = this.parent.getSiblingEvent(this, true);
                    var prevEvent = this.parent.getSiblingEvent(this, false);
                    if(nextEvent) {
                        $('#event-next-link').data('eventId', nextEvent.id);
                        $('#event-next-link').removeClass('no-event');
                    } else {
                        $('#event-next-link').addClass('no-event');
                    }
                    if(prevEvent) {
                        $('#event-previous-link').data('eventId', prevEvent.id);
                        $('#event-previous-link').removeClass('no-event');
                    } else {
                        $('#event-previous-link').addClass('no-event');
                    }
                    var headerOffset = ($('#info-header').outerHeight() + 33);
                    var totalHeight = $('#info-header').outerHeight(true) + $('#event-content').outerHeight(true) + 16 + 60;
                    var maxHeight = (this.vc.canvasHeight - 104);
                    var contentHeight = Math.min(totalHeight, maxHeight) - headerOffset - 44 + 36;
                    $('#info-content').css('top', headerOffset + 'px');
                    $('#info-content').css('height', contentHeight + 'px');
                    $('#info-box').css({
                        'height': totalHeight + 'px',
                        'max-height': maxHeight + 'px'
                    });
                    setTimeout(function () {
                        $('#info-box').removeClass('info-box-hidden');
                    }, 200);
                    CZ.Viewport.allowVerticalPan = true;
                }
            };
            this.hideContentItem = function () {
                $('#info-box').addClass('info-box-hidden');
                setTimeout(function () {
                    self.recentlyActive = false;
                }, 1000);
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
        function getContentItem(infodot, cid) {
            if(infodot.type !== 'infodot' || infodot.contentItems.length === 0) {
                return null;
            }
            var radv = infodot.width / 2;
            var innerRad = radv - CZ.Settings.infoDotHoveredBorderWidth * radv;
            var citems = buildVcContentItems(infodot.contentItems, infodot.x + infodot.width / 2, infodot.y + infodot.height / 2, innerRad, infodot.vc, infodot.layerid);
            if(!citems) {
                return null;
            }
            for(var i = 0; i < citems.length; i++) {
                if(citems[i].id == cid) {
                    return {
                        id: cid,
                        x: citems[i].x,
                        y: citems[i].y,
                        width: citems[i].width,
                        height: citems[i].height,
                        parent: infodot,
                        type: "contentItem",
                        vc: infodot.vc
                    };
                }
            }
            return null;
        }
        VCContent.getContentItem = getContentItem;
        function addEvent(element, layerid, id, time, vyc, radv, contentItems, infodotDescription) {
            var eventItem = new CanvasEvent(element.vc, layerid, id, time, vyc, radv, contentItems, infodotDescription);
            return VCContent.addChild(element, eventItem, true);
        }
        VCContent.addEvent = addEvent;
        function buildVcContentItems(contentItems, xc, yc, rad, vc, layerid) {
            var n = contentItems.length;
            if(n <= 0) {
                return null;
            }
            var _rad = 450 / 2;
            var k = 1 / _rad;
            var _wc = 260 * k;
            var _hc = 270 * k;
            var _xlc = -_wc / 2 - 38 * k;
            var _xrc = -_xlc;
            var _lw = 60 * k;
            var _lh = _lw;
            var lw = _lw * rad;
            var lh = _lh * rad;
            var _ytc = -_hc / 2 - 9 * k - _lh / 2;
            var _ybc = -_ytc;
            var arrangeLeft = arrangeContentItemsInField(3, _lh);
            var arrangeRight = arrangeContentItemsInField(3, _lh);
            var arrangeBottom = arrangeContentItemsInField(3, _lw);
            var xl = xc + rad * (_xlc - _lw / 2);
            var xr = xc + rad * (_xrc - _lw / 2);
            var yb = yc + rad * (_ybc - _lh / 2);
            var vcitems = [];
            for(var i = 0, len = Math.min(10, n); i < len; i++) {
                var ci = contentItems[i];
                ci.date = xc + rad / 2;
                if(i === 0) {
                    vcitems.push(new ContentItem(vc, layerid, ci.id, xc - rad, yc - rad, rad * 2, rad * 2, ci));
                } else {
                    if(i >= 1 && i <= 3) {
                        vcitems.push(new ContentItem(vc, layerid, ci.id, xl, yc + rad * arrangeLeft[(i - 1) % 3], lw, lh, ci));
                    } else {
                        if(i >= 4 && i <= 6) {
                            vcitems.push(new ContentItem(vc, layerid, ci.id, xr, yc + rad * arrangeRight[(i - 1) % 3], lw, lh, ci));
                        } else {
                            if(i >= 7 && i <= 9) {
                                vcitems.push(new ContentItem(vc, layerid, ci.id, xc + rad * arrangeBottom[(i - 1) % 3], yb, lw, lh, ci));
                            }
                        }
                    }
                }
            }
            return vcitems;
        }
        function arrangeContentItemsInField(n, dx) {
            if(n == 0) {
                return null;
            }
            var margin = 0.05 * dx;
            var x1;
            var x2;
            var x3;
            var x4;

            if(n % 2 == 0) {
                x1 = -margin / 2 - dx;
                x2 = margin / 2;
                if(n == 4) {
                    x3 = x1 - dx - margin;
                    x4 = x2 + margin + dx;
                    return [
                        x3, 
                        x1, 
                        x2, 
                        x4
                    ];
                }
                return [
                    x1, 
                    x2
                ];
            } else {
                x1 = -dx / 2;
                if(n > 1) {
                    x2 = dx / 2 + margin;
                    x3 = x1 - dx - margin;
                    return [
                        x3, 
                        x1, 
                        x2
                    ];
                }
                return [
                    x1
                ];
            }
        }
    })(CZ.VCContent || (CZ.VCContent = {}));
    var VCContent = CZ.VCContent;

})(CZ || (CZ = {}));

