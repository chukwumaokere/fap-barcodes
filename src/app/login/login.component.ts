import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit {
  loginForm;
  loggedin: Boolean;
  userid: Number;
  userdata: any;
  apiurl: any;
  vturl: any;
  loading: any;
  dataReturned: any;
  //username: any;
  //password: any;
  

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
    public AppConfig: AppConfig) {
      this.apiurl = this.AppConfig.apiurl;
      this.vturl = this.AppConfig.vturl;
      this.loginForm = this.formBuilder.group({
        username: '',
        password: '',
      })
     }

  ngOnInit(): void {
    if(this.loggedin == true){
      this.router.navigateByUrl('/orders');
    }
  }

  logout(){
    console.log('logging out');
    //this.router.navigateByUrl('/login'); //this would cause an infinite loop on this page. but it should be used on other pages to force others to log in.
  }

  login(value){
    const data = { 
      username: value.username,
      password: value.password
    }
    //console.log(value);
    
    /*
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');
    
    
    this.httpClient.post(this.apiurl + 'login.php', data, {headers, observe: 'response'})
      .subscribe(data =>{
        const responseData = data.body;
        const success = responseData['success'];
        console.log(data);
        if(success == true){
          //... do something with that data.
        }else{
          console.log('failed to fetch data');
        }
      }, error =>{
        console.log(error);
      })
      
     console.log('data is' , data);
     */
    this.router.navigateByUrl('/orders');
  }

}
