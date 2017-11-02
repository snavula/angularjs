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

var registration_form_credentials = (function(self, window, $, parsley) {
	function init () {
		let form = $('#register_form_credentials');
	    form.parsley().on('field:error', function(){
	    	this.$element.addClass('input_invalid');
	    }).on('field:success', function() {
	    	this.$element.removeClass('input_invalid');
	    });
	    
	    form.on('submit', function(e) {
	    	e.preventDefault();

	    	let $submit = $('#registration_form_submit');
	      	// let $formFeedback = $('#registration_form_feedback');

	    	$submit.prop('disabled', true);
	    	// $formFeedback.hide();

	      	$.post( $(this).attr('action'), $(this).serializeArray(), function(response) {
            if(response) {
              if(response.success) {
                window.location = '/';
            	} else {
                $submit.prop('disabled', false);
                $('#reg_form_pw').val("");
              }
              //  $formFeedback.text(response.message).show();
	        	//} else {
	          //		$submit.prop('disabled', false);
	          //		$('#reg_form_pw').val("");
	          		// $formFeedback.text('<?php echo "A technical error has occurred. Please try again later"; ?>').show();
	        	}
	      	}, 'JSON');
	    });
	}
	$(function() {
		if ( $('#register_form_credentials').length ) init();
	});
})(registration_form_credentials || {}, window, jQuery, parsley);
