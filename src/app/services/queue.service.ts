import { Injectable } from '@angular/core';
import {ApiRequestService} from './api-request.service';
import {DatabaseService} from './database.service';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

    constructor(
        public apiRequestService: ApiRequestService,
        public databaseService: DatabaseService
    ) { }

    public async pushAssets(): Promise<any> {
        const db = await this.databaseService.getDb();
        const data = Array();
        const queueId = Array();
        await db.asset_queue.each((row) => {
            data.push(row.data);
            queueId.push(row.id);
        });
        queueId.forEach((id) => {
            db.asset_queue.where('id').equals(id).delete();
        });
        data.forEach((item) => {
            const params = {data: JSON.stringify(item)};
            this.apiRequestService.post(this.apiRequestService.ENDPOINT_CREATE_ASSET, params).subscribe();
        });
    }
}
