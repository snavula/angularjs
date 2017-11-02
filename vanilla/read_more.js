var read_more_offer_desc = (function(self, window, $) {

    function init() {
        $('#offer_detail_readmore_link').on( 'click', function() {
            $('#offer_detail_truncated_desc').hide();
            $('#offer_detail_full_desc').show();
        });
    }

    $(function() {
        if ( $('#offer_detail_readmore_link').length ) init();
    });

})(read_more_offer_desc || {}, window, jQuery);