/// <reference path='settings.ts'/>
/// <reference path='common.ts'/>
/// <reference path='timescale.ts'/>
/// <reference path='viewport-controller.ts'/>
/// <reference path='gestures.ts'/>
/// <reference path='virtual-canvas.ts'/>
/// <reference path='typings/jquery/jquery.d.ts'/>


module CZ {
    export var timeSeriesChart: CZ.UI.LineChart;
    export var leftDataSet: CZ.Data.DataSet;
    export var rightDataSet: CZ.Data.DataSet; 

    export module HomePageViewModel {
        // Contains mapping: CSS selector -> html file.
        var _uiMap = {
            "$('<div></div>')": "/ui/contentitem-listbox.html"
        };

        export enum FeatureActivation {
            Enabled,
            Disabled,
            RootCollection,
            NotRootCollection,
        }

        export interface FeatureInfo {
            Name: string;
            Activation: FeatureActivation;
            JQueryReference: string;
            IsEnabled: bool;
        }

        // Basic Flight-Control (Tracks the features that are enabled)
        //
        // FEATURES CAN ONLY BE ACTIVATED IN ROOTCOLLECTION AFTER HITTING ZERO ACTIVE BUGS.
        //
        // REMOVING THIS COMMENT OR BYPASSING THIS CHECK MAYBE BRING YOU BAD KARMA, ITS TRUE.
        //
        var _featureMap: FeatureInfo[] = [
            {
                Name: "Login",
                Activation: FeatureActivation.Disabled,
                JQueryReference: "#login-panel"
            },
            {
                Name: "Search",
                Activation: FeatureActivation.Disabled,
                JQueryReference: "#search-button"
            },
            {
                Name: "Tours",
                Activation: FeatureActivation.Disabled,
                JQueryReference: "#tours-index"
            },
            {
                Name: "Authoring",
                Activation: FeatureActivation.Disabled,
                JQueryReference: ".header-icon.edit-icon"
            },
            {
                Name: "WelcomeScreen",
                Activation: FeatureActivation.Disabled,
                JQueryReference: "#welcomeScreenBack"
            },
            {
                Name: "Regimes",
                Activation: FeatureActivation.RootCollection,
                JQueryReference: ".regime-link"
            },
            {
                Name: "TimeSeries",
                Activation: FeatureActivation.Disabled,
                JQueryReference: "#timeSeriesContainer"
            },
        ];

        var defaultRootTimeline = { title: "My Timeline", x: 1950, endDate: 9999, children: [], parent: { guid: null } };

