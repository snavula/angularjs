//	DOC: register_credentials.js
//
//	Front-end functionaly for the credentials section
//	of the registration form.
//
//	DEPENDENCIES
//		* jQuery
//		* Parlsey.js for form validation
//
// TODO:  Make this into an actual module with dynamic binding etc.

var account_to_delete = (function(self, window, $, parsley) {
    function init () {
        let form = $('#delete_user_form');
        form.parsley().on('field:error', function(){
            this.$element.addClass('input_invalid');
        }).on('field:success', function() {
            this.$element.removeClass('input_invalid');
        });

        form.on('submit', function(e) {
            e.preventDefault();

            let $submit = $('#delete_account_submit');
            // let $formFeedback = $('#registration_form_feedback');

            $submit.prop('disabled', true);
            // $formFeedback.hide();

            $.ajax({
                url: $(this).attr('action'),
                type: 'DELETE',
                success: function (response) {
                    if (response) {
                        if (response.success) {
                            window.location = '/account/logout';
                        } else {
                            $submit.prop('disabled', false);
                        }
                        //  $formFeedback.text(response.message).show();
                        //} else {
                        //		$submit.prop('disabled', false);
                        //		$('#reg_form_pw').val("");
                        // $formFeedback.text('<?php echo "A technical error has occurred. Please try again later"; ?>').show();
                    }
                }
            }, 'JSON');
        });
    }
    $(function() {
        if ( $('#delete_user_form').length ) init();
    });
})(account_to_delete || {}, window, jQuery, parsley);