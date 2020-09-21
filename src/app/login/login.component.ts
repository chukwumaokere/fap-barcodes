import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import {ApiRequestService} from '../services/api-request.service';
import {UtilsService} from '../services/utils.service';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit {
  loginForm;
  loggedin: boolean;
  userid: number;
  userdata: any;
  apiurl: any;
  vturl: any;
  loading: any;
  dataReturned: any;

  constructor(
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private httpClient: HttpClient,
      private formBuilder: FormBuilder,
      public appConfig: AppConfig,
      public apiRequestService: ApiRequestService,
      public utilsService: UtilsService,
  ) {
      this.apiurl = this.appConfig.apiurl;
      this.vturl = this.appConfig.vturl;
      this.loginForm = this.formBuilder.group({
        username: '',
        password: '',
      });
     }

  ngOnInit(): void {
    if (localStorage.getItem('userdata') !== '' && localStorage.getItem('userdata') !== null ){
      this.router.navigateByUrl('/orders');
    }else{
        var username = this.activatedRoute.snapshot.paramMap.get('username');
        var password = this.activatedRoute.snapshot.paramMap.get('password');
        if(username && password){
            this.autoLogin({username: username , password: password});
        }
    }
  }

  logout(): void {
    console.log('logging out');
    try{
      localStorage.removeItem('userdata');
    }catch (err){

    }
  }

  login(value): void {
    const data = {
      username: value.username,
      password: value.password
    };

    this.apiRequestService.post(this.apiRequestService.ENDPOINT_LOGIN, data)
      .subscribe(response => {
        const responseData = response.body;
        const success = responseData.success;
        console.log(response);
        if (success === true){
          // ... do something with that data.
          localStorage.setItem('userdata', JSON.stringify(responseData.data));
          this.router.navigateByUrl('/orders');
        }else{
          console.log('failed to fetch data');
        }
      }, error => {
        console.log(error);
        if (error.status === 401){
          this.utilsService.showToast('Invalid Username/Password combo.');
        }
        else if (error.status === 504 || !error.status){
            this.utilsService.showToast('You must be online to authenticate your login');
        }else{
            this.utilsService.showToast('An unexpected error occurred during login');
        }
      });
     // console.log('data is' , data);
  }
    autoLogin(value): void {

        const data = {
            username: Base64.decode(value.username),
            password: Base64.decode(value.password)
        };
        //console.log(data); return;
        this.apiRequestService.post(this.apiRequestService.ENDPOINT_AUTO_LOGIN, data)
            .subscribe(response => {
                const responseData = response.body;
                const success = responseData.success;
                console.log(response);
                if (success === true){
                    // ... do something with that data.
                    localStorage.setItem('userdata', JSON.stringify(responseData.data));
                    this.router.navigateByUrl('/orders');
                }else{
                    console.log('failed to fetch data');
                }
            }, error => {
                console.log(error);
                if (error.status === 401){
                    this.utilsService.showToast('Invalid Username/Password combo.');
                }
                else if (error.status === 504 || !error.status){
                    this.utilsService.showToast('You must be online to authenticate your login');
                }else{
                    this.utilsService.showToast('An unexpected error occurred during login');
                }
            });
        // console.log('data is' , data);
    }

}

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }
        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c, c1, c2, c3;
        c = c1 = c2 = c3 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}
