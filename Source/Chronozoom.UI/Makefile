coursera:
	@echo "Concatenating Javascript Files"
	@cat scripts/external/jquery.slider-1.0.min.js scripts/external/jquery.cookie.js scripts/external/rx.js scripts/external/rx.jQuery.js scripts/external/mouseWheelPlugin.js > build/coursera/js/plugins.js
	@cat scripts/settings-coursera.js scripts/common.js scripts/viewport.js scripts/viewport-animation.js scripts/gestures.js scripts/virtual-canvas.js scripts/vccontent.js scripts/viewport-controller.js scripts/urlnav.js scripts/layout.js scripts/search.js scripts/bibliography.js scripts/breadcrumbs.js scripts/service.js scripts/data.js scripts/timescale.js scripts/dates.js scripts/cz.js > build/coursera/js/cz.js
	@uglifyjs build/coursera/js/cz.js > build/coursera/js/cz.min.tmp.js
	@cat detail.txt build/coursera/js/cz.min.tmp.js > build/coursera/js/cz.min.js

local:
	@echo "Concatenating Javascript Files"
	@cat scripts/external/jquery.slider-1.0.min.js scripts/external/jquery.cookie.js scripts/external/rx.js scripts/external/rx.jQuery.js scripts/external/mouseWheelPlugin.js > build/local/js/plugins.js
	@cat scripts/settings.js scripts/common.js scripts/viewport.js scripts/viewport-animation.js scripts/gestures.js scripts/virtual-canvas.js scripts/vccontent.js scripts/viewport-controller.js scripts/urlnav.js scripts/layout.js scripts/search.js scripts/bibliography.js scripts/breadcrumbs.js scripts/service.js scripts/data.js scripts/timescale.js scripts/dates.js scripts/cz.js > build/local/js/cz.js
	@uglifyjs build/local/js/cz.js > build/local/js/cz.min.tmp.js
	@cat detail.txt build/local/js/cz.min.tmp.js > build/local/js/cz.min.js
	@cp -r /Users/lolson/Google\ Drive/Development/ChronoZoom/Source/Chronozoom.UI/ /Users/lolson/Sites/Chronozoom