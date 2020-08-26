import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orderid: any;
  public orderData: any;
  public orderItem: any;

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
}
