import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { DemoComponent } from './demo/demo.component';
import { AppRoutingModule } from './app-routing.module';
import { DemotwoComponent } from './demotwo/demotwo.component';
import { LoginComponent } from './login/login.component';
import { OrdersComponent } from './orders/orders.component';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from './app-config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    DemotwoComponent,
    LoginComponent,
    OrdersComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [AppConfig],
  bootstrap: [AppComponent]
})
export class AppModule { }
