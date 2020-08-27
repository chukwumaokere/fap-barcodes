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
  public scanned_barcodes: any;
  public assetCount: any = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService
  ) {
    this.orderid = this.route.snapshot.paramMap.get('orderid');
  }

  ngOnInit(): void {
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null) {
      this.loadOrderData();
    } else {
      this.logout();
    }
    this.openAssetModal();
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
  }

  openAssetModal(){
    $('#exampleModalCenter').modal('show');
  }
  
  addAsset(code){
    this.assetCount++;
  }

  
}
