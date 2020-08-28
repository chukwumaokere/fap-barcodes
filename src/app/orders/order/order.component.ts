import {Component, OnInit, ViewEncapsulation, ɵɵresolveBody} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {ApiRequestService} from '../../services/api-request.service';
import {OfflineDetectorService} from '../../services/offline-detector.service';
import {DatabaseService} from '../../services/database.service';
import {UtilsService} from '../../services/utils.service';
/*
import * as quag from '../../../assets/js/quaggaJS/dist/quagga.js';
import * as fi from '../../../assets/js/quaggaJS/example/file_input.js';
import * as lw from '../../../assets/js/quaggaJS/example/live_w_locator.js';
*/

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
  public scanned_barcodes: any;
  public assetCount: any = 0;
  public productname: any;
  public productid: any;
  public qty_ordered: any = 3;
  public qty_received: any;
  public qty_picked: any;
  public update: any;
  public code_type: any;
  public valid_barcodes: any;
  public loadAPI: Promise<any>;
  public clickable_rows: Boolean = false;
  public dynamicScripts: Array<string> = ["../../../assets/js/quaggaJS/dist/quagga.js", '../../../assets/js/quaggaJS/example/live_w_locator.js', '../../../assets/js/quaggaJS/example/file_input.js'];
  public reloadScripts: Boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    public apiRequestService: ApiRequestService,
    public offlineDetectorService: OfflineDetectorService,
    public databaseService: DatabaseService,
    public utilsService: UtilsService
  ) {
    this.orderid = this.route.snapshot.paramMap.get('orderid');
    this.update = [];
    this.clickable_rows = false;
  }

  public async ngOnInit(): Promise<any>{
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null) {
      await this.loadOrderData().then(() => {

      });
    } else {
      this.logout();
    }
    let app = this;
    document.getElementById('code_type').addEventListener('change', (e) => {
      // console.log('event registered', e);
      const code_type = e.target['value'];
      app.code_type = code_type;
    });
    document.getElementById('barcode_value').addEventListener('change', function(e){
      // console.log('event registered', e);
      var code_value = e.target['value'];
      var code_type = app.code_type;
      if (code_type == 'code_128'){
        app.addAsset(code_value);
      }else{
        app.openAssetModal();
      }
    });
  }

  ngAfterViewChecked(){
    var rows = document.getElementsByTagName('tr');
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

    public async createAssets(): Promise<any> {
        const data = Object();
        const orderId = this.orderid;
       /* const productStatus = this.orderData['4'];
        for (const item of this.orderItem)  {
            const dataItem = {
                received_qty: item.qty_received,
                date_received: item.date_received,
                product_status: productStatus
            };
            data[item.productid] = dataItem;
        }*/
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
                this.utilsService.showToast('Save Completed');
            }, async error => {
              const db = await this.databaseService.getDb();
              db.asset_queue.add({data: assetsData});
              this.utilsService.showToast('Update failed, please try again <br>' + error);
            });
        } else {
            const db = await this.databaseService.getDb();
            db.asset_queue.add({data: assetsData});
            this.utilsService.showToast('Update queued until you are online');
        }
    }


  public async loadOrderData(): Promise<any> {
    const order = await this.orderService.getOrderById(this.orderid);
    this.orderData = order.order;
    this.orderItem = order.items;
    this.orderType = order.type;
  }

  openAssetModal(){
    $('#exampleModalCenter').modal('show');
    if (this.reloadScripts == true){
      this.loadScript();
      this.reloadScripts = false;
    }
    $('#exampleModalCenter').on('hide.bs.modal', e => {
      //this.unloadScripts();
      //console.log('hidden');      
    })
  }

  addAsset(code): void{
    console.log(this.assetCount);
    console.log(this.qty_ordered);
    if (this.assetCount < this.qty_ordered){
      var found = this.update.some(el => el.code === code);
      if (!found){
        var valid_barcodes = this.valid_barcodes;
        if (this.orderType == 'SalesOrder' && valid_barcodes.includes(code)){
          var status;
          if (this.orderType == 'SalesOrder'){
            status = 'Picked';
          }
          var update_a = {
            productname: this.productname,
            code: code,
            status: status,
            productid: this.productid
          }
          this.update.push(update_a);
          console.log(this.update);
          this.assetCount++;
        }else if (this.orderType == 'PurchaseOrder'){
          if (this.orderType == 'PurchaseOrder'){
            status = 'Received';
          }
          var update_a = {
              productname: this.productname,
              code: code,
              status: status,
              productid: this.productid
          };
          this.update.push(update_a);
          console.log(this.update);
          this.assetCount++;
        }else{
          this.utilsService.showToast('This barcode is not a valid barcode for this order/product');
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
    var rows = document.getElementsByTagName('tr');
    // console.log('the number of rows is', rows.length);
    Array.from(rows).forEach(function(row){
      row.addEventListener('click', function(this){
        const productname = this.getElementsByTagName('td')[0].innerHTML;
        app.qty_ordered = this.getElementsByTagName('td')[2].innerHTML;
        app.assetCount = this.getElementsByTagName('td')[3].innerHTML;
        app.valid_barcodes = ['chuck test1', 'chuck test2', 'chuck test3', 'chuck test4']; // need to fetch a list of valid barcodes from current row that was clicked.
        app.productname = productname;
        app.productid = $(this).find('.lineItemName').data('productid');
        app.openAssetModal();
      });
    });
  }

  public loadScript() {        
    var isFound = false;
    var scripts = document.getElementsByTagName("script")
    for (var i = 0; i < scripts.length; ++i) {
        if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes("loader")) {
            isFound = true;
        }
    }

    if (!isFound) {
        var dynamicScripts= this.dynamicScripts;

        for (var i = 0; i < dynamicScripts.length; i++) {
            let node = document.createElement('script');
            let body = <HTMLDivElement> document.body;
            node.src = dynamicScripts [i];
            node.type = 'text/javascript';
            node.async = false;
            node.charset = 'utf-8';
            body.appendChild(node);
        }

    }
  }

  public unloadScripts(){
    var isFound = false;
    var scripts = document.getElementsByTagName("script")
    let body = <HTMLDivElement> document.body;
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].getAttribute('src') != null && this.dynamicScripts.includes(scripts[i].getAttribute('src'))) {
          isFound = true;
          console.log(scripts[i], scripts[i].getAttribute('src'), i)
          body.removeChild(scripts[i]);
      }
    }
  }

}
