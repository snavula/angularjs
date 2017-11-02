/*
    mycard.js
 */


var mycard = (function(self, window, $){

    function init() {
        //Delete link
        $(".delete-fsc").on("click", function () {
            if (confirm('あなたはカードを削除してもよろしいですか？')) {
                var fsc_id      = (0 === $("#fsc_id").length      ? "" : $("#fsc_id").val());
                var retailer_id = (0 === $("#retailer_id").length ? "" : $("#retailer_id").val());
                $.post('/ajax/remove-fsc-card', {"holder_id": fsc_id, "retailer_id": retailer_id},
                    function (response) {
                        window.notifier.clear(); // clear any existing notifications
                        if (response.success) {
                            // If there was an error with an optional step, e.g. FSC registration,
                            // store the response message to be displayed on the next page.
                            if (response.hasOwnProperty('message')) {
                                if (response.message.hasOwnProperty('error')) {
                                    window.notifier.store('error', response.message.error);
                                }
                            }
                            alert('カード番号を削除しました');
                            window.location.href = '/account/mycard/'+retailer_id;
                        }
                        else {
                            alert("Some error occured");
                        }
                    },
                'json');
            }
        });
    };

    $(function() {
        init();
    })

})(mycard || {}, window, $);