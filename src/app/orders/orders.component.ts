import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  loggedin: Boolean;
  userid: Number;
  userdata: any;
  apiurl: any;
  vturl: any;
  loading: any;
  dataReturned: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    public AppConfig: AppConfig
  ) {
    this.apiurl = this.AppConfig.apiurl;
    this.vturl = this.AppConfig.vturl;
   }

  ngOnInit(): void {
    if (this.loggedin !== true){
      this.logout();
    }
  }

  logout(){
    console.log('logging out');
    this.router.navigateByUrl('/login');
  }

  loadOrders(){
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');

    this.httpClient.get(this.apiurl + 'getorders.php', {headers, observe: 'response'})
      .subscribe(data =>{
        const responseData = data.body;
        const success = responseData['success'];
        console.log(data);
        if(success == true){
          //... do something with that data.
        }else{
          console.log('failed to fetch data');
        }
      }, error =>{
        console.log(error);
      })
  }

}
