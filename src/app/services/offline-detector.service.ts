import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class OfflineDetectorService {
  private internalConnectionChanged = new Subject<boolean>();

  get connectionChanged(){
    return this.internalConnectionChanged.asObservable();
  }

  get isOnline(){
    return !!window.navigator.onLine;
  }

  constructor() {
    window.addEventListener('online', () => { console.log('services online'); this.updateOnlineStatus() });
    window.addEventListener('offline', () => { console.log('services offline'); this.updateOnlineStatus() });
   }

   private updateOnlineStatus(){
     this.internalConnectionChanged.next(window.navigator.onLine);
   }
}
