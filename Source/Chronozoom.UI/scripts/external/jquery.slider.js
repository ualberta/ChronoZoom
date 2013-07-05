/** 
slider
---------------------------------------------------------------------
Author: 		Lane Olson
Sources: 		jQuery Plugin Patterns:
					http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
Download:     https://github.com/Lane/Slider/
Version:		  1.0
Description:	Displays nested lists of links as a sliding menu
---------------------------------------------------------------------
**/


;(function ($) {

    // initialize namespace if it doesn't exist
    if (!$.responsive) {
            $.responsive = {};
	};
    
	$.responsive.slider = function ( el, options ) {
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;

		// Add a reverse reference to the DOM object
		base.$el.data( "responsive.slider" , base );
		
		var currentNav = $('ul:first', base.el);
		
		var transitionsSupported = false;
		var isCreated = false;
        var isAnimating = false;

		base.init = function () {
			base.options = $.extend({}, $.responsive.slider.defaultOptions, options);
			
			base.$el.bind("createslider", function() {
				base.create();
			});
			
			base.$el.bind("destroyslider", function() {
				base.destroy();
			});
      
			
			transitionsSupported = Modernizr.csstransitions;
			
			if(base.options.initPlugin)
				base.create();
            
		};
		
		// item - list item containing the sub menu
		base.goToNext = function(item) {
			var currUl = currentNav;
			var nextUl = item.siblings("ul:first");
			var divContainer = false;

            if(!isAnimating)
			{
                isAnimating = true;
                if(nextUl.length < 1)
                {
                    divContainer = item.siblings("div");
                    nextUl = $("ul:first", divContainer);
                }
                
                nextUl.prepend('<li class="'+base.options.classPrefix+'prev"><a class="'+base.options.classPrefix+'back'+'" href="#">'+base.options.backWording+' '+item.html()+'</a></li>');
                $('a.'+base.options.classPrefix+'back'+' strong', nextUl).html(base.options.prevArrow);

                if(!transitionsSupported)
                {
                    nextUl.css("left", nextUl.position().left+"px");
                    nextUl.animate({ left: "0" }, base.options.transitionTime, "swing", function()
                    {
                        base.switchClassesNext(currUl, nextUl);
                        isAnimating = false;
                    });
			    } else {
				    base.switchClassesNext(currUl, nextUl);
                    isAnimating = false;
			    }
			
			    currentNav = nextUl;
            }
		};
		
		base.goToParent = function() {
		
			var currUl = currentNav;
			var prevUl = currUl.parents("ul:first"); // get first parent <ul>
			var moveLeft; // value to animate left to
			
            if(!isAnimating) {
                isAnimating = true;
                if(!transitionsSupported) {
                    if(prevUl.position().left < 0)
                        moveLeft = "0";
                    else
                        moveLeft = "100%";
                        
                    prevUl.css("left", prevUl.position().left+"px");
                    prevUl.animate({ left: moveLeft }, base.options.transitionTime, "linear", function()
                    {
                        base.switchClassesPrevious(currUl, prevUl);
                        isAnimating = false;
                    });
			    } else {
				    base.switchClassesPrevious(currUl, prevUl);
                    isAnimating = false;
			    }
			currentNav = prevUl;
            }
			
		};
		
		
		base.switchClassesNext = function(current, next) {
			current.removeClass(base.options.classPrefix+'current');
			current.addClass(base.options.classPrefix+'left');
			next.addClass(base.options.classPrefix+'current');
			next.removeClass(base.options.classPrefix+'right');
			base.$el.height(next.height());
			next.css("left", "");
		};
		
		base.switchClassesPrevious = function(current, previous) {
			current.removeClass(base.options.classPrefix+'current');
			current.addClass(base.options.classPrefix+'right');
			previous.addClass(base.options.classPrefix+'current').css("left", "");
			previous.removeClass(base.options.classPrefix+'left').css("left", "");
      if(!transitionsSupported)
        current.find('.'+base.options.classPrefix+'prev').remove();
			base.$el.height(previous.height());
		};
		
		base.transitionSupport = function() {
      return true;
			var d = document.createElement("detect"),
				CSSprefix = "Webkit,Moz,O,ms,Khtml".split(","),
				All = ("transition " + CSSprefix.join("Transition,") + "Transition").split(",");
			for (var n = 0, np = All.length; n < np; n++) {
				if (d.style[All[n]] === "") {
					return true;
				}
			}

			return false;
		};
		
		base.create = function(){
      
      var list = base.$el.find("ul:first");

			if(!isCreated) {
				base.$el.css('overflow', 'hidden');
				
				$('ul', base.el).css({ 
					'position': 'absolute', 
					'width': '100%', 
					'top': '0px' 
				});
				
				$('ul', base.el).bind(
				  'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', 
				  function(event) {
				    var switchedEl = $('.'+base.options.classPrefix+'right');
				    var className = "." + base.options.classPrefix + "prev";
				    $(className, switchedEl).remove();
				  }
				);
				
        base.$el.css({height: list.outerHeight()+'px'});
				list.addClass(base.options.classPrefix+'current');
				
				
				$("li", base.el).each(function() {
					if($(this).children("ul").length > 0 || $(this).children('div').children('ul').length > 0)
					{
						$(this).children("ul","div").addClass(base.options.classPrefix+'right');
						$(this).children("a").append('<strong>'+base.options.moreArrow+'</strong>').addClass(base.options.classPrefix+'more');
					}
				});
        
				base.$el.on("click", "a."+base.options.classPrefix+'more', function() {
					base.goToNext($(this));
					return false;
				});
				
				base.$el.on("click", "a."+base.options.classPrefix+'back', function () {
					base.goToParent();
					return false;
				});
				
				isCreated = true;

			}
		};
		
		base.destroy = function() {
			base.$el.removeAttr('style');
			base.$el.off("click", "**");
			$('.'+base.options.classPrefix+'current', base.el).removeClass(base.options.classPrefix+'current');
			$('.'+base.options.classPrefix+'right', base.el).removeClass(base.options.classPrefix+'right');
			$('.'+base.options.classPrefix+'left', base.el).removeClass(base.options.classPrefix+'left');
			$('.'+base.options.classPrefix+'more'+' strong', base.el).remove();
			$('.'+base.options.classPrefix+'more', base.el).removeClass(base.options.classPrefix+'more');
			$('ul', base.el).removeAttr('style');
            $('.'+base.options.classPrefix+'back').parent().remove();
			isCreated = false;
		};
		
		base.init();
	};
	
	$.responsive.slider.defaultOptions = {
		classPrefix: 'slider-',
		transitionTime: 200,
		backWording: "Back to",
		moreArrow: "&#x25B6;",
		prevArrow: "&#x25C0;",
		initPlugin: true
		// TODO: Add option for max levels
	};
	
	$.fn.slider = function( options ) {
		return this.each(function () {
				(new $.responsive.slider(this, options));
		});
	};
	
})( jQuery );
