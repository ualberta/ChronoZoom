var CZ;
(function (CZ) {
    (function (Settings) {
        Settings.czDataSource = 'db';
        Settings.czVersion = "main";
        Settings.ellipticalZoomZoomoutFactor = 0.5;
        Settings.ellipticalZoomDuration = 9000;
        Settings.panSpeedFactor = 3;
        Settings.zoomSpeedFactor = 2;
        Settings.zoomLevelFactor = 1.4;
        Settings.allowedVisibileImprecision = 0.00001;
        Settings.allowedMathImprecision = 1e-7;
        Settings.canvasElementAnimationTime = 1300;
        Settings.canvasElementFadeInTime = 400;
        Settings.contentScaleMargin = 20;
        Settings.renderThreshold = 2;
        Settings.targetFps = 60;
        Settings.hoverAnimationSeconds = 2;
        Settings.fallbackImageUri = '/images/Temp-Thumbnail2.png';
        Settings.timelineHeaderMargin = -1 / 10;
        Settings.timelineHeaderSize = 1 / 4;
        Settings.timelineTooltipMaxHeaderSize = 10;
        Settings.timelineHeaderFontName = 'OSPDIN';
        Settings.timelineHeaderFontColor = 'rgb(232,232,232)';
        Settings.timelineHoveredHeaderFontColor = 'white';
        Settings.timelineStrokeStyle = 'rgb(232,232,232)';
        Settings.timelineLineWidth = 1;
        Settings.timelineHoveredLineWidth = 1;
        Settings.timelineMinAspect = 0.75;
        Settings.timelineContentMargin = 0.01;
        Settings.timelineBorderColor = 'rgb(232,232,232)';
        Settings.timelineHoveredBoxBorderColor = 'rgb(232,232,232)';
        Settings.timelineBreadCrumbBorderOffset = 50;
        Settings.timelineCenterOffsetAcceptableImplicity = 0.00001;
        Settings.timelineEndTicks = 8;
        Settings.fixedTimelineHeight = 34;
        Settings.fixedTimelineOffset = 20;
        Settings.fixedTimelineFontMap = [
            0, 
            21, 
            18, 
            16, 
            14, 
            12, 
            12, 
            12, 
            12
        ];
        Settings.fixedTimelineHeightMap = [
            62, 
            50, 
            40, 
            42, 
            36, 
            32, 
            30
        ];
        Settings.fixedTimelineHeadingThreshold = 100;
        Settings.fixedTimelineAreaHeight = 250;
        Settings.timelineFixedHeadingWidth = 120;
        Settings.fixedTimelineTooltipThreshold = 30;
        Settings.fixedTimelineEventWidth = 200;
        Settings.eventImageBasePath = 'http://d101.loc/';
        Settings.eventFullResFolder = 'Events/';
        Settings.eventThumbnailFolder = 'Events/thumbs/';
        Settings.fixedEventSizeMap = [
            293700000, 
            293700000, 
            293700000, 
            12500000, 
            12500000, 
            12500000
        ];
        Settings.fixedEventUnfocusedOpacity = 0.1;
        Settings.fixedContentSizeMap = [];
        Settings.infodotShowContentZoomLevel = 11;
        Settings.infodotShowContentThumbZoomLevel = 2;
        Settings.infoDotHoveredBorderWidth = 0;
        Settings.infoDotBorderWidth = 0;
        Settings.infodotTitleWidth = 200 / 489;
        Settings.infodotTitleHeight = 60 / 489;
        Settings.infodotBibliographyHeight = 10 / 489;
        Settings.infoDotBorderColor = '#ffffff';
        Settings.infoDotHoveredBorderColor = '#ffdb05';
        Settings.infoDotFillColor = 'rgb(92,92,92)';
        Settings.infoDotTinyContentImageUri = '/images/tinyContent.png';
        Settings.infodotMaxContentItemsCount = 10;
        Settings.mediaContentElementZIndex = 100;
        Settings.contentItemDescriptionNumberOfLines = 18;
        Settings.contentItemShowContentZoomLevel = 10;
        Settings.contentItemThumbnailMinLevel = 4;
        Settings.contentItemThumbnailMaxLevel = 7;
        Settings.contentItemThumbnailBaseUri = 'http://czbeta.blob.core.windows.net/images/';
        Settings.contentItemImageBaseUri = 'http://www.ualberta.ca/~lolson/Images/';
        Settings.contentItemTopTitleHeight = 47 / 540;
        Settings.contentItemContentWidth = 680 / 520;
        Settings.contentItemVerticalMargin = 13 / 540;
        Settings.contentItemMediaHeight = 260 / 540;
        Settings.contentItemSourceHeight = 10 / 540;
        Settings.contentItemSourceFontColor = 'rgb(232,232,232)';
        Settings.contentItemSourceHoveredFontColor = 'white';
        Settings.contentItemAudioHeight = 40 / 540;
        Settings.contentItemAudioTopMargin = 120 / 540;
        Settings.contentItemFontHeight = 300 / 540;
        Settings.contentItemHeaderFontName = 'Arial';
        Settings.contentItemHeaderFontColor = 'white';
        Settings.contentItemBoundingBoxBorderWidth = 13 / 520;
        Settings.contentItemBoundingBoxFillColor = 'rgba(255,255,0,0.2)';
        Settings.contentItemBoundingBoxBorderColor = 'white';
        Settings.contentItemBoundingHoveredBoxBorderColor = 'red';
        Settings.contentAppearanceAnimationStep = 0.01;
        Settings.infoDotZoomConstraint = 0.005;
        Settings.infoDotAxisFreezeThreshold = 0.75;
        Settings.maxPermitedTimeRange = {
            left: -4600000000,
            right: 0
        };
        Settings.deeperZoomConstraints = [
            {
                left: -4599999999,
                right: -542000000,
                scale: 1000
            }, 
            {
                left: -542000000,
                right: -1000000,
                scale: 1
            }, 
            {
                left: -1000000,
                right: -12000,
                scale: 0.001
            }, 
            {
                left: -12000,
                right: 0,
                scale: 0.00006
            }
        ];
        Settings.maxTickArrangeIterations = 3;
        Settings.spaceBetweenLabels = 15;
        Settings.spaceBetweenSmallTicks = 10;
        Settings.tickLength = 14;
        Settings.smallTickLength = 7;
        Settings.strokeWidth = 3;
        Settings.thresholdHeight = 10;
        Settings.thresholdWidth = 8;
        Settings.thresholdColors = [
            'rgb(0, 232, 255)', 
            'rgb(0, 232, 255)', 
            'rgb(220,123,154)', 
            'rgb(71,168,168)', 
            'rgb(95,187,71)', 
            'rgb(242,103,63)', 
            'rgb(247,144,63)', 
            'rgb(251,173,45)'
        ];
        Settings.thresholdTextColors = [
            'rgb(36,1,56)', 
            'rgb(60,31,86)', 
            'rgb(85,33,85)', 
            'rgb(0,56,100)', 
            'rgb(0,73,48)', 
            'rgb(125,25,33)', 
            'rgb(126,51,0)', 
            'rgb(92,70,14)'
        ];
        Settings.thresholdsDelayTime = 1000;
        Settings.thresholdsAnimationTime = 500;
        Settings.rectangleRadius = 3;
        Settings.axisTextSize = 12;
        Settings.axisTextFont = "Arial";
        Settings.axisStrokeColor = "rgb(0,232,255)";
        Settings.axisHeight = 47;
        Settings.horizontalTextMargin = 20;
        Settings.verticalTextMargin = 15;
        Settings.gapLabelTick = 3;
        Settings.activeMarkSize = 10;
        Settings.minLabelSpace = 50;
        Settings.minTickSpace = 8;
        Settings.minSmallTickSpace = 8;
        Settings.timescaleThickness = 2;
        Settings.markerWidth = 85;
        Settings.panelWidth = 185;
        Settings.cosmosTimelineID = "00000000-0000-0000-0000-000000000000";
        Settings.earthTimelineID = "48fbb8a8-7c5d-49c3-83e1-98939ae2ae67";
        Settings.lifeTimelineID = "d4809be4-3cf9-4ddd-9703-3ca24e4d3a26";
        Settings.prehistoryTimelineID = "a6b821df-2a4d-4f0e-baf5-28e47ecb720b";
        Settings.humanityTimelineID = "4afb5bb6-1544-4416-a949-8c8f473e544d";
        Settings.toursAudioFormats = [
            {
                ext: 'mp3'
            }, 
            {
                ext: 'wav'
            }
        ];
        Settings.tourDefaultTransitionTime = 10;
        Settings.seadragonServiceURL = "http://api.zoom.it/v1/content/?url=";
        Settings.seadragonImagePath = "/images/seadragonControls/";
        Settings.seadragonMaxConnectionAttempts = 3;
        Settings.seadragonRetryInterval = 2000;
        Settings.navigateNextMaxCount = 2;
        Settings.longNavigationLength = 10;
        Settings.serverUrlHost = location.protocol + "//" + location.host;
        Settings.minTimelineWidth = 100;
        Settings.signinUrlMicrosoft = "";
        Settings.signinUrlGoogle = "";
        Settings.signinUrlYahoo = "";
        Settings.fixedEventLine = 0;
    })(CZ.Settings || (CZ.Settings = {}));
    var Settings = CZ.Settings;

})(CZ || (CZ = {}));

