import {Component, OnInit} from '@angular/core';
import {QueueService} from './services/queue.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Barcodes';

    constructor(
        public queueService: QueueService
    ) {
    }

    ngOnInit(): void {
        window.addEventListener('online', () => {
            this.queueService.pushAssets();
        });

        // if sync event is called, we should sync
        window.addEventListener('sync', () => {
            this.queueService.pushAssets();
        });
    }
}
