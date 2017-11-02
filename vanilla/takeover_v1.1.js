//  DOC: cn_takeover.js
//
//  CHANGE LOG:
//    v1.1 (CCJP 2017)
//      * Added ability for the takeover to "stick" with an offset value to
//        account for pages with sticky headers.  (Old functuonality was to stick to top of the page.)
//
//  USAGE:
//  cnTakeover.init({
//    source        : '/assets/some.jpg',  File path for the image to be loaded
//    target        : '#takeover',  jQuery selector for the takeover element
//    breakpoint    : 990,  Minimum window width to load the takeover image
//    stayBelow     : [ 'header', '#spotlight']  Array of DOM elements that the takeover shouls stay below.
//    offset        : Num (pixels) of additional space to add to the stayBelow calculation.
//    offset_sticky : Num (pixels) of additional space from the top of the page when the header is sticky 
//    bgColor       : '#ff0000' the base background color for the page if the takeover is displayed
//  });
//
//  PUBLIC FUNCTIONS:
//  - init({options}) - Initializes the takeover.  See above for options.
//  - reset()         - Recalculates where the takeover should stick and repositions accordingly


var cnTakeover = (function(cnTakeover, window, document, $){

  // ----------  Setup  ---------- //
  
  // Check Dependancies
  if (!window.jQuery) throw 'ERROR: cnTakeover.js requires jQuery.';
  
  // Variables used across this module
  var _opts = { // settings for this module
    target        : null, // (Req) jQuery selector - DOM element that holds the takeover
    source        : null, // (Req) String - the source for the takeover image
    bgColor       : null, // (Req) Hex color - the base background color for the page if the takeover is displayed
    breakpoint    : null, // (Req) Num (pixels) - width at which the takeover should NOT be called (Because the page would be too narrow)
    stayBelow     : [],   // (Req) Array of jQuery selectors - DOM elements that the takeover should stay below on the page.
    offset        : null, // (Req) Num (pixels) - Additonal space that the takeover should apply to the stayBelow value
    offset_sticky : null  // (Req) Num (pixels) - Additional space that the takeover should apply from the top of the page when sticky
  };
  var _img = new Image(); // image object for loading the image asynchronously
  var _already_loaded = false; // prevents relaods
  var _stick_at = 0; // distance from the top (px) that the takeover should become sticky

  
  // ----------  Image Handling  ---------- //
  
  // Set a source for the image.  (Tells the browser to load it.)
  function _setSrc() {
    
    // If the window is too narrow or the image has already been loaded, don't load the takeover.
    if ($(window).width() > _opts.breakpoint) {
      // Add a class to the body tag so other elements can compensate for the takeover.
      $('body').addClass('has_takeover');
      
      // Set background color if it exists
      // This has to be done with JS because the background color
      // can change based on the takeover image.
      if (_opts.hasOwnProperty('bgColor') && _opts.bgColor !== '' && _opts.bgColor !== null) {
        $('html, body').addClass('has_takeover').css({'background-color' : _opts.bgColor});
      }
      
      // Avoid loading the takeover twice
      if (_already_loaded == false) { // only load if the window is wide enough
        _img.src = _opts.source;
        _already_loaded = true;
      } 
      
    } else { // Don't show the takeover, keep the background color as default
      $('html, body').removeClass('has_takeover').css({'background-color' : _opts.defaultBgColor});
    }
  }

  // When the image is loaded, apply it as the background of the takeover element and fade it in.
  _img.onload = function(){
    $(_opts.target).css({'background-image': 'url(' + _img.src + ')'});
    $(_opts.target).animate({'opacity': '1'}, 300);    
  };
  
  
  // ----------  Positioning  ---------- //
  
//  TODO: Chrome has a slight jump between when
//  the takeover scrolls and when it starts sticking
//  to the top of the screen.  This is because of
//  the calculation involving _opts.offset.
//  _opts.offset can probably be removed when the
//  header is fully in place.
  
  function _reposition () {
    var $targ = $(_opts.target);
    var _scrollTop = $(document).scrollTop();
    if ( _scrollTop <= _stick_at ) {
      $targ.css({
        'position' : 'absolute',
        'top'      : _stick_at + _opts.offset + 'px'
      });
    } else{
      $targ.css({
        'position' : 'fixed',
        'top'      : _opts.offset_sticky + 'px'
      });
    }
  }
  
  // Get the threshold
  function reset () {
    var _y = 0;
    for (var i = 0; i < _opts.stayBelow.length; i ++) {
      _y += $(_opts.stayBelow[i]).outerHeight(true);
    }
    _stick_at = _y;
    _reposition();
    $(_opts.target).css({'height' : $(document).height()});
  }
  
  $(window).on('scroll', function(e) {
    _reposition();
  });
  
  
  // ----------  Initialization  ---------- //
  
  var resetLock = false; // prevent reset spamming

  // Initialization
  function init( opts ) {
    // iPad landscape is wide enough to show part of the takeover, which looks awkward.
    if (navigator.userAgent.match(/iPad/i) == null) {
      // store options for other functions
      _opts = opts;

      // load the takeover image under certain conditions
      _setSrc();

      $(window).on('resize', function(e) {
        if (!resetLock) {
          resetLock = true;
          setTimeout(function() {
            _setSrc();
            reset();
            resetLock = false;
          }, 500);
        }
      });

      // Store the document's default background color.
      _opts.defaultBgColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');

      // position the takeover
      reset();
    } else { // if iPad, don't show the takeover and don't allow the link to function
      $('#takeover a').on('click', function(e) {
        e.preventDefault();
      });
    }
  }
  
  // Public functions
  return {
    init  : init,
    reset : reset
  }

}(cnTakeover || {}, window, document, jQuery));