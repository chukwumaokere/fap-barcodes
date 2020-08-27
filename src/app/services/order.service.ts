import {Injectable} from '@angular/core';
import {DatabaseService} from './database.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    public databaseService: DatabaseService
  ) {
  }

  public async getOrderById(orderId): Promise<any> {
      let order = {};
      let item = {};
      let orders;
      let items;
      let value;
      const db = await this.databaseService.getDb();
      await db.data.each((rows) => {
          orders = rows.data;
          items = rows.items;
          for (const key in orders) {
              if (orders.hasOwnProperty(key)) {
                  value = orders[key];
                  if (value[3] === orderId) {
                    order = value;
                    item = items[key];
                    break;
                  }
              }
          }
      });
      const data: {'order': any, 'items': any} = {order: [], items: []};
      data.order = order;
      data.items = item;
      return data;
  }
  
}
