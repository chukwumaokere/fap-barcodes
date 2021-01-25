$(function() {
    $('#wand-input').on('keypress', function (e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode == '9' || keycode == '13'){ // tab or enter
            e.preventDefault();
            var _this = $(this);
            var code = $(this).val();
            if(!code){
                return false;
            }
            $('#barcode-scan-event').trigger('barcode_wand_input', [code]);
        }
    });

    $('#barcode-scan-event').on('barcode_wand_input_clean', {}, function (e) {
        $('#wand-input').val('');
    });

    $('#barcode-scan-event').on('barcode_wand_input_select', {}, function (e) {
        var input = $('#wand-input');
        if (input.val() != ''){
            input.select();
        }
    });
});

function convert_string_to_barcode_canvas(str) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, str, {format: "CODE128"});
    return canvas;
}

function convert_string_to_barcode_canvas_data(str) {
    var canvas = convert_string_to_barcode_canvas(str);
    return canvas.toDataURL("image/png");
}
