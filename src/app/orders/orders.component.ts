import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTable } from 'simple-datatables';
import { OfflineDetectorService } from '../services/offline-detector.service';
/*import { OrdersService } from '../services/orders.service';*/
import Dexie from 'dexie';
import {UtilsService} from '../services/utils.service';
import {ApiRequestService} from '../services/api-request.service';
import {DatabaseService} from '../services/database.service';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class OrdersComponent implements OnInit {
  loggedin: boolean;
  userid: number;
  userdata: any;
  apiurl: any;
  vturl: any;
  loading: any;
  tableview: any;
  datatable: any;
  online: boolean;
    public dynamicScripts: Array<string> = [
        './assets/js/quaggaJS/dist/quagga.js',
        './assets/js/JsBarcode.js',
        './assets/js/bootstrap-datepicker.js',
        './assets/js/barcode-locator.js',
        './assets/js/barcode-input.js',
        './assets/js/barcode-wand.js',
        './assets/js/barcode-popup-list.js'
    ];
    public reloadScripts = true;
    public assetCountBox: any;
    public assetCountCase: any;
    public checkBoxByBox = true;
    public vendorList = [];
    public codeScaned = [];

  dataReturned: any;

  data: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    public appConfig: AppConfig,
    private offlineDetectorService: OfflineDetectorService,
    /*private readonly ordersService: OrdersService,*/
    public utilsService: UtilsService,
    public apiRequestService: ApiRequestService,
    public databaseService: DatabaseService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.apiurl = this.appConfig.apiurl;
    this.vturl = this.appConfig.vturl;
    this.loggedin = true; // for development. remove in prod
    // this.online = true; //for development. remove in prod
    // offline detector
    const setMsg = (flag) => {
        if (flag === true){
           this.online = true;
        }else{
           this.online = false;
        }
    }
    this.registerToEvents(offlineDetectorService);

    setMsg(navigator.onLine)

    window.addEventListener('online', () => {
      setMsg(true);
    })
    window.addEventListener('offline', () => {
      setMsg(false);
    })
    this.loadData().then(() => {
      console.log('loaded data async');
    }).catch(error => {
      console.error(error);
    });
    this.loadVendorList();
   }

  private registerToEvents(offlineDetectorService: OfflineDetectorService): void {
   offlineDetectorService.connectionChanged.subscribe(online => {
      if (online) {
        this.online = true;
      } else {
        this.online = false;
      }
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null ){
        const online = this.online;
        let source;
        if (online == true){
          source = 'server';
        }else{
          source = 'local database';
        }
        const message = 'Orders loaded from ' + source;
        this.utilsService.showToast(message);
        this.popupUiAction();
    } else {
      this.logout();
    }
  }

  logout(): void {
    console.log('logging out');
    try{
      localStorage.removeItem('userdata');
    }catch (err){

    }
    this.router.navigateByUrl('/login');
  }

  updateView(radio): void {
    this.tableview = radio.target.value;
    const tabledata = this.data[this.tableview];
    if (this.datatable != undefined) {
        this.datatable.destroy();
    }
    this.initializeTable(tabledata);
  }

  initializeTable(data): void{
    const t = document.createElement('table');
    const table = document.querySelector('#myTable');
    const layout = {
      top: "{search}{select}",
      bottom: "{info}{pager}"
    }
    let placeholder = "Search by PO#/Vendor";
    if (this.tableview == 'SalesOrder'){
        placeholder = "Search by SO#/Vendor";
    }
    table.appendChild(t);

    this.datatable = new DataTable(t, {
        data,
        fixedHeight: true,
        perPage: 10,
        perPageSelect: [10, 15, 20],
        filters: {"Job": ["Assistant", "Manager"]},
        columns: [
            {
                select: 4,
                type: "date",
                format: "MM/DD/YYYY"
            }
        ],
        labels: {
          placeholder: placeholder
        },
        layout: layout
    })
    this.initClickableRows();
    const app = this;
    this.datatable.on('datatable.update', function(){
      app.initClickableRows();
    });
    this.datatable.on('datatable.page', function(){
      app.initClickableRows();
    });
  }

  initClickableRows(): void{
    var app = this;
    var rows = document.getElementsByTagName('tr');
    Array.from(rows).forEach(function(row){
      row.addEventListener('click', function(this){
          var id = this.getElementsByTagName('td')[3].innerHTML
          app.router.navigateByUrl('/order/' + id);
      });
    });
  }

  async loadData(): Promise<any>{
    const thisIntanse = this;
    if (this.online){
        thisIntanse.SpinnerService.show();
        this.apiRequestService.get(this.apiRequestService.ENDPOINT_ORDERS)
        .subscribe(data => {
            const responseData = data.body;
            const success = responseData.success;
            if (success === true){
                const value =  JSON.parse(data.body.data);
                console.log('data fetched', value);
                const dataList = [];
                for (const key in value){
                    const obj = value[key];
                    dataList.push({id: key, data: Array.from(obj['data']), items: Array.from(obj['items']), detail: Array.from(obj['detail'])});
                }
                // console.log(dataList);
                const db = new Dexie('FAPBarcodes');
                const dbConstruction = this.databaseService.getDbConstruction();
                db.version(1).stores(dbConstruction);
                db['data'].bulkPut(dataList).then(function(lastKey) {
                    thisIntanse.getDataFromIndexDB();
                    thisIntanse.SpinnerService.hide();
                    const newSoId = thisIntanse.utilsService.getCookie('new_so_id');
                    if (newSoId){
                        thisIntanse.utilsService.deleteCookie('new_so_id');
                        window.open('order/' + newSoId, '_blank');
                    }
                }).catch(Dexie.BulkError, function (e) {
                });
            }else{
                console.log('failed to fetch data');
                thisIntanse.getDataFromIndexDB();
            }
        }, error => {
            console.log(error);
        });
    }else{
        thisIntanse.getDataFromIndexDB();
    }
  }

  async getDataFromIndexDB(): Promise<any>{
      const db = await this.databaseService.getDb();
      const headers = [
      'Subject',
      'Vendor Name',
      'Vendor Order #',
      'FAP Order #',
      'Status',
      'Customer Name',
      'Job Name'
      ];
      const orderdata = await db['data'].bulkGet(['PurchaseOrder', 'SalesOrder']);
    // console.log('is it loaded ', orderdata);

      const data = {
          "PurchaseOrder": {
            "headings": headers,
            "data": orderdata[0].data
          },
          "SalesOrder": {
            "headings": headers,
            "data": orderdata[1].data
          }
      };
      this.data = data;
      this.initializeTable(this.data.PurchaseOrder);
  }

    public openScanBarcodePopup(): void {
        const app = this;
        $('#barcodeScanPopup').modal('show');
        app.setScanBarcodeDefaultData();
        if (this.reloadScripts === true){
            this.loadScript();
            this.reloadScripts = false;
        }
        /*$('#barcodeScanPopup').on('hide.bs.modal', e => {
            document.querySelector('ul.thumbnails').innerHTML = '';
            try{
                app.resetScanBarcodeForm();
                // document.querySelector('canvas.imgBuffer').remove();
                // document.querySelector('canvas.drawingBuffer').remove();
            } catch (err){
                console.log('doesn\'t exist or cant remove', err);
            }
        });*/
    }

    public loadScript(): void {
        let isFound = false;
        const scripts = document.getElementsByTagName('script');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < scripts.length; ++i) {
            if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes('loader')) {
                isFound = true;
            }
        }
        if (!isFound) {
            const dynamicScripts = this.dynamicScripts;
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < dynamicScripts.length; i++) {
                const node = document.createElement('script');
                const body = document.body as HTMLDivElement;
                node.src = dynamicScripts [i];
                node.type = 'text/javascript';
                node.async = false;
                node.charset = 'utf-8';
                body.appendChild(node);
            }
        }
    }

    public toogleScanBox(): void{
        if ($('.toogleScan').is(':checked')){
            // $('.item-qty').prop('readonly', true);
            $('.item-qty').hide();
            $('.item-qty-text').show();
        } else{
            // $('.item-qty').removeAttr('readonly');
            $('.item-qty').show();
            $('.item-qty-text').hide();
        }
    }

    public cancelChanges(): void{
        $('#barcodeScanPopup').modal('hide');
        $('#barcodeScanPopupConfirm').modal('show');
    }

    public popupUiAction(): void {
        let app = this;
        $('#barcodeScanPopup').on('check_barcode', {}, (e, code, canvas) => {
            if (code){
                // check by api
                app.validatePosCode(code, canvas);
            }
        });

        $('#barcodeScanPopup').on('show_item', {}, (e, code, name, qty, productId) => {
            let isItemFound = false;
            $('#popup-list-item > .item_row').each((i, v) => {
                // tslint:disable-next-line:triple-equals
                if ($(v).data('code') == productId){
                    // tslint:disable-next-line:no-shadowed-variable
                    let qty = $(v).find('.item-qty').val();
                    let assetCode = $(v).find('.item-code').val();
                    assetCode = assetCode + ',' + code;
                    if (!qty) { qty = 1; }
                    qty++;
                    $(v).find('.item-qty').val(qty);
                    $(v).find('.item-qty-text').html(qty);
                    $(v).find('.item-code').val(assetCode);
                    isItemFound = true;
                }
            });
            let readonlyText = '';
            let labelStyle = '';
            let inputStyle = '';
            if ($('.toogleScan').is(':checked')){
                readonlyText = 'readonly="readonly"';
                labelStyle = 'display:block;';
                inputStyle = 'display:none;';
            } else {
                labelStyle = 'display:none;';
                inputStyle = 'display:block;';
            }
            if (!isItemFound){
                const itemHtml = '<div class="row form-group item_row" data-code="' + productId + '">\
                                    <input type="hidden" name="pos-code[]" class="item-code" value="' + code + '"/>\
                                    <div class="col-md-9">' + name + '</div>\
                                    <div class="col-md-3"><span class="item-qty-text" style="' + labelStyle + '">1</span><input type="text" class="item-qty form-control" style="' + inputStyle + '" value="1" name="pos-qty[]"/></div>\
                                </div>';
                $('#popup-list-item').append(itemHtml);
            }
            app.codeScaned.push(code);
        });

        $('#pos-dealer-name').autocomplete({
            source: (request, response) => {
                const searchName = $('#pos-dealer-name').val();
                const params = {name: searchName};
                app.apiRequestService.post(app.apiRequestService.ENDPOINT_POS_SEARCH_ACC, params).subscribe(responseData => {
                    const responseDataBody = responseData.body;
                    if (responseDataBody.status === 'success'){
                        response(responseDataBody.data);
                    }
                }, error => {});
            },
            select: (event, ui) => {
                // event.preventDefault();
                // $(this).val(ui.item.label);
                $('#pos-dealer').val(ui.item.id);
            },
            minLength: 3
        });

        $('#confirm-hide-barcode-popup').on('click', (e) => {
            $('#barcodeScanPopup').modal('hide');
            $('#barcodeScanPopupConfirm').modal('hide');
            app.resetScanBarcodeForm();
        });
    }

    public submitPosForm(): void {
        const app = this;
        const posNumber = $('#pos-number').val();
        const posDealer = $('#pos-dealer').val();
        const posVendor = $('#pos-vendor').val();
        const posContact = $('#pos-contact').val();
        const posJob = $('#pos-job').val();
        const posDate = $('#pos-date').val();
        const lineItem = [];
        // tslint:disable-next-line:one-variable-per-declaration
        let itemCode, itemQty, item;
        $('#popup-list-item > .item_row').each((i, v) => {
            item = $(v);
            itemCode = item.find('.item-code').val();
            itemQty = item.find('.item-qty').val();
            lineItem.push({
                code: itemCode,
                qty: itemQty
            });
        });
        const formData = {
            cf_960: posNumber,
            account_id: posDealer,
            cf_contact_name: posContact,
            subject: posJob,
            duedate: posDate,
            sostatus: 'Created',
            cf_vendor_id: posVendor,
            lineItems: lineItem
        };
        app.apiRequestService.post(app.apiRequestService.ENDPOINT_POS_CREATE_SO, formData).subscribe(response => {
            const responseData = response.body;
            if (responseData.status === 'success'){
                if (responseData.data.soUrl){
                    window.open(responseData.data.soUrl, '_blank');
                } else {
                    app.utilsService.setCookie('new_so_id', responseData.data.soId, 365);
                }
                app.cancelChanges();
                window.location.reload();
            } else {
                app.utilsService.showToast(responseData.message);
            }
        }, error => {
            // do nothing
        });
    }

    async validatePosCode(barcodeCode, canvas): Promise <any>{
        const app = this;
        if (app.codeScaned.indexOf(barcodeCode) > -1){
            app.utilsService.showToast('This barcode has already been scanned and assigned previously.');
            $('#barcode-scan-event').trigger('barcode_wand_input_clean');
            return false;
        }
        const params = {
            code : barcodeCode
        };
        app.apiRequestService.post(this.apiRequestService.ENDPOINT_POS_VALIDATE, params).subscribe(response => {
            const responseData = response.body;
            if (responseData.status === 'success'){
                const itemData = responseData.data;
                $('#barcodeScanPopup').trigger('show_item', [barcodeCode, itemData.name, 1, itemData.product_id]);
                $('#barcode-scan-event').trigger('barcode_show_img', [barcodeCode, canvas]);
                $('#barcode-scan-event').trigger('barcode_wand_input_clean');
            } else {
                app.utilsService.showToast(responseData.message);
                $('#barcode-scan-event').trigger('barcode_wand_input_select');
            }
        }, error => {
            // do nothing
        });
    }

    async loadVendorList(): Promise<any>{
        const app = this;
        app.apiRequestService.post(app.apiRequestService.ENDPOINT_POS_VENDOR, {}).subscribe(response => {
            const responseData = response.body;
            if (responseData.status === 'success'){
                console.log(responseData);
                app.vendorList = responseData.data;
            }
        }, error => {});
    }

    public resetScanBarcodeForm(): void {
        $('#pos-number').val('');
        $('#pos-dealer').val('');
        $('#pos-dealer-name').val('');
        $('#pos-vendor').val('');
        $('#pos-contact').val('');
        $('#pos-job').val('');
        $('#pos-date').val('');
        $('#popup-list-item').html('');
        $('ul.thumbnails').html('');
        this.setScanBarcodeDefaultData();
        this.codeScaned = [];
    }

    public setScanBarcodeDefaultData(): void {
        $('#pos-vendor > option').each((i, v) => {
            let option = $(v);
            if (option.html() === 'FAP Retail'){
                const value = option.val();
                $('#pos-vendor').val(value);
            }
        });
    }
}