        $(document).ready(function () {
            //Ensures there will be no 'console is undefined' errors
            // LANE : Removed console thing

            $('.bubbleInfo').hide();
            var canvasIsEmpty;

            CZ.Common.initialize();
            /*
            CZ.Service.getServiceInformation().then(
                function (response) {
                    CZ.Settings.contentItemThumbnailBaseUri = response.thumbnailsPath;
                });
            */
            var url = CZ.UrlNav.getURL();
            var rootCollection = url.superCollectionName === undefined;
            CZ.Service.superCollectionName = url.superCollectionName;
            CZ.Service.collectionName = url.collectionName;
            CZ.Common.initialContent = url.content;


            $('#breadcrumbs-nav-left')
                .click(CZ.BreadCrumbs.breadCrumbNavLeft);
            $('#breadcrumbs-nav-right')
                .click(CZ.BreadCrumbs.breadCrumbNavRight);


            $('#biblCloseButton')
                .mouseout(() => { CZ.Common.toggleOffImage('biblCloseButton', 'png'); })
                .mouseover(() => { CZ.Common.toggleOnImage('biblCloseButton', 'png'); })

            $('#welcomeScreenCloseButton')
                .mouseover(() => { CZ.Common.toggleOnImage('welcomeScreenCloseButton', 'png'); })
                .mouseout(() => { CZ.Common.toggleOffImage('welcomeScreenCloseButton', 'png'); })
                .click(CZ.Common.startExploring);
            $('#welcomeScreenStartButton')
                .click(CZ.Common.startExploring);

            var wlcmScrnCookie = CZ.Common.getCookie("welcomeScreenDisallowed");
            if (wlcmScrnCookie != null) {
                CZ.Common.hideWelcomeScreen();
            }
            else {
                // click on gray area hides welcome screen
                $("#welcomeScreenOut").click(function (e) {
                    e.stopPropagation();
                });

                $("#welcomeScreenBack").click(function () {
                    CZ.Common.startExploring();
                });
            }

            // Feature activation control
            for (var idxFeature = 0; idxFeature < _featureMap.length; idxFeature++) {
                var enabled: bool = true;
                var feature = _featureMap[idxFeature];

                if (feature.Activation === FeatureActivation.Disabled) {
                    enabled = false;
                }

                if (feature.Activation === FeatureActivation.NotRootCollection && rootCollection) {
                    enabled = false;
                }

                if (feature.Activation === FeatureActivation.RootCollection && !rootCollection) {
                    enabled = false;
                }

                _featureMap[idxFeature].IsEnabled = enabled;
                if (!enabled) {
                    $(feature.JQueryReference).css("display", "none");
                }
            }

            if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
                // Suppress the default iOS elastic pan/zoom actions.
                document.addEventListener('touchmove', function (e) { e.preventDefault(); });
            }
            if (navigator.userAgent.indexOf('Mac') != -1) {
                // Disable Mac OS Scrolling Bounce Effect
                var body = document.getElementsByTagName('body')[0];
                (<any>body).style.overflow = "hidden";
            }

            CZ.Common.maxPermitedVerticalRange = { top: 0, bottom: 10000000 }; //temporary value until there is no data

            if (window.location.hash)
                CZ.Common.startHash = window.location.hash; // to be processes after the data is loaded

            CZ.Common.loadData().then(function (response) {
                if (!response) {
                    canvasIsEmpty = true;
                }
            }); //retrieving the data

            CZ.Search.initializeSearch();
            CZ.Bibliography.initializeBibliography();

            var canvasGestures = CZ.Gestures.getGesturesStream(CZ.Common.vc); //gesture sequence of the virtual canvas
            var axisGestures = CZ.Gestures.applyAxisBehavior(CZ.Gestures.getGesturesStream(CZ.Common.ax)); //gesture sequence of axis (tranformed according to axis behavior logic)
            var jointGesturesStream = canvasGestures.Merge(axisGestures);

            CZ.Common.controller = new CZ.ViewportController.ViewportController2(
                            function (visible) {
                                var vp = CZ.Common.vc.virtualCanvas("getViewport");
                                var markerPos = CZ.Common.axis.MarkerPosition();
                                var oldMarkerPosInScreen = vp.pointVirtualToScreen(markerPos, 0).x;

                                CZ.Common.vc.virtualCanvas("setVisible", visible, CZ.Common.controller.activeAnimation);
                                CZ.Common.updateAxis(CZ.Common.vc, CZ.Common.ax);
                                vp = CZ.Common.vc.virtualCanvas("getViewport");

                                var hoveredInfodot = CZ.Common.vc.virtualCanvas("getHoveredInfodot");
                                var actAni = CZ.Common.controller.activeAnimation != undefined;

                                if (actAni && !hoveredInfodot.id) {
                                    var newMarkerPos = vp.pointScreenToVirtual(oldMarkerPosInScreen, 0).x;
                                    CZ.Common.updateMarker();
                                }
                            },
                            function () {
                                return CZ.Common.vc.virtualCanvas("getViewport");
                            },
                            jointGesturesStream);

            var hashChangeFromOutside = true; // True if url is changed externally

            // URL Nav: update URL when animation is complete
            CZ.Common.controller.onAnimationComplete.push(function (id) {
                hashChangeFromOutside = false;
                if (CZ.Common.setNavigationStringTo && CZ.Common.setNavigationStringTo.bookmark) { // go to search result
                    CZ.UrlNav.navigationAnchor = CZ.UrlNav.navStringTovcElement(CZ.Common.setNavigationStringTo.bookmark, CZ.Common.vc.virtualCanvas("getLayerContent"));
                    window.location.hash = CZ.Common.setNavigationStringTo.bookmark;
                }
                else {
                    if (CZ.Common.setNavigationStringTo && CZ.Common.setNavigationStringTo.id == id)
                        CZ.UrlNav.navigationAnchor = CZ.Common.setNavigationStringTo.element;

                    var vp = CZ.Common.vc.virtualCanvas("getViewport");
                    window.location.hash = CZ.UrlNav.vcelementToNavString(CZ.UrlNav.navigationAnchor, vp);
                }
                CZ.Common.setNavigationStringTo = null;
            });

            // URL Nav: handle URL changes from outside
            window.addEventListener("hashchange", function () {
                if (window.location.hash && hashChangeFromOutside && CZ.Common.hashHandle) {
                    var hash = window.location.hash;
                    var visReg = CZ.UrlNav.navStringToVisible(window.location.hash.substring(1), CZ.Common.vc);
                    if (visReg) {
                        CZ.Common.isAxisFreezed = true;
                        CZ.Common.controller.moveToVisible(visReg, true);
                        // to make sure that the hash is correct (it can be incorrectly changed in onCurrentlyObservedInfodotChanged)
                        if (window.location.hash != hash) {
                            hashChangeFromOutside = false;
                            window.location.hash = hash;
                        }
                    }
                    CZ.Common.hashHandle = true;
                } else
                    hashChangeFromOutside = true;
            });


            // Axis: enable showing thresholds
            CZ.Common.controller.onAnimationComplete.push(function () {
                CZ.Viewport.lockEvents = false;
                if(typeof(CZ.Common.centerActiveEvent) !== 'undefined') {
                    if(CZ.Common.centerActiveEvent.canvasContentItem.isActive)
                        CZ.Common.centerActiveEvent.showContentItem();
                }
                    
                //CZ.Common.ax.axis("enableThresholds", true);
                //if (window.console && console.log("thresholds enabled"));

            });
            //Axis: disable showing thresholds
            CZ.Common.controller.onAnimationStarted.push(function () {
                //console.log('locking');
                
                //CZ.Common.ax.axis("enableThresholds", true);
                //if (window.console && console.log("thresholds disabled"));
            });
            // Axis: enable showing thresholds
            CZ.Common.controller.onAnimationUpdated.push(function (oldId, newId) {
                if (oldId != undefined && newId == undefined) { // animation interrupted
                    CZ.Viewport.lockEvents = false;
                    //setTimeout(function () {
                        //CZ.Common.ax.axis("enableThresholds", true);
                        //if (window.console && console.log("thresholds enabled"));
                    //}, 500);
                }
            });

            CZ.Common.updateLayout();

            CZ.Common.vc.bind("elementclick", function (e) {
                CZ.Search.navigateToElement(e);
            });

            CZ.Common.vc.bind('cursorPositionChanged', function (cursorPositionChangedEvent) {
                CZ.Common.updateMarker();
            });

            CZ.Common.ax.bind('thresholdBookmarkChanged', function (thresholdBookmark) {
                var bookmark = CZ.UrlNav.navStringToVisible(thresholdBookmark.Bookmark, CZ.Common.vc);
                if (bookmark != undefined) {
                    CZ.Common.controller.moveToVisible(bookmark, false);
                }
            });

            // Reacting on the event when one of the infodot exploration causes inner zoom constraint
            CZ.Common.vc.bind("innerZoomConstraintChanged", function (constraint) {
                CZ.Common.controller.effectiveExplorationZoomConstraint = constraint.zoomValue; // applying the constraint
                CZ.Common.axis.allowMarkerMovesOnHover = !constraint.zoomValue;
            });

            CZ.Common.vc.bind("breadCrumbsChanged", function (breadCrumbsEvent) { //reacting on the event when the first timeline that contains whole visible region is changed
                CZ.BreadCrumbs.updateBreadCrumbsLabels(breadCrumbsEvent.breadCrumbs);
            });

            $(window).bind('resize', function () {
                CZ.Common.updateLayout();

                //updating timeSeries chart
                var vp = CZ.Common.vc.virtualCanvas("getViewport");
            });

            var vp = CZ.Common.vc.virtualCanvas("getViewport");
            CZ.Common.vc.virtualCanvas("setVisible", CZ.VCContent.getVisibleForElement({
                x: -13700000000,
                y: 0,
                width: 13700000000,
                height: 5535444444.444445
            }, 1.0, vp, false), true);
            CZ.Common.updateAxis(CZ.Common.vc, CZ.Common.ax);

            var bid = window.location.hash.match("b=([a-z0-9_]+)");
            if (bid) {
                //bid[0] - source string
                //bid[1] - found match
                $("#bibliography .sources").empty();
                $("#bibliography .title").append($("<span></span>", {
                    text: "Loading..."
                }));
                $("#bibliographyBack").css("display", "block");
            }
        });

