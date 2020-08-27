import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {ApiRequestService} from '../../services/api-request.service';
import {OfflineDetectorService} from '../../services/offline-detector.service';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
    orderid: any;
    public orderData: any;
    public orderItem: any;
    public orderType: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public orderService: OrderService,
        public apiRequestService: ApiRequestService,
        public offlineDetectorService: OfflineDetectorService,
        public databaseService: DatabaseService
    ) {
        this.orderid = this.route.snapshot.paramMap.get('orderid');
    }

    ngOnInit(): void {
        if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null) {
          this.loadOrderData();
        } else {
          this.logout();
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
}
