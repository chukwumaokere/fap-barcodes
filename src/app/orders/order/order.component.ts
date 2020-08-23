import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orderid: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { this.orderid = this.route.snapshot.paramMap.get('orderid'); }

  ngOnInit(): void {
    

  }
  

}