        export function IsFeatureEnabled(featureMap: FeatureInfo[], featureName: string) {
            var feature: FeatureInfo[] = $.grep(featureMap, function (e) { return e.Name === featureName; });
            return feature[0].IsEnabled;
        }

		function closeAllForms() {
            $('.cz-major-form').each((i, f) => { var form = $(f).data('form'); if (form) { form.close(); } });
                     
        }

        function getFormById(name) {
            var form = $(name).data("form");
            if (form)
                return form;
            else
                return false;
        }
        

        //export function FitToTimeSeriesData(vp) {
        //    if (rightDataSet === undefined && leftDataSet === undefined)
        //        return;

        //    var leftX = Number.MAX_VALUE, rightX = Number.MAX_VALUE;
        //    if (rightDataSet != undefined) {
        //        leftX = rightDataSet.time[0];
        //        rightX = rightDataSet.time[rightDataSet.time.length - 1];
        //    }

        //    if (leftDataSet != undefined) {
        //        if (leftDataSet.time[0] < leftX)
        //            leftX = leftDataSet.time[0];
        //        if (leftDataSet.time[leftDataSet.time.length - 1] > rightX)
        //            rightX = leftDataSet.time[leftDataSet.time.length - 1];
        //    }

        //    if (leftX < CZ.Settings.maxPermitedTimeRange.left) leftX = CZ.Settings.maxPermitedTimeRange.left;
        //    if (rightX > CZ.Settings.maxPermitedTimeRange.right) rightX = CZ.Settings.maxPermitedTimeRange.right;

        //    CZ.Common.controller.moveToVisible(visible);
        //}
    }
}
