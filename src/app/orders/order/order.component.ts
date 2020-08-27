import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {ApiRequestService} from '../../services/api-request.service';
import {OfflineDetectorService} from '../../services/offline-detector.service';
import {DatabaseService} from '../../services/database.service';

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
  public qty_ordered: any;
  public qty_received: any;
  public qty_picked: any;
  public update: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    public apiRequestService: ApiRequestService,
    public offlineDetectorService: OfflineDetectorService,
    public databaseService: DatabaseService
  ) {
    this.orderid = this.route.snapshot.paramMap.get('orderid');
    this.update = [];
  }

  async ngOnInit() {
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null) {
      await this.loadOrderData().then(() => {

      });
    } else {
      this.logout();
    }
    document.getElementById('code_type').addEventListener('change', (e) => {
      //console.log('event registered', e);
      var code_type = e.target['value'];
      var code_value = (<HTMLInputElement>document.getElementById('barcode_value')).value;
      if (code_type == 'code_128'){
        this.addAsset(code_value)
      }else{
        this.openAssetModal();
      }
    });
    document.getElementById('barcode_value').addEventListener('change', function(e){
      //console.log('event registered', e);
    });
  }

  ngAfterViewChecked(){
    var rows = document.getElementsByTagName('tr');
    if(rows.length > 1){
      this.initClickableRows();
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
        const data = new Object();
        const orderId = this.orderid;
        const productStatus = this.orderData['4'];
        for (const item of this.orderItem)  {
            const dataItem = {
                received_qty: item.qty_received,
                date_received: item.date_received,
                product_status: productStatus
            };
            data[item.productid] = dataItem;
        }
        const assetsData = new Object();
        assetsData[orderId] = data;
        if (this.offlineDetectorService.isOnline){
            const params = {data: JSON.stringify(assetsData)};
            await this.apiRequestService.post(this.apiRequestService.ENDPOINT_CREATE_ASSET, params).subscribe(response => {
            }, error => {
            });
        } else {
            const db = await this.databaseService.getDb();
            db.asset_queue.add({data: assetsData});
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
  }

  addAsset(code){
    this.assetCount++;
    var update_a = {
        productname: this.productname,
        code: code,
      }
    this.update.push(update_a);
    console.log(this.update);
  }


  initClickableRows(){
    var app = this;
    var rows = document.getElementsByTagName('tr');
    console.log('the number of rows is', rows.length);
    Array.from(rows).forEach(function(row){
      row.addEventListener('click', function(this){
        console.log(this);
          var productname = this.getElementsByTagName('td')[0].innerHTML
          app.productname = productname;
          app.openAssetModal();
      })
    });
  }

}
