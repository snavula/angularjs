
var update_dob = (function(self, window, $, parsley){
 function init() {
  if($('#my_account_dob_form').length) {

    $('#my_account_dob_form').parsley().on('field:error', function () {
      this.$element.addClass('input_invalid');
    }).on('field:success', function () {
      this.$element.removeClass('input_invalid');
    });
    
    $('#my_account_dob_form').on('submit', function (e) {
      e.preventDefault();
    
      var $submit = $('#update_dob_submit_button');
      $submit.prop('disabled', true); // prevent form spamming
      
      $.post( "/ajax/edit-member-dateofbirth", $(this).serializeArray(), function(response) {
        if (response) {
          $submit.prop('disabled', false);
          window.notifier.clear();
          if (response.success) {
          } else {
            $submit.prop('disabled', false);
             window.notifier.display('error', String(response.message.error));
          }
        } else {
          $submit.prop('disabled', false);
           window.notifier.display('error', "Technical Error");
        }
      }, 'JSON');
    });
  }
 }
$(function() {
   if ( $('#my_account_dob_form').length ) {
        init();
      }
  });
})(update_dob || {}, window, jQuery, parsley);

 