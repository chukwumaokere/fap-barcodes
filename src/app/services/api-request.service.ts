import { Injectable } from '@angular/core';
import {HttpHeaders, HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import { AppConfig } from '../app-config';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {

    public ENDPOINT_LOGIN = 'postLogin.php';
    public ENDPOINT_ORDERS = 'getAllOrders.php';
    public ENDPOINT_CREATE_ASSET = 'createAssets.php';
    public ENDPOINT_AUTO_LOGIN = 'autoLogin.php';
    public ENDPOINT_POS_VALIDATE = 'posValidateCode.php';
    public ENDPOINT_POS_VENDOR = 'posVendorList.php';
    public ENDPOINT_POS_CREATE_SO = 'posCreateSO.php';

    constructor(
        private httpClient: HttpClient,
        public appConfig: AppConfig,
    ) {
    }

    public post(endPoint: string, params: any): Observable<HttpResponse<any>>{
        const url = this.appConfig.apiurl + endPoint;
        const headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        return this.httpClient.post(url, params, {headers, observe: 'response'});
    }

    public get(endPoint: string, params: any = {}): Observable<HttpResponse<any>> {
        const url = this.appConfig.apiurl + endPoint;
        const headers = new HttpHeaders();
        headers.append('Accept', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        const httpParam = new HttpParams();
        if (params){
            for (const key of Object.keys(params)) {
                const value = params[key];
                httpParam.append(key, value);
            }
        }
        return this.httpClient.get(url, {headers, observe: 'response', params: httpParam});
    }
}
