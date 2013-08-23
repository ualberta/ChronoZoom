var CZ;
(function (CZ) {
    CZ.timeSeriesChart;
    CZ.leftDataSet;
    CZ.rightDataSet;
    (function (HomePageViewModel) {
        var _uiMap = {
            "$('<div></div>')": "/ui/contentitem-listbox.html"
        };
        (function (FeatureActivation) {
            FeatureActivation._map = [];
            FeatureActivation._map[0] = "Enabled";
            FeatureActivation.Enabled = 0;
            FeatureActivation._map[1] = "Disabled";
            FeatureActivation.Disabled = 1;
            FeatureActivation._map[2] = "RootCollection";
            FeatureActivation.RootCollection = 2;
            FeatureActivation._map[3] = "NotRootCollection";
            FeatureActivation.NotRootCollection = 3;
        })(HomePageViewModel.FeatureActivation || (HomePageViewModel.FeatureActivation = {}));
        var FeatureActivation = HomePageViewModel.FeatureActivation;

        var _featureMap = [
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
        var defaultRootTimeline = {
            title: "My Timeline",
            x: 1950,
            endDate: 9999,
            children: [],
            parent: {
                guid: null
            }
        };
        $(document).ready(function () {
            $('.bubbleInfo').hide();
            var canvasIsEmpty;
            CZ.Common.initialize();
            var url = CZ.UrlNav.getURL();
            var rootCollection = url.superCollectionName === undefined;
            CZ.Service.superCollectionName = url.superCollectionName;
            CZ.Service.collectionName = url.collectionName;
            CZ.Common.initialContent = url.content;
            $('#breadcrumbs-nav-left').click(CZ.BreadCrumbs.breadCrumbNavLeft);
            $('#breadcrumbs-nav-right').click(CZ.BreadCrumbs.breadCrumbNavRight);
            $('#biblCloseButton').mouseout(function () {
                CZ.Common.toggleOffImage('biblCloseButton', 'png');
            }).mouseover(function () {
                CZ.Common.toggleOnImage('biblCloseButton', 'png');
            });
            $('#welcomeScreenCloseButton').mouseover(function () {
                CZ.Common.toggleOnImage('welcomeScreenCloseButton', 'png');
            }).mouseout(function () {
                CZ.Common.toggleOffImage('welcomeScreenCloseButton', 'png');
            }).click(CZ.Common.startExploring);
            $('#welcomeScreenStartButton').click(CZ.Common.startExploring);
            var wlcmScrnCookie = CZ.Common.getCookie("welcomeScreenDisallowed");
            if(wlcmScrnCookie != null) {
                CZ.Common.hideWelcomeScreen();
            } else {
                $("#welcomeScreenOut").click(function (e) {
                    e.stopPropagation();
                });
                $("#welcomeScreenBack").click(function () {
                    CZ.Common.startExploring();
                });
            }
            for(var idxFeature = 0; idxFeature < _featureMap.length; idxFeature++) {
                var enabled = true;
                var feature = _featureMap[idxFeature];
                if(feature.Activation === FeatureActivation.Disabled) {
                    enabled = false;
                }
                if(feature.Activation === FeatureActivation.NotRootCollection && rootCollection) {
                    enabled = false;
                }
                if(feature.Activation === FeatureActivation.RootCollection && !rootCollection) {
                    enabled = false;
                }
                _featureMap[idxFeature].IsEnabled = enabled;
                if(!enabled) {
                    $(feature.JQueryReference).css("display", "none");
                }
            }
            if(navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
                document.addEventListener('touchmove', function (e) {
                    e.preventDefault();
                });
            }
            if(navigator.userAgent.indexOf('Mac') != -1) {
                var body = document.getElementsByTagName('body')[0];
                (body).style.overflow = "hidden";
            }
            Seadragon.Config.imagePath = CZ.Settings.seadragonImagePath;
            CZ.Common.maxPermitedVerticalRange = {
                top: 0,
                bottom: 10000000
            };
            if(window.location.hash) {
                CZ.Common.startHash = window.location.hash;
            }
            CZ.Common.loadData().then(function (response) {
                if(!response) {
                    canvasIsEmpty = true;
                }
            });
            CZ.Search.initializeSearch();
            CZ.Bibliography.initializeBibliography();
            var canvasGestures = CZ.Gestures.getGesturesStream(CZ.Common.vc);
            var axisGestures = CZ.Gestures.applyAxisBehavior(CZ.Gestures.getGesturesStream(CZ.Common.ax));
            var jointGesturesStream = canvasGestures.Merge(axisGestures);
            CZ.Common.controller = new CZ.ViewportController.ViewportController2(function (visible) {
                var vp = CZ.Common.vc.virtualCanvas("getViewport");
                var markerPos = CZ.Common.axis.MarkerPosition();
                var oldMarkerPosInScreen = vp.pointVirtualToScreen(markerPos, 0).x;
                CZ.Common.vc.virtualCanvas("setVisible", visible, CZ.Common.controller.activeAnimation);
                CZ.Common.updateAxis(CZ.Common.vc, CZ.Common.ax);
                vp = CZ.Common.vc.virtualCanvas("getViewport");
                var hoveredInfodot = CZ.Common.vc.virtualCanvas("getHoveredInfodot");
                var actAni = CZ.Common.controller.activeAnimation != undefined;
                if(actAni && !hoveredInfodot.id) {
                    var newMarkerPos = vp.pointScreenToVirtual(oldMarkerPosInScreen, 0).x;
                    CZ.Common.updateMarker();
                }
            }, function () {
                return CZ.Common.vc.virtualCanvas("getViewport");
            }, jointGesturesStream);
            var hashChangeFromOutside = true;
            CZ.Common.controller.onAnimationComplete.push(function (id) {
                hashChangeFromOutside = false;
                if(CZ.Common.setNavigationStringTo && CZ.Common.setNavigationStringTo.bookmark) {
                    CZ.UrlNav.navigationAnchor = CZ.UrlNav.navStringTovcElement(CZ.Common.setNavigationStringTo.bookmark, CZ.Common.vc.virtualCanvas("getLayerContent"));
                    window.location.hash = CZ.Common.setNavigationStringTo.bookmark;
                } else {
                    if(CZ.Common.setNavigationStringTo && CZ.Common.setNavigationStringTo.id == id) {
                        CZ.UrlNav.navigationAnchor = CZ.Common.setNavigationStringTo.element;
                    }
                    var vp = CZ.Common.vc.virtualCanvas("getViewport");
                    window.location.hash = CZ.UrlNav.vcelementToNavString(CZ.UrlNav.navigationAnchor, vp);
                }
                CZ.Common.setNavigationStringTo = null;
            });
            window.addEventListener("hashchange", function () {
                if(window.location.hash && hashChangeFromOutside && CZ.Common.hashHandle) {
                    var hash = window.location.hash;
                    var visReg = CZ.UrlNav.navStringToVisible(window.location.hash.substring(1), CZ.Common.vc);
                    if(visReg) {
                        CZ.Common.isAxisFreezed = true;
                        CZ.Common.controller.moveToVisible(visReg, true);
                        if(window.location.hash != hash) {
                            hashChangeFromOutside = false;
                            window.location.hash = hash;
                        }
                    }
                    CZ.Common.hashHandle = true;
                } else {
                    hashChangeFromOutside = true;
                }
            });
            CZ.Common.controller.onAnimationComplete.push(function () {
            });
            CZ.Common.controller.onAnimationStarted.push(function () {
            });
            CZ.Common.controller.onAnimationUpdated.push(function (oldId, newId) {
                if(oldId != undefined && newId == undefined) {
                    setTimeout(function () {
                    }, 500);
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
                if(bookmark != undefined) {
                    CZ.Common.controller.moveToVisible(bookmark, false);
                }
            });
            CZ.Common.vc.bind("innerZoomConstraintChanged", function (constraint) {
                CZ.Common.controller.effectiveExplorationZoomConstraint = constraint.zoomValue;
                CZ.Common.axis.allowMarkerMovesOnHover = !constraint.zoomValue;
            });
            CZ.Common.vc.bind("breadCrumbsChanged", function (breadCrumbsEvent) {
                CZ.BreadCrumbs.updateBreadCrumbsLabels(breadCrumbsEvent.breadCrumbs);
            });
            $(window).bind('resize', function () {
                CZ.Common.updateLayout();
                var vp = CZ.Common.vc.virtualCanvas("getViewport");
            });
            var vp = CZ.Common.vc.virtualCanvas("getViewport");
            CZ.Common.vc.virtualCanvas("setVisible", CZ.VCContent.getVisibleForElement({
                x: -13700000000,
                y: 0,
                width: 13700000000,
                height: 5535444444.444445
            }, 1, vp, false), true);
            CZ.Common.updateAxis(CZ.Common.vc, CZ.Common.ax);
            var bid = window.location.hash.match("b=([a-z0-9_]+)");
            if(bid) {
                $("#bibliography .sources").empty();
                $("#bibliography .title").append($("<span></span>", {
                    text: "Loading..."
                }));
                $("#bibliographyBack").css("display", "block");
            }
        });
        function IsFeatureEnabled(featureMap, featureName) {
            var feature = $.grep(featureMap, function (e) {
                return e.Name === featureName;
            });
            return feature[0].IsEnabled;
        }
        HomePageViewModel.IsFeatureEnabled = IsFeatureEnabled;
        function closeAllForms() {
            $('.cz-major-form').each(function (i, f) {
                var form = $(f).data('form');
                if(form) {
                    form.close();
                }
            });
        }
        function getFormById(name) {
            var form = $(name).data("form");
            if(form) {
                return form;
            } else {
                return false;
            }
        }
    })(CZ.HomePageViewModel || (CZ.HomePageViewModel = {}));
    var HomePageViewModel = CZ.HomePageViewModel;

})(CZ || (CZ = {}));

