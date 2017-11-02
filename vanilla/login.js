var login_form = (function(self, window, $, parsley) {
    function init () {
      $('#login_form').parsley().on('field:error', function(){
        this.$element.addClass('input_invalid');
      }).on('field:success', function() {
        this.$element.removeClass('input_invalid');
      });
    }

  $(function() {
    if ( $('#login_form').length ) init();
  });
})(login_form || {}, window, jQuery, parsley);