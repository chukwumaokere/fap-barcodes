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
        let type = '';
        let orders;
        let items;
        let value;
        let id;
        let itemKey = '';
        let orderDetail = {};
        let details;
        const db = await this.databaseService.getDb();
        await db.data.each((rows) => {
            id = rows.id;
            orders = rows.data;
            items = rows.items;
            details = rows.detail;
            for (const key in orders) {
                if (orders.hasOwnProperty(key)) {
                    value = orders[key];
                    if (value[3] === orderId) {
                        type = id;
                        order = value;
                        item = items[key];
                        itemKey = key;
                        orderDetail = details[key];
                        break;
                    }
                }
            }
        });
        const data: {'type': any, 'order': any, 'items': any, 'item_key': any, 'order_detail': any } = {type: '', order: [], items: [], item_key: '', order_detail: []};
        data.type = type;
        data.order = order;
        data.items = item;
        data.item_key = itemKey;
        data.order_detail = orderDetail;
        return data;
    }
}
