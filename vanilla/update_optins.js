var update_optins = (function(self, window, $, parsley){
 function init() {  
  if($('#my_account_optins_form').length) {
    $('#my_account_optins_form').parsley().on('field:error', function(){
      this.$element.addClass('input_invalid');
    }).on('field:success', function() {
      this.$element.removeClass('input_invalid');
    });
    
     $('#news_letter_optin').on('click', function(e) {
      var val = $('#news_letter_optin').val();
      if(val == 0)
        $('#news_letter_optin').val(1);
      else
        $('#news_letter_optin').val(0);
    });
  
   $('#news_optin_partners').on('click', function(e) {
      var val = $('#news_optin_partners').val();
      if(val == 0)
        $('#news_optin_partners').val(1);
      else
        $('#news_optin_partners').val(0);
    });
    
    $('#my_account_optins_form').on('submit', function(e) {
          e.preventDefault();
      
          var $submit = $('#update_optins_submit_button');
          $submit.prop('disabled', true); // prevent form spamming
      
           $.ajax({type: "POST",
               url: "/ajax/edit-member-optins",
               data: { news_optin: $('#news_letter_optin').val(),
                 news_optin_partners: $('#news_optin_partners').val() },
               success:function(response){
                 $submit.prop('disabled', false);
                 if (response.success) {
                   window.notifier.clear();
                 } else {
                   window.notifier.clear();
                   window.notifier.display('error', String(response.message.error));
                 }
               },
               error:function(response)
               {
                 $submit.prop('disabled', false);
                 window.notifier.display('error', "Technical error");
               }
             }, 'JSON');
      
    });
  }
 }
$(function() {
   if ( $('#my_account_optins_form').length ) {
        init();
      }
  });
})(update_optins || {}, window, jQuery, parsley);