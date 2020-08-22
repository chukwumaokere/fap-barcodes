import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { DemoComponent } from './demo/demo.component';
import { AppRoutingModule } from './app-routing.module';
import { DemotwoComponent } from './demotwo/demotwo.component';

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    DemotwoComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
