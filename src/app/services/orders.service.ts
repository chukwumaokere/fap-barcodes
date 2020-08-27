import { Injectable } from '@angular/core';
import { OfflineDetectorService } from './offline-detector.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import  Dexie from 'dexie';
import {DatabaseService} from './database.service';
import {ApiRequestService} from './api-request.service';

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
  online: boolean;
  apiurl: any;
  vturl: any;
  orders: any;
  private db: any;
  private requests: any;

  constructor(
    private offlineDetectorService: OfflineDetectorService,
    private httpClient: HttpClient,
    public appConfig: AppConfig,
    public databaseService: DatabaseService,
    public apiRequestService: ApiRequestService,
  ) {
    this.apiurl = this.appConfig.apiurl;
    this.vturl = this.appConfig.vturl;
    this.registerToEvents(offlineDetectorService);
    this.db = new Dexie('FAPBarcodes');
    const app = this;
    Dexie.exists('FAPBarcodes').then(function (exists){
      if (exists){
        console.log('Database already exists. Updating instead');
        app.updateDatabases();
      }else{
        app.createDatabases();
        app.getAllOrders();
      }
     }).catch(function(error){
        console.error(error);
     });
  }

  private registerToEvents(offlineDetectorService: OfflineDetectorService): void {
    offlineDetectorService.connectionChanged.subscribe(online => {
       if (online) {
         this.online = true;
         console.log('went online, sending all stored items');
         this.updateDatabases();
       } else {
         this.online = false;
         console.log('went offline, storing in indexdb');
       }
     });
   }
   private createDatabases(): void {
     this.db = new Dexie('FAPBarcodes');
     const dbConstruction = this.databaseService.getDbConstruction();
     this.db.version(1).stores(dbConstruction);

     this.requests = new Dexie('MyRequests');
     this.requests.version(1).stores({
      requests: '++id, postdata',
     });
   }


   private async addToIndexedDb(data, method='add'){
    for (var key in data){
      if (!data.hasOwnProperty(key)){
          continue;
      }
      const obj = data[key];
      for (var prop in obj){
          if (!obj.hasOwnProperty(prop)) {
              continue;
          }
          if (prop == 'data' || prop == 'items'){
              if (prop == 'data'){
                  var arrayed_data = Array.from(obj[prop]);
              }
              if (prop == 'items'){
                  var arrayed_items = Array.from(obj[prop]);
              }
              const massaged_data = {
                  id: key,
                  data: arrayed_data,
                  items: arrayed_items
              };
              console.log(massaged_data);
              console.log('massaged data', Array.from(obj[prop]));

              if (method =="update"){
                  console.log('updating exisitng database');
                  let db = await new Dexie('FAPBarcodes');
                  const dbConstruction = this.databaseService.getDbConstruction();
                  db.version(1).stores(dbConstruction);
                  db.open().catch(function(error){ console.error('Failed to open db: ' + (error.stack || error)) });
                  try{
                      db['data'].put(massaged_data);
                  }catch (err){
                      console.error(err);
                  }
              }else{
                  console.log('adding to new database');
                  this.db.data.add(massaged_data).then(async () => {
                    console.log('data added to db');
                  });
              }
          }
      }
    }
   }

   getAllOrders(method= 'add'): void {
    const headers = new HttpHeaders();
    this.apiRequestService.get(this.apiRequestService.ENDPOINT_ORDERS)
      .subscribe(data => {
        const responseData = data.body;
        const success = responseData.success;
        if (success === true){
          const value =  JSON.parse(data.body.data);
          console.log('data fetched', value);
          if (method == 'add'){
            this.addToIndexedDb(value,  'add');
          }else{
            this.addToIndexedDb(value, 'update');
          }
        }else{
          console.log('failed to fetch data');
        }
      }, error => {
        console.log(error);
      });
   }

   private deleteDatabases(): void{
     this.db.delete().then(() => {
       console.log('Successfully deleted MyDataabse');
     }).catch((err) => {
       console.error('Could not delete database');
     });
     this.requests.delete().then(() => {
       console.log('Successfully deleted MyRequests');
     }).catch((err) => {
       console.error('Could not delete database');
     });
   }

   private updateDatabases(): void {
    this.getAllOrders('update');
   }
}
