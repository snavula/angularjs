var edit_email = (function(self, window, $, parsley){
    function init() {
    
    $('#edit_email_form').parsley().on('field:error', function () {
        this.$element.addClass('input_invalid');
    }).on('field:success', function () {
        this.$element.removeClass('input_invalid');
    });
    
    $('#edit_email_form').on('submit', function (e) {
        $(".update_account_error").html();
        e.preventDefault();
    
        var $submit = $('#edit_email_submit_button');
        $submit.prop('disabled', true); // prevent form spamming
    
        $.post( '/ajax/update-member-email', $(this).serializeArray(), function(response) {
         if (response) {
            $submit.prop('disabled', false);
            window.notifier.clear();
            if (response.success) {
                $('#edit_email_success').html("メールアドレス更新されました");
            } else {
                window.notifier.display('error', response.message.error);
            }
          }
          else {
            $submit.prop('disabled', false);
          }
       }, 'JSON');
    });
  }
  
 $(function() {
        if ( $('#edit_email_form').length ) init();
    });
})(edit_email || {}, window, $, parsley);  
  
