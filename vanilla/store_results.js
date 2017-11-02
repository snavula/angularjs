var storeSelect_zip_results = (function(self, window, $) {

    function init() {
        $( '.retailer_zip_results li' ).on( 'click', function() {
            $( this ).parent().find( 'li.selected' ).removeClass( 'selected' );
            $( this ).addClass('selected');
        });

        $('.retailer_zip_results_btn').on('click', function(e) {
            e.preventDefault();
            $( ".add-store-error" ).html();
            $.ajax({
                type: 'POST',
                url: '/ajax/set-member-store',
                data: { store_id: this.id },
                success:function(response){
                    console.log(response);
                    if (response.success) {
                        window.location = '/';
                    } else {
                        $( '.add-store-error' ).html(response.message.error);
                    }
                }
            }, 'JSON');
        });
    }

    $(function() {
        if ( $('.retailer_zip_results li').length ) init();
    });

})(storeSelect_zip_results || {}, window, jQuery);