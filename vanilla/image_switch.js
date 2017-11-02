var image_switch = (function(self, window, $, parsley){

 function init() {
  if($('.related-pictures').length) {  
    $('.related-pictures').on('click', function (e) {
      var main_img = $('#offer_detail_image').attr('src');
      var related_img = $(this).attr('src');
      $('#offer_detail_image').attr('src', related_img);
      $(this).attr('src', main_img);
    });
  }
 }
  
$(function() {
   if ( $('.related-pictures').length ) {
        init();
      }
  });
})(image_switch || {}, window, jQuery, parsley);