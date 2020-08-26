import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTable } from 'simple-datatables';
import { OfflineDetectorService } from '../services/offline-detector.service';
import { OrdersService } from '../services/orders.service';
import  Dexie  from 'dexie';

declare var $: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class OrdersComponent implements OnInit {
  loggedin: Boolean;
  userid: Number;
  userdata: any;
  apiurl: any;
  vturl: any;
  loading: any;
  tableview: any;
  datatable: any;
  online: Boolean;

  dataReturned: any;

  data: any;

  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    public AppConfig: AppConfig,
    private offlineDetectorService: OfflineDetectorService,
    private readonly ordersService: OrdersService,
  ) {
    this.apiurl = this.AppConfig.apiurl;
    this.vturl = this.AppConfig.vturl;
    this.loggedin = true; // for development. remove in prod 
    //this.online = true; //for development. remove in prod
    //offline detector
    const setMsg = (flag) => {
        if (flag === true){
           this.online = true;
        }else{
           this.online = false;
        }
    }
    this.registerToEvents(offlineDetectorService);

    setMsg(navigator.onLine)

    window.addEventListener("online", () => {
      setMsg(true);
    })
    window.addEventListener("offline", () => {
      setMsg(false);
    })
    this.loadData().then(() => {
      console.log('loaded data async');
      this.initializeTable(this.data.PurchaseOrder);
    }).catch(error => {
      console.error(error);
    })
   }

  private registerToEvents(offlineDetectorService: OfflineDetectorService) {
   offlineDetectorService.connectionChanged.subscribe(online => {
      if (online) {
        this.online = true;
      } else {
        this.online = false;
      }
    });
  }

  ngOnInit(): void {
    if(localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null ){
      var online = this.online;
      var source;
      if (online == true){
        source = 'server'
      }else{
        source = 'local database'
      }
      var message = 'Orders loaded from ' + source;
      this.showToast(message);   
    }else{
      this.logout();
    }
  }

  logout(){
    console.log('logging out');
    try{
      localStorage.removeItem("userdata");
    }catch(err){

    }
    this.router.navigateByUrl('/login');
  }

  updateView(radio){
    this.tableview = radio.target.value;
    var tabledata = this.data[this.tableview];
    if( this.datatable != undefined) {
        this.datatable.destroy();
    }
    this.initializeTable(tabledata);
  }

  initializeTable(data){
    const t = document.createElement('table');
    var table = document.querySelector('#myTable');
  
    table.appendChild(t)
  
    this.datatable = new DataTable(t, {
        data,
        fixedHeight: true,
        perPage: 7,
        perPageSelect:[7, 10, 15, 20],
        filters: {"Job": ["Assistant", "Manager"]},
        columns: [
            {
                select: 4,
                type: "date",
                format: "MM/DD/YYYY"
            }
        ]
    })
    this.initClickableRows();
    var app = this;
    this.datatable.on('datatable.update', function(){
      app.initClickableRows();
    })
    this.datatable.on('datatable.page', function(){
      app.initClickableRows();
    })
  }

  initClickableRows(){
    var app = this;
    var rows = document.getElementsByTagName('tr');
    Array.from(rows).forEach(function(row){
      row.addEventListener('click', function(this){          
          var id = this.getElementsByTagName('td')[3].innerHTML
          app.router.navigateByUrl('/order/' + id);
      })
    });
  }
  
  showToast(msg){
    var options = {
      delay: 2000,
    };
    var toast = $(".toast");
    $(".toast").toast(options);
    $("#toast-body").html(msg);
    $(".toast").toast('show');
  }

  async loadData(){
    let db = await new Dexie('FAPBarcodes')
    db.version(1).stores({data: 'id,data'});
    db.open().catch(function(error){ console.error('Failed to open db: ' + (error.stack || error)) });
    const headers = [
      "Subject",
      "Vendor Name",
      "Vendor Order #",
      "FAP Order #",
      "Status",
      "Customer Name",
      "Job Name"
    ];
    let orderdata = await db['data'].bulkGet(['PurchaseOrder', 'SalesOrder']);
    console.log('is it loaded ', orderdata);
    
    var data = {
      "PurchaseOrder": {
        "headings": headers,
        "data": orderdata[0].data
      },
      "SalesOrder": {
        "headings": headers,
        "data": orderdata[1].data
      } 
    }
    this.data = data;
  }

}
