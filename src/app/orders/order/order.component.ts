import {Component, OnInit, ViewEncapsulation, ɵɵresolveBody} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {ApiRequestService} from '../../services/api-request.service';
import {OfflineDetectorService} from '../../services/offline-detector.service';
import {DatabaseService} from '../../services/database.service';
import {UtilsService} from '../../services/utils.service';
import { ChangeDetectorRef } from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit {

  orderid: any;
  public orderData: any;
  public orderItem: any;
  public orderType: any;
  public orderKey: any;
  public orderDetail: any;
  public scanned_barcodes: any;
  public assetCount: any;
  public productname: any;
  public productid: any;
  public lineitemid: any;
  public qty_ordered: Number;
  public qty_received: Number;
  public qty_picked: Number;
  public update: any;
  public code_type: any;
  public valid_barcodes: any;
  public loadAPI: Promise<any>;
  public clickable_rows: Boolean = false;
  public dynamicScripts: Array<string> = ["./assets/js/quaggaJS/dist/quagga.js", './assets/js/quaggaJS/example/live_w_locator.js', './assets/js/quaggaJS/example/file_input.js', './assets/js/JsBarcode.js'];
  public reloadScripts: Boolean = true;
  public isProcess = false;

    public assetCountBox: any;
    public assetCountCase: any;
    public checkBoxByBox: Boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    public apiRequestService: ApiRequestService,
    public offlineDetectorService: OfflineDetectorService,
    public databaseService: DatabaseService,
    public utilsService: UtilsService,
    private cdRef: ChangeDetectorRef,
    private SpinnerService: NgxSpinnerService
  ) {
    this.orderid = this.route.snapshot.paramMap.get('orderid');
    this.update = [];
    this.clickable_rows = false;
  }

  public async ngOnInit(): Promise<any>{
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null) {
      await this.loadOrderData().then(() => {
          this.cdRef.detectChanges();
          this.initClickableRows();
          this.utilsService.setMsg(navigator.onLine);
      });
    } else {
      this.logout();
    }
    let app = this;
    document.getElementById('code_type').addEventListener('change', (e) => {
      // console.log('event registered', e);
      const codeType = e.target['value'];
      app.code_type = codeType;
    });
    document.getElementById('barcode_value').addEventListener('change', function(e){
      // console.log('event registered', e);
      const code_value = e.target['value'];
      const code_type = app.code_type;
      if (code_type == 'code_128'){
        app.addAsset(code_value);
      }else{
        app.openAssetModal();
      }
    });

    document.getElementById('input_qty_received').addEventListener('change', (e) => {
        // console.log('event registered', e);
        let input_qty_received = e.target['value'];
        var ordered = parseInt(document.getElementById('qty_ordered').innerHTML);
        if(input_qty_received > ordered){
            this.utilsService.showToast('Please enter a value lower than or equal Order Quantity.');
            input_qty_received = ordered;
        }
        $('#input_qty_received').val(input_qty_received);
        app.assetCountCase = input_qty_received;
    });
  }

  ngAfterViewChecked(): void{
      const rows = document.getElementsByTagName('tr');
      if (rows.length > 1 && this.clickable_rows == false){
        this.initClickableRows();
        this.clickable_rows = true;
      }
  }

  logout(): void {
    console.log('logging out');
    try {
      localStorage.removeItem('userdata');
    } catch (err) {

    }
  }

    public async createAssets(event): Promise<any> {
        const thisIntanse = this;
        if (thisIntanse.isProcess){
            return false;
        }
        thisIntanse.isProcess = true;
        thisIntanse.SpinnerService.show();
        const data = Object();
        const orderId = this.orderid;
        console.log(this.update);
        for (const item of this.update)  {
           // console.log(item);
           const productid = item.productid;
           if (data[productid] == undefined){
               data[productid] = Array();
           }
           data[productid].push(item);
        }
        const assetsData = Object();
        assetsData[orderId] = data;

        if (this.offlineDetectorService.isOnline){
            const params = {data: JSON.stringify(assetsData)};
            await this.apiRequestService.post(this.apiRequestService.ENDPOINT_CREATE_ASSET, params).subscribe(response => {
                console.log(response);
                if (response.body.success){
                    this.update = [];
                    const responseData = response.body.data;
                    const status = responseData['status'];
                    console.log(status);
                    $('span.OrderStatus').html(status);
                }
                this.utilsService.showToast('Save Completed');
                this.router.navigateByUrl('/');
            }, async error => {
              const db = await this.databaseService.getDb();
              db.asset_queue.add({data: assetsData});
              this.utilsService.showToast('Update failed, please try again <br>' + error);
              thisIntanse.isProcess = false;
            });
        } else {
            const db = await this.databaseService.getDb();
            db.asset_queue.add({data: assetsData});
            this.utilsService.showToast('Update queued until you are online');
            thisIntanse.isProcess = false;
            this.router.navigateByUrl('/');
        }
    }


  public async loadOrderData(): Promise<any> {
    const order = await this.orderService.getOrderById(this.orderid);
    console.log(order);
    this.orderData = order.order;
    this.orderItem = order.items;
    this.orderType = order.type;
    this.orderKey = order.item_key;
    this.orderDetail = order.order_detail;
  }

  openAssetModal(): void{
    $('#exampleModalCenter').modal('show');
    if (this.reloadScripts == true){
      this.loadScript();
      this.reloadScripts = false;
    }
    $('#exampleModalCenter').on('hide.bs.modal', e => {
        document.querySelector('ul.thumbnails').innerHTML='';
        try{
          document.querySelector('canvas.imgBuffer').remove();
          document.querySelector('canvas.drawingBuffer').remove();
        }catch(err){
          console.log('doesn\'t exist or cant remove', err);
        }

    });
  }
  cancelChanges(): void{
    //Switch to use a presented modal, not confirm dialog
      /*if(confirm("Are you sure to cancel change?")) {
          console.log("Yessss");
          
          $('#exampleModalCenter').modal('hide');
      }*/
      console.log('started with', this.update);
      this.update= [];
      console.log('ended with', this.update);
      $('#exampleModalCenter').modal('hide');
      $('#globalModal').modal('show');
  }

    saveChanges(): void{
        let count_qty = this.assetCountBox;
        if (!this.checkBoxByBox){
          count_qty = this.assetCountCase;
        }
        const lineItemName = $('td.lineItemName[data-lineitemid=' + this.lineitemid + ']');
        const lineItem = lineItemName.closest('tr');
        lineItem.find('td.itemqty_received').html(count_qty);
        const lineItemIndex = lineItem.data('index');
        if (this.orderType == 'SalesOrder') {
            let picked_all = true;
            $('.items-list tbody tr').each(() => {
                var qty = $(this).find('td.itemqty').html();
                var qty_received = $(this).find('td.itemqty_received').html();
                if (qty != qty_received) {
                    picked_all = false;
                    return false;
                }
            });
            if (picked_all) {
                $('span.OrderStatus').html('Picked');
            }
        }
        $('#exampleModalCenter').modal('hide');
        this.update[lineItemIndex]['count_qty'] = count_qty;
    }

  addAsset(code): void{
      var scanBarCodeSuccess = false;
      console.log('check ', typeof(this.assetCount), typeof(this.qty_ordered));
      if ((this.assetCountBox < this.qty_ordered && this.checkBoxByBox) || (this.assetCountCase <= this.qty_ordered && !this.checkBoxByBox) ){
          var found = this.update.some(el => el.code === code);
          if (!found){
              var valid_barcodes = this.valid_barcodes;
              if (this.orderType == 'SalesOrder' && valid_barcodes.includes(code)){
                  var status;
                  if (this.orderType == 'SalesOrder'){
                    status = 'Picked';
                  }
                  scanBarCodeSuccess = true;
                  document.getElementById('wand-input').dispatchEvent(new Event('scan_success', {bubbles: true}));
              }else if (this.orderType == 'PurchaseOrder'){
                  if (this.orderType == 'PurchaseOrder'){
                    status = 'Received';
                  }
                  scanBarCodeSuccess = true;
                  document.getElementById('wand-input').dispatchEvent(new Event('scan_success', {bubbles: true}));
              }else{
                  try {
                      console.log('deleting newly scanned item')
                      document.getElementsByClassName('thumbnails')[0].firstChild.remove();
                  }catch(err){
                      console.log('failed to deleted ', err);
                  }
                document.getElementById('trigger_on_fail').dispatchEvent(new Event('change', {bubbles:true}));
                  document.getElementById('wand-input').dispatchEvent(new Event('scan_failed', {bubbles: true}));
                this.utilsService.showToast('This barcode is not a valid barcode for this order/product');
                //Delete most recent barcode thumbnail.
              }
              if(scanBarCodeSuccess){
                  this.assetCountBox++;
                  if(this.assetCountCase == 0 || this.assetCountCase == '') {
                      this.assetCountCase++;
                  }
                  if(this.checkBoxByBox){
                      var count_qty = this.assetCountBox;
                  }
                  else{
                      var count_qty = this.assetCountCase;
                  }
                  var update_a = {
                      productname: this.productname,
                      code: code,
                      status: status,
                      productid: this.productid,
                      lineitemid: this.lineitemid,
                      checkBoxByBox: this.checkBoxByBox,
                      count_qty: count_qty
                  };
                  this.update.push(update_a);
                  console.log(this.update);
              }
          }else{
              this.utilsService.showToast('This barcode has already been scanned and assigned previously');
          }
      }else{
        this.utilsService.showToast('All items have already been checked in.');
      }
  }

  initClickableRows(): void{
    const app = this;
    const rows = document.getElementsByTagName('tr');
    console.log('the number of rows is', rows.length);
    Array.from(rows).forEach(function(row){
      row.addEventListener('click', function(this){
        const productname = $(this).find('.lineItemName').html();
        app.qty_ordered = Number($(this).find('.itemqty').html());
        app.assetCount = Number($(this).find('.itemqty_received').html());
        app.assetCountBox = app.assetCount;
        app.assetCountCase = app.assetCount;
        const vb = JSON.parse((this.getElementsByClassName('itemqty')[0] as HTMLElement).dataset.validbarcodes);
        const validBarcodes = Object.values(vb);
        console.log(validBarcodes);
        app.valid_barcodes = validBarcodes;
        app.productname = productname;
        app.productid = $(this).find('.lineItemName').data('productid');
        app.lineitemid = $(this).find('.lineItemName').data('lineitemid');
        if(app.qty_ordered > app.assetCount){
            app.openAssetModal();
        }
        else{
            if(app.orderType == 'SalesOrder'){
                app.utilsService.showToast('All Items Have Been Scanned And Picked.');
            }else{
                app.utilsService.showToast('All Items Have Been Scanned And Received.');
            }
        }
      });
    });
  }

  public loadScript(): void {
    let isFound = false;
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; ++i) {
        if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes('loader')) {
            isFound = true;
        }
    }

    if (!isFound) {
        const dynamicScripts = this.dynamicScripts;

        for (let i = 0; i < dynamicScripts.length; i++) {
            const node = document.createElement('script');
            const body = <HTMLDivElement> document.body;
            node.src = dynamicScripts [i];
            node.type = 'text/javascript';
            node.async = false;
            node.charset = 'utf-8';
            body.appendChild(node);
        }

    }
  }

  public unloadScripts(): void{
    let isFound = false;
    const scripts = document.getElementsByTagName('script')
    const body = <HTMLDivElement> document.body;
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].getAttribute('src') != null && this.dynamicScripts.includes(scripts[i].getAttribute('src'))) {
          isFound = true;
          console.log(scripts[i], scripts[i].getAttribute('src'), i)
          body.removeChild(scripts[i]);
      }
    }
  }
  public goToOrders(): void{
    console.log('started with', this.update);
    this.update= [];
    console.log('ended with', this.update);
    this.router.navigateByUrl('/');
  }
  public cancelOrderChanges(): void{
      $('#globalModalTwo').modal('show');
  }

  public toogleScanBox(): void{
      const app = this;
      if(!$('.toogleScan').is(':checked')){
          $('#qty_received #txt_qty').hide();
          $('#qty_received #input_qty_received').show();
          app.assetCountCase = $('#qty_received #input_qty_received').val();
          app.checkBoxByBox = false;
      }
      else{
          $('#qty_received #txt_qty').show();
          $('#qty_received #input_qty_received').hide();
          app.assetCountBox = $('#qty_received #txt_qty').html();
          app.checkBoxByBox = true;
      }

  }

}
