import {Injectable} from '@angular/core';
import {AppConfig} from '../app-config';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
    protected db: {
        data: {},
        asset_queue: {}
    };

    constructor(
        public appConfig: AppConfig
    ) {
    }

    public async getDb(): Promise<any> {
        const databaseName = this.appConfig.databaseName;
        const db = await new Dexie(databaseName);
        const dbConstruct = this.getDbConstruction();
        db.version(1).stores(dbConstruct);
        db.open().catch((error) => {
            console.error('Failed to open db: ' + (error.stack || error));
        });
        return db;
    }

    public getDbConstruction(): any {
        return {
            data: 'id, data, items',
            asset_queue: '++id, data',
        };
    }
}
