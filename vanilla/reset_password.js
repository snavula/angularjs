var reset_password = (function(self, window, $, parsley){
    function init() {
        $('#resetpassword_form').parsley().on('field:error', function(){
            this.$element.addClass('input_invalid');
        }).on('field:success', function() {
            this.$element.removeClass('input_invalid');
        });
        $('#resetpassword_form').on('submit', function(e) {
            e.preventDefault();
            var $submit = $('#resetpassword_form');
            $submit.prop('disabled', true); // prevent form spamming
            $.post( $(this).attr('action'), $(this).serializeArray(), function(response) {
                if (response) {
                    if (response.success) {
                        window.notifier.clear();
                        //Snapp responses...
                        if (response.message.success) {
                            window.location = '/account/reset-password-conf?email=' + response.message.email;
                            //window.notifier.display('success', String("パスワードを更新されました。"));
                        } else {
                            $submit.prop('disabled', false);
                            // pass the error to the notifier module
                            window.notifier.display('error', String(response.message.error));
                            // scroll back to the top so the user can see the response
                            $('html, body').animate({
                                scrollTop: 0
                            }, 300);
                        }
                    }
                }
            }, 'JSON');
        });
    }

    $(function() {
        if ( $('#resetpassword_form').length ) {
            console.log('found form');
            init();
        }
    });
})(reset_password || {}, window, jQuery, parsley);