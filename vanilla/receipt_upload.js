//  DOC: receipt_upload.js
//
//  Handles front-end logic for the receipt upload feature.
//
//  TODO:
//      *   Make this configurable and decouple it from the DOM
//      *   This code is a mix of two versions, unused methods
//          should be removed.  (At the time of this writing,
//          the new version wasn't approved by product yet, so
//          the old methods were preserved in case we needed to
//          revert.)
//          *   Search this file for the word "revision" to find
//              more specific notes on each change

var receipt_upload = (function(self, window, $){

    // ----------  Check Dependencies  ---------- //

    if (!window.jQuery) throw 'ERROR: receipt_upload.js requires jQuery.';
    if (!window.notifier) throw 'ERROR: receipt_upload.js uses notifier.js module to display user feedback.';


    // ----------  Variables  ---------- //

    var files_store = []; // collection of hashmaps representing each file
    //  Example:    files_store = [
    //                  {
    //                      raw: (string) 'base64 encoded string of an image file',
    //                      size: (num) size of the file in bytes
    //                  }
    //              ]
    var total_file_size = 0; // total file size (bytes) of all images to be uploaded
    var process_step = 1; // which step in the receipt upload we're on
    var standalone = false; // if the receipt upload app should act like a standalone page
                            // or behave as if integrated into the basket page


    // ----------  Utils  ---------- //

    // Helper function that displays errors and scrolls to
    // the notifier box
    function displayError(message) {
        window.notifier.clear();
        window.notifier.display('error', String(message));
        $('html, body').animate({ // scroll back to the top so the user can see the response
            scrollTop: 0
        }, 300);
    }

    // Calculates the total file size for receits staged for upload
    // by adding up the size properties of each element in the files_store array.
    // This does NOT alter the total_file_size variable.
    function calcTotalFileSize () {
        var _total = 0;

        // commented due to revision
        // for (var i = 0; i < files_store.length; i++) {
        //     _total += files_store[i].size;
        // }

        $('.basketPage_receiptForm_receiptInput_input').each(function(index, value) {
            if (this.files.length) _total += this.files[0].size;
        });

        total_file_size = _total;

        return _total;
    }

    // Clears the file input fields.  Since the inputs respond to the "change" event,
    // this prevents a "bug" where the input appears unresponsive when a user tries
    // to upload the same file twice.
    function clearFileInputs() {
        $('#basketPage_receiptForm_fileUpload, #basketPage_receiptForm_fileUpload_More, .basketPage_receiptForm_receiptInput_input').val('');
    }

    // ----------  File Validation  ---------- //

    // NOTE:  Validation has been broken into individual functions, each returning
    //        true if their criteria passes.  Final validation is done with a for loop.

    // Returns true if a given string contains the proper
    // file extension.
    function hasValidExtension ( _str ) {
        var _valid_extensions = new RegExp(/(jpg|jpeg|png|gif)/i);
        if ( _valid_extensions.test(_str) ) return true;
        displayError('Some message (\"jpeg\", \"jpg\", \"png\", \"gif\")');
        return false;
    }

    // Returns true if the total memory of all files staged for upload
    // has not exceeded 10MB
    function withinPayloadLimit ( _fileSize ) {
        // commented due to revision
        // var _new_total = total_file_size + _fileSize;
        // if (_new_total < 10000000) {
        //     total_file_size = _new_total; // store the new total so that subsequent uploads can use it
        //     return true; // if _total_file_size is less than (approx) 10MB
        // }
        if (calcTotalFileSize() < 10000000) return true;
        displayError('Some message');
        return false
    }

    // Returns true if the number of files selected by the user is 4 or less.
    function withinFileCountLimit ( _files ) {
        if (_files.length + files_store.length <= 4) return true;
        displayError('Some error message');
        return false;
    }

    // Returns true if offers selected by the user at-least one
    function isOfferSelected() {
        if ($(".offer_tile_receiptMode_checkbox:checkbox:checked").length > 0) return true;
        displayError('Some error message');
        return false;
    }

    // Overall validation that occures when a user selects images to upload
    // If validation fails, all of the files in the selection are dropped.
    // Valid files from preview selections will remain however.
    function validateFiles( _input ) {
        window.notifier.clear(); // hide any previous errors
        // total_file_size = calcTotalFileSize(); // make sure the total file size is accurate

        var _files = _input.files; // extract the files object from the input

        // commented for due to revision (only have 4 file inputs, 1 file per input)
        // // Make sure we're not trying to upload too many files
        // // (including files we may have added prior to this validation)
        // if ( !withinFileCountLimit( _files ) ) return false; // Checks the number of files vs the max allowable

        // Check the extension of each file and ensure it
        // doesn't put us over the payload limit when we submit the form
        for (var i = 0; i < _files.length; i++) {
            var _file = _files[i];
            // Validate file extension and make sure we're still within the payload limit
            if ( !hasValidExtension( _file.type.split('/').pop() ) || !withinPayloadLimit(_file.size) ) {
                $(_input).val('');
                return false;
            }
        }

        // If all of the files passed validation, we can add them to the DOM
        // and parse them into the application.

        // commented out for new version
        // for (var n = 0; n < _files.length; n++) {
        //     parseFile(_files[n]);
        // }

        parseFile( _input );

        // commented out due to revision
        // clearFileInputs();
        // if (process_step < 2) goToStep(2);
    }


    // ----------  DOM Manipulation  ---------- //

    // Reads a file reference and stores its data
    // in the files_store array as a hash map
    //  NOTE:  _input was added in revision, it originally
    //         pointed directly to a file reference, '_file'
    function parseFile( _input ) {

        // added in revision
        var _file = _input.files[0];

        // the FileReader allows the browser to look at an image
        // and convert it to a base64 encoded string.
        var _reader = new FileReader();
        _reader.onload = function(event) {
            // We'll be storing the file data as a hash map
            // in the files_store array.
            var _file_data = {};

            // Add the file size.  The base64 size will be a little larger
            // but at the time of this writing, we should have an acceptable margin
            // of error
            _file_data.size = _file.size;

            // Add the base64 encoded image file to the hash map
            // under the "raw" property.
            _file_data.raw = event.target.result;

            // Push the _file_data to files_store so it can be managed
            // by other functions.
            files_store.push(_file_data);

            // Commented out for revision
            // // Now that files_store is updated, make sure
            // // to update the DOM accordingly.
            // updatePreviewImages();

            displayPreview( _input );
        }

        // Initialize the file reader
        _reader.readAsDataURL( _file );
    }

    // Updates the display of receipt preview images
    function updatePreviewImages() {
        // Clear the preview div so we don't have duplicate receipts and inputs
        $('#basketPage_receiptForm_previews').html('');

        // Iterate through the files_store array and generate a preview image and
        // input for each element.  Append the result to the DOM
        for (var i = 0; i < files_store.length; i++) {
            var _preview = createPreviewImage(files_store[i].raw, i);
            $('#basketPage_receiptForm_previews').append( _preview );
        }
    }

    // Returns an html string representing the receipt staged for upload
    // _string = base64 encoded image.
    // _count  = the index in the files_store array, used as a unique
    // identifier
    function createPreviewImage ( _string, _count ) {
        var _html = '<div class="col-xs-6 col-sm-4 col-md-3">' +
                    '   <input type="checkbox" ' +
                    '          id="basketPage_receiptForm_preview_checkbox_' + _count + '" ' +
                    '          data-count="' + _count +'" ' +
                    '          class="basketPage_receiptForm_preview_checkbox">' +
                    '   <label for="basketPage_receiptForm_preview_checkbox_' + _count + '" ' +
                    '          class="basketPage_receiptForm_preview" ' +
                    '          style="background-image: url(' + _string + ');" ' +
                    '          data-receipt-num="' + _count + '">' +
                    '       <div class="basketPage_receiptForm_preview_close">' +
                    '           <svg viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
                    '               <circle cx="25" cy="25" r="25" class="basketPage_receiptForm_preview_close_circle" />' +
                    '               <path d="M13 13 L37 37" class="basketPage_receiptForm_preview_close_path" />' +
                    '               <path d="M13 37 L37 13" class="basketPage_receiptForm_preview_close_path" />' +
                    '           </svg>' +
                    '       </div>' +
                    '   </label>' +
                    // '   <input type="hidden" name="receipt_' + _count + '" value="' + _string + '">' +
                    '</div>';
        return _html;
    }

    // Added in revision
    // Displays a preview of the receipt image over the
    // original file input
    function displayPreview(_input) {
        var _preview = $( $(_input).data('preview') );
        var _reader = new FileReader();
        _reader.onload = function(e) {
            _preview.css({
                'background-image' : 'url(' + e.target.result + ')',
                'display'          : 'block'
            });
            updateRemainingMemory();
        }
        _reader.readAsDataURL( _input.files[0] );
        // _preview.css('background-image', 'url(' + _input.files[0] + ')');
    }

    // Added in revision
    // Removes a receipt preview and returns the
    // corresponding input to its initial state.
    function removePreview( _button ) {
        var _btn = $(_button);
        $( _btn.data('preview') ).css({
            'background-image' : 'none',
            'display'          : 'none'
        });
        $( _btn.data('input')).val('');
        updateRemainingMemory();
    }


    // Removes only receipts that are checked.
    function removeReceipts() {
        // Removing multiple elements from files_store at various indexes
        // at the same time is tricky.  So we'll construct an array of the
        // the receipts that AREN'T marked for removal, and replace files_store
        // with the new array.
        var _preserved_files = [];
        $('.basketPage_receiptForm_preview_checkbox').each(function(index, value) {
            // we can use the index from the foreach loop because the receipt previews
            // are representative of files_store to begin with.
            if ($(value).prop('checked') == false) _preserved_files.push(files_store[index]);
        });
        files_store = _preserved_files;
        updatePreviewImages(); // All done, update the DOM
        clearFileInputs();
    }

    // Dumps all selected receipts at once
    // and clears the file inputs
    function clearForm() {
        $('#basketPage_receiptForm_previews').html('');
        $('.offer_tile_receiptMode_checkbox').prop('checked', false);
        $('.basketPage_receiptForm_receiptInput_preview').css({
            'background-image' : 'none',
            'display'          : 'none'
        });
        clearFileInputs();
        files_store = [];
        total_file_size = 0;
        updateRemainingMemory();
        window.notifier.clear();
        goToStep(1);
    };

    // Shows/hides various elements, depending on which step
    // in the upload process we're on.
    function goToStep ( _step_num ) {
        $('#basketPage_receiptForm').removeClass('step_1 step_2 step_3').addClass('step_' + _step_num);
        if (_step_num > 1) {
            $('.offer_tile').addClass('receiptmode'); // tell offer tiles to display their receipt upload UI
        } else {
            $('.offer_tile').removeClass('receiptmode');
        }
        process_step = _step_num; // update the global step num
    }

    // Calibrate the UI so that the receipt upload feature
    // acts as a standalone feature, and not integrated into
    // the basket page.
    function is_standalone () {
        $('#basketPage_receiptForm_back').hide();
        standalone = true;

    }

    // Updates the remaining memory display
    function updateRemainingMemory() {
        var _remaining = 10 - (calcTotalFileSize() / 1000000);
        var _ele = $('#basketPage_receiptForm_header_memory');
        if (_remaining % 1 === 0) { // if _remaining is an integer
            _ele.html( _remaining );
        } else { // else stop at two decimal places
            _ele.html( _remaining.toFixed(2) );
        }
    }


    // ----------  Receipt Upload  ---------- //

    function formSubmission(e) {
        e.preventDefault();

        if ( !isOfferSelected() ) return false; // Check if offer is selected

        var $submit = $('#receipt_upload_submit');
        $submit.prop('disabled', true); // prevent form spamming

        // using a vanilla selector becuase the ajax post needs the
        // the vanilla DOM node in order to send files correctly
        var _form = document.getElementById('basketPage_receiptForm');

        $.ajax({
            url: $(_form).attr('action'),   // Url to which the request is send
            type: 'POST',                   // Type of request to be send, called as method
            data:  new FormData(_form),     // Data sent to server, a set of key/value pairs representing form fields and values
            contentType: false,             // The content type used when sending data to the server. Default is: "application/x-www-form-urlencoded"
            cache: false,                   // To unable request pages to be cached
            processData: false,              // To send DOMDocument or non processed data file it is set to false (i.e. data should not be in the form of string)
            success: function(response) {   // Handle response (see below)
                uploadResponseHandler(response);
            }
        });
    }

    // NOTE: This method can be tested in the browser console as:
    //       $ receipt_upload.handleResponse( _response );
    function uploadResponseHandler( _response ) {
        if (_response.message.success) {
            window.notifier.store('success', _response.message.message);
            if (standalone) {
                window.history.back(); // go back to the point history page (with selected retailer, timeframe etc.)
            } else {
                window.location = _response.message.next;
            }
        } else {
            displayError(_response.message.error);
            $('#receipt_upload_submit').prop('disabled', false);
        }
    }


    // ----------  Startup  ---------- //

    $(function () {
        // Set the UI to step 1
        goToStep(1);

        $('#basketPage_receiptForm_begin').on('click', function(e) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, 150);
            goToStep(2);
        });

        // File Selection
        $('#basketPage_receiptForm_fileUpload, #basketPage_receiptForm_fileUpload_More, .basketPage_receiptForm_receiptInput_input').on('change', function(e) {
            validateFiles(this);
        });

        // remove preview button
        $('.receiptPreview_remove').on('click', function(e) {
            removePreview(this);
        });

        $("#basketPage_receiptForm_removeReceipt").on('click', function(e) { removeReceipts() });
        $('#basketPage_receiptForm_back_link').on('click', function(e) {
            e.preventDefault();
            clearForm();
        });
        // Form submission
        $('#basketPage_receiptForm').on('submit', function(e) { formSubmission(e) });
    });


    // ----------  Public  ---------- //
    return {
        handleResponse : uploadResponseHandler,
        gotostep : goToStep,
        is_standalone: is_standalone
    }

})(receipt_upload || {}, window, $);
