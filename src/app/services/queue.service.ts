import {Injectable} from '@angular/core';
import {ApiRequestService} from './api-request.service';
import {DatabaseService} from './database.service';

@Injectable({
    providedIn: 'root'
})
export class QueueService {

    constructor(
        public apiRequestService: ApiRequestService,
        public databaseService: DatabaseService
    ) {
    }

    public async pushAssets(): Promise<any> {
        const db = await this.databaseService.getDb();
        const data = Array();
        await db.asset_queue.each((row) => {
            data.push(row);
        });
        data.forEach((item) => {
            const params = {data: JSON.stringify(item.data)};
            this.apiRequestService.post(this.apiRequestService.ENDPOINT_CREATE_ASSET, params).subscribe(response => {
                if (response.body.success === true) {
                    db.asset_queue.where('id').equals(item.id).delete();
                }
            });
        });
    }
}
