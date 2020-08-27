import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';

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
    public orderService: OrderService
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
    })
    document.getElementById('barcode_value').addEventListener('change', function(e){
      //console.log('event registered', e);
    })
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
    this.router.navigateByUrl('/login');
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
