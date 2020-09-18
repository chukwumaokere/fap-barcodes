import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTable } from 'simple-datatables';
import { OfflineDetectorService } from '../services/offline-detector.service';
/*import { OrdersService } from '../services/orders.service';*/
import  Dexie from 'dexie';
import {UtilsService} from '../services/utils.service';
import {ApiRequestService} from '../services/api-request.service';
import {DatabaseService} from '../services/database.service';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class OrdersComponent implements OnInit {
  loggedin: boolean;
  userid: number;
  userdata: any;
  apiurl: any;
  vturl: any;
  loading: any;
  tableview: any;
  datatable: any;
  online: boolean;

  dataReturned: any;

  data: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    public appConfig: AppConfig,
    private offlineDetectorService: OfflineDetectorService,
    /*private readonly ordersService: OrdersService,*/
    public utilsService: UtilsService,
    public apiRequestService: ApiRequestService,
    public databaseService: DatabaseService,
    private SpinnerService: NgxSpinnerService
  ) {
    this.apiurl = this.appConfig.apiurl;
    this.vturl = this.appConfig.vturl;
    this.loggedin = true; // for development. remove in prod
    // this.online = true; //for development. remove in prod
    // offline detector
    const setMsg = (flag) => {
        if (flag === true){
           this.online = true;
        }else{
           this.online = false;
        }
    }
    this.registerToEvents(offlineDetectorService);

    setMsg(navigator.onLine)

    window.addEventListener('online', () => {
      setMsg(true);
    })
    window.addEventListener('offline', () => {
      setMsg(false);
    })
    this.loadData().then(() => {
      console.log('loaded data async');
    }).catch(error => {
      console.error(error);
    });
   }

  private registerToEvents(offlineDetectorService: OfflineDetectorService): void {
   offlineDetectorService.connectionChanged.subscribe(online => {
      if (online) {
        this.online = true;
      } else {
        this.online = false;
      }
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null ){
        const online = this.online;
        let source;
        if (online == true){
          source = 'server';
        }else{
          source = 'local database';
        }
        const message = 'Orders loaded from ' + source;
        this.utilsService.showToast(message);
    } else {
      this.logout();
    }
  }

  logout(): void {
    console.log('logging out');
    try{
      localStorage.removeItem('userdata');
    }catch (err){

    }
    this.router.navigateByUrl('/login');
  }

  updateView(radio): void {
    this.tableview = radio.target.value;
    const tabledata = this.data[this.tableview];
    if (this.datatable != undefined) {
        this.datatable.destroy();
    }
    this.initializeTable(tabledata);
  }

  initializeTable(data): void{
    const t = document.createElement('table');
    const table = document.querySelector('#myTable');
    const layout = {
      top: "{search}{select}",
      bottom: "{info}{pager}"
    }
    let placeholder = "Search by PO#/Vendor...";
    if (this.tableview == 'SalesOrder'){
        placeholder = "Search by SO#/Vendor...";
    }
    table.appendChild(t);

    this.datatable = new DataTable(t, {
        data,
        fixedHeight: true,
        perPage: 10,
        perPageSelect: [10, 15, 20],
        filters: {"Job": ["Assistant", "Manager"]},
        columns: [
            {
                select: 4,
                type: "date",
                format: "MM/DD/YYYY"
            }
        ],
        labels: {
          placeholder: placeholder
        },
        layout: layout
    })
    this.initClickableRows();
    const app = this;
    this.datatable.on('datatable.update', function(){
      app.initClickableRows();
    });
    this.datatable.on('datatable.page', function(){
      app.initClickableRows();
    });
  }

  initClickableRows(): void{
    var app = this;
    var rows = document.getElementsByTagName('tr');
    Array.from(rows).forEach(function(row){
      row.addEventListener('click', function(this){
          var id = this.getElementsByTagName('td')[3].innerHTML
          app.router.navigateByUrl('/order/' + id);
      });
    });
  }

  async loadData(): Promise<any>{
    const thisIntanse = this;
    if (this.online){
        thisIntanse.SpinnerService.show();
        this.apiRequestService.get(this.apiRequestService.ENDPOINT_ORDERS)
        .subscribe(data => {
            const responseData = data.body;
            const success = responseData.success;
            if (success === true){
                const value =  JSON.parse(data.body.data);
                console.log('data fetched', value);
                const dataList = [];
                for (const key in value){
                    const obj = value[key];
                    dataList.push({id: key, data: Array.from(obj['data']), items: Array.from(obj['items']), detail: Array.from(obj['detail'])});
                }
                // console.log(dataList);
                const db = new Dexie('FAPBarcodes');
                const dbConstruction = this.databaseService.getDbConstruction();
                db.version(1).stores(dbConstruction);
                db['data'].bulkPut(dataList).then(function(lastKey) {
                    thisIntanse.getDataFromIndexDB();
                    thisIntanse.SpinnerService.hide();
                }).catch(Dexie.BulkError, function (e) {
                });
            }else{
                console.log('failed to fetch data');
                thisIntanse.getDataFromIndexDB();
            }
        }, error => {
            console.log(error);
        });
    }else{
        thisIntanse.getDataFromIndexDB();
    }
  }

  async getDataFromIndexDB(): Promise<any>{
      const db = await this.databaseService.getDb();
      const headers = [
      'Subject',
      'Vendor Name',
      'Vendor Order #',
      'FAP Order #',
      'Status',
      'Customer Name',
      'Job Name'
      ];
      const orderdata = await db['data'].bulkGet(['PurchaseOrder', 'SalesOrder']);
    // console.log('is it loaded ', orderdata);

      const data = {
          "PurchaseOrder": {
            "headings": headers,
            "data": orderdata[0].data
          },
          "SalesOrder": {
            "headings": headers,
            "data": orderdata[1].data
          }
      };
      this.data = data;
      this.initializeTable(this.data.PurchaseOrder);
  }

}
