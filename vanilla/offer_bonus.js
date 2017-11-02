//  TODO:  The video section looks for specific ID's and styles
//         on the view.  This should be made dynamic.
//  TODO:  Same thing for spinner in the request redemption function.
//
//  DOC: cnBonus
//    Manages the YouTube API, gathering data, making the ajax call
//    and handling the responsive for redeeming offer bonuses.
//
//  USAGE:
//    cnBonus.init({
//      is_logged_in : false,
//      offer_id     : '12345',
//      retailer_id  : '678910',
//
//      youtube_id     : '8675309',
//      video_id       : '77',
//      video_eligible : true,
//    });
//
//  NOTE:  See "var data = {" for more explanation on the above.


var cnBonus = (function(_self, window, document, $) {
  
  // ----------  Data  ---------- //
  
  // stores all the data needed for redeeming a bonus
  var data = {
    is_logged_in   : null, // boolean (req) - if the user is logged in
    offer_id       : null, // string  (req) - id for the offer
    retailer_id    : null, // string  (req) - id for the retailer
    store_id       : null,
    has_fsc        : null,
    is_fave        : null,
    is_pex         : null,
    video_points   : null,
    quiz_points    : null,
    youtube_id     : null, // string  (opt) - YouTube ID for the video
    video_id       : null, // string  (opt) - Snapp ID for the video
    video_eligible : null, // boolean (opt) - if the video is eligible for redemption
    
    quiz_id       : null, // string  (opt) - Snapp ID for the quiz
    answer_id      : null, // string  (opt) - answer ID from the quiz
  }
  var init = function (_data) {
    var _external_keys = Object.keys(_data);
    var _internal_keys = Object.keys(data);
    
    // iterate through the data that's being passed to the init function
    // and map it to the corresponding key in the internal data
    for (var i = 0; i < _external_keys.length; i++) {
      // for each key in the imported data, we check the internal data
      for (var k = 0; k < _internal_keys.length; k++) {
        // if a match is found
        if (_internal_keys[k] == _external_keys[i]) {
          // copy it to the internal data
          data[_internal_keys[k]] = _data[_external_keys[i]];
          // remove it from the _internal keys array (slight optimization)
          //_internal_keys.splice(_internal_keys[k], 1);
        }
      } 
    }
    
    // If the page has a video bonus, now is a good time to load YouTube's API
    if (data.youtube_id !== null) loadYouTubeAPI();
  }
  
  
  // ----------  YouTube API  ---------- //
  
  // Load the youtube API
  var loadYouTubeAPI = function (_data) {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
  
  // When the youtube API is ready, assign click handlers
  window.onYouTubePlayerAPIReady = function () {
    document.getElementById('bonus_video_play').addEventListener('click', function(e) {
      window.notifier.clear();
      $('#video_notifier').removeClass('noDisplay');
      $('#quiz_notifier').addClass('noDisplay');
      if(data.is_logged_in) {
        if(!data.is_fave) {
           window.notifier.display('error', '店舗を選択されておりません。<a href="/retailers/select">よく使う店舗の追加はこちら</a>');
         }
        else if(!data.has_fsc && !data.is_pex) {
          window.notifier.display('error', 'ポイントカード追加されておりません。<a href="/account/mycard">ポイントカードの登録はこちら。</a>');
         }
        else  {
        calibratePlayer();
        document.getElementById('bonus_section_video_player_stage').style.display = 'block';
       } 
      } else {
        window.location = '/account/login';
      }
    });
  }
  
  // Set player configuration.
  var calibratePlayer = function() {
    var _window_width = window.innerWidth < 600 ? window.innerWidth : 600;
    var player = new window.YT.Player('bonus_video_player', {
      videoId: data.youtube_id,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: '1', // if the playback should start automatically
        color: 'white', // color scheme
        hl: 'jp', // language
        fs: 0, // 
        modestbranding: '1', // remove the standard YouTube logo
        controls: 0, // remove playback controls (so the user can't skip to the end)
        disablekb: 0, // disable keyboard controls
        rel: 0, // do not display related videos at the end
        showinfo: 0 // do not show video information when the video playes
      },
      events: {
        'onStateChange' : YTStateChange // respond to changes to the state of the player
      }
    });
  }

  // Fired when the player state changes.
  var YTStateChange = function (e) {
    // if the video has finished playing (status 0) and the user can redeem a bonus
    // for watching it...
    if (e.data == 0 && data.video_eligible) { // video has finished playing
      var _data = {
        offer_id: data.offer_id,
        retailer_id: data.retailer_id,
        video_id: data.video_id,
        store_id: data.store_id
      }
      requestRedemption(_data);
    }
  }
  
  
  
  
  // ----------  Quiz Handling  ---------- //
  
  var clipQuiz = function (_answer) {
    if(data.is_logged_in) {
      var _data = {
        offer_id    : data.offer_id,
        retailer_id : data.retailer_id,
        store_id    : data.store_id,
        quiz_id    : _answer.quiz_id,
        answer_id   : _answer.answer_id
      }  
      requestRedemptionQuiz(_data);
    } else {
      window.location = '/account/login';
    }
  }
  
  
  
  
  // ----------  Redemption Call  ---------- //

  // Makes the actual ajax request
  var requestRedemption = function (_data) {
    $('#spinner').toggleClass('spinner_active');
    $.post('/ajax/clip-bonus-video', _data, function (resp) {
       window.notifier.clear();
      $('#quiz_notifier').addClass('noDisplay');
      $('#video_notifier').removeClass('noDisplay');
      if(resp) {
       if (resp.success) {
         window.location.hash = "#video";
         location.reload(true);
         window.notifier.store('success', "ご視聴ありがとうございます。 "+data.video_points+" P 追加されました！");
        } else {
         //window.notifier.display('error', String(resp.message.error));
        }
      }
      else {
         window.notifier.display('error', "Technical Error");
      }
    }, 'JSON');
  }
  
  
  // Makes the actual ajax request for quiz
  var requestRedemptionQuiz = function (_data) {
  
      window.notifier.clear();
      $('#video_notifier').addClass('noDisplay');
      $('#quiz_notifier').removeClass('noDisplay');
     if(data.is_logged_in) {
        if(!data.is_fave) {
           window.notifier.display('error', '店舗を選択されておりません。<a href="/retailers/select">よく使う店舗の追加はこちら</a>');
         }
        else if(!data.has_fsc && !data.is_pex) {
          window.notifier.display('error', 'ポイントカード追加されておりません。<a href="/account/mycard">ポイントカードの登録はこちら。</a>');
         }
        else  {
       
       $.post('/ajax/clip-bonus-quiz', _data, function (resp) {
      if(resp) {
       if (resp.success) {
         // window.notifier.store('success', "You just earned bonus point, "+data.quiz_points+" P.");
          window.location.hash = "#quiz";
          location.reload(true);
        } else {
          window.notifier.display('error', String(resp.message.error));
        }
       } else {
        window.notifier.display('error', "Technical Error");
       }
     }, 'JSON');
    } 
   } else {
        window.location = '/account/login';
    }
  }
    
  // -----  Public Methods  ----- //
  return {
    init: init,
    redeemQuiz : clipQuiz
  }
  
})(cnBonus || {}, window, document, jQuery);