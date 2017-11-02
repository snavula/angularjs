//	DOC: Register Compunded.js
//
//	Javascript portfion of the registration page
//	that features the credentials, store selection
// 	and FSC entry all on one page.

var registration_compounded = (function (self, window, $, parsley) {
	function init () {
		var form = $('#register_form_compounded');
	    form.parsley().on('field:error', function(){
	    	this.$element.addClass('input_invalid');
	    }).on('field:success', function() {
	    	this.$element.removeClass('input_invalid');
	    });
	    
	    form.on('submit', function(e) {
	    	e.preventDefault();

	    	var $submit = $('#register_form_compounded_submit');
	    	$submit.prop('disabled', true);

	      	$.post( form.attr('action'), $(this).serializeArray(), function(response) {
            	if(response) {
            		window.notifier.clear(); // clear any existing notifications
		            if(response.success) {
		            	// If there was an error with an optional step, e.g. FSC registration,
		            	// store the response message to be displayed on the next page.
		             	if ( response.hasOwnProperty('message') ) {
		             		if ( response.message.hasOwnProperty('error') ) {
		             			window.notifier.store('error', response.message.error);
		             		}
		             	}
		             	window.location = String(response.next);
		           	} else {
		            	$submit.prop('disabled', false);
		                $('#register_form_pw').val("");

		                // pass the error to the notifier module
		                window.notifier.display('error', String(response.message.error));
		                
		                // scroll back to the top so the user can see the response
		                $('html, body').animate({
		                	scrollTop: 0
		                }, 300);
		            }
	        	}
	      	}, 'JSON');
	    });
	}
	$(function() {
		if ( $('#register_form_compounded').length ) init();
	});
})(registration_compounded || {}, window, jQuery, parsley);