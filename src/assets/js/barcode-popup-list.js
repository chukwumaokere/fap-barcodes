$(function() {

    $('#barcode-scan-event').on('barcode_scan_success', {result: null}, function (e, result) {
        result = result || e.data.result;
        if(!result){
            return false;
        }
        var code = result.codeResult.code,
            canvas = Quagga.canvas.dom.image;
        $('#barcodeScanPopup').trigger('check_barcode', [code, canvas]);
    });

    $('#barcode-scan-event').on('barcode_wand_input', {code: null}, function (e, code) {
        code = code || e.data.code;
        if(!code){
            return false;
        }
        var canvas = convert_string_to_barcode_canvas(code);
        $('#barcodeScanPopup').trigger('check_barcode', [code, canvas]);
    });

});
