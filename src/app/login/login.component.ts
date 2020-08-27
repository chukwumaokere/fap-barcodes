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

}
