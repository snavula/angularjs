//	DOC: Notifier
//
//	Prints notifications to the user but populating
//	a message box on the DOM.
//
//	Can also store messages to be displayed on the next
//	page load.  (Within the same session.)
//
//	USAGE:
//		DOM:
//			<div class="my_notification_container">
//				<p class="my_notification_content">
//					<!-- notification message html appears here -->
//				</p>
//			</div>
//
//		JS:
//			notifier.init({
//				container_selector : '.my_notification_container', (jQuery selector) (req) - element containing the notifier.
//				content_selector   : '.my_notification_content' (jQuery selector) (req) - element containing the notifier's message. 
//			});
//
//		notifier.display( 'error', 'There was an error!'); // Displays the notifier with an error message.
//														   // A CSS class called "error" is added to elements matching the container_selector 
//
//		notifier.store( 'warning', 'This is just a warning for the next page view.'); // Stores a message and notification type in the
//																					  // browser's local storage.
//																					  // Message is displayed and deleted on the next page view.

var notifier = (function(self, window, $) {
	
	// ----------  Setup  ---------- //
	
	if (!window.jQuery) throw 'ERROR: Notifier requires jQuery';

	// Basic HTML template for the template message
	var _template = function(_type, _message) {
		var _tpl =  '<div class="notifier_message ' + _type + '">' + _message + '</div>';
		return _tpl;
	}

	var _ctnr = null; // selector for the DOM element(s) containing the notification, e.g. a containing div
	var _ctnt = null; // selector for the DOM element(s) into which the message is injected, e.g. a paragraph tag.
	var _messages = []; // array of messages to display
	var _types_possible = ['success', 'warning', 'error']; // types as strings (for css classes and user input)
	var _type_active = _types_possible[0]; // the type of message to display (error, warning, success)

	// Import settings and initialize the notifier.
	var init = function(_settings) {
		_ctnr = _settings.container_selector;
		_ctnt = _settings.content_selector;

		$(function() {
			if ($(_ctnr).length > 1) console.warn('WARNING: More than one container for application messages was found.  Messages will be printed in all containers.');
			if ($(_ctnr).length < 1) console.warn('WARNING: No container for application messages was found.  Messages will not be displayed to the user.');
			retrieveMessage();
		});
	}


	// ----------  Storage  ---------- //

	// Stores a message and its notification type in local storage.
	// Params:
	//		_type: (string) (req) - "error", "warning", "success"
	//		_message: (string) (re1) - "Some string of text <h2>Can contain html</h2>."
	var storeMessage = function (_type, _message) {
		window.sessionStorage.setItem('notifier_type', _type);
		window.sessionStorage.setItem('notifier_message', _message);
	}

	// Retrieve message from session storage and the deletes the message.
	// If no message is found to begin with, return false.
	var retrieveMessage = function () {
		var _ss = window.sessionStorage;
		if (_ss.hasOwnProperty('notifier_type') && _ss.hasOwnProperty('notifier_message') && _ss.notifier_message != 'null') {
			pushMessage(_ss.notifier_type, _ss.notifier_message);
			_ss.removeItem('notifier_type');
			_ss.removeItem('notifier_message');
		}
	}


	// ----------  DOM Manipulation  ---------- //

	// Manages the _messages array and prioritizes
	// the "type" property. (success < warning < error)
	var pushMessage = function(_type, _message) {
		_messages.push(_message);
		
		// compare the active type to the _type param.
		// display the one with highest priority SEE: _types_possible
		var _activeTypeIndex = _getTypeIndex( _type_active );
		var _newTypeIndex = _getTypeIndex( _type );

		if ( _newTypeIndex > _activeTypeIndex ) _type_active = _types_possible[_newTypeIndex];

		_displayMessage();
	}

	// returns the index of a given type string
	var _getTypeIndex = function ( _str ) {
		for (var i = 0; i < _types_possible.length; i++) {
			if ( _types_possible[i].match(_str) ) {
				return i;
			}
		}
		throw 'ERROR: Invalid message type "' + _str + '" on notifier.js';
	}

	// Displays the notifier on the view.
	var _displayMessage = function () {
		var _content = ''; // clear any message content

		// iterate through the messages array and create paragraph tags containing each message
		for (var m = 0; m < _messages.length; m++) {
			_content += '<p class="notifier_message_txt">' + String(_messages[m]) + '</p>';
		}

		// add the paragraphs to the error template and display it
		$(_ctnt).html( _template(_type_active, _content) );
		$(_ctnr).show();
	}

	// Clears all messages and hides the notifier
	var clearMessages = function () {
		$(_ctnr).hide(); // hide the notifier
		$(_ctnt).html(''); // clear the html from the content element
		_messages = []; // clear the messages in the array
		_type_active = _types_possible[0]; // reset the message type
		// remove notification entries from session storage
		window.sessionStorage.removeItem('notifier_type');
		window.sessionStorage.removeItem('notifier_message');
	}


	// ----------  Public  ---------- //

	return {
		store   : storeMessage,
		display : pushMessage,
		clear	: clearMessages,
		init    : init
	}

})(notifier || {}, window, jQuery);