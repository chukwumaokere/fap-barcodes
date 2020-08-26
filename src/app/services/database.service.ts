import {Injectable} from '@angular/core';
import {AppConfig} from '../app-config';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  protected db: {
    data: {}
  };

  constructor(
    public AppConfig: AppConfig
  ) {
  }

  public async getDb(): Promise<any> {
    const databaseName = this.AppConfig.databaseName;
    const db = await new Dexie(databaseName);
    db.version(1).stores({data: 'id,data'});
    db.open().catch((error) => {
      console.error('Failed to open db: ' + (error.stack || error));
    });
    return db;
  }
}
