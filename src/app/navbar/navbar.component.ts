import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {UtilsService} from '../services/utils.service';
declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  online: boolean;
  constructor(
    private router: Router,
    public utilsService: UtilsService,
  ) { }

  ngOnInit(): void {
    this.utilsService.setMsg(navigator.onLine);

    window.addEventListener('online', () => {
      this.utilsService.setMsg(true);
    });
    window.addEventListener('offline', () => {
      this.utilsService.setMsg(false);
    });
  }

  logout(): void {
    console.log('logging out');
    try{
      localStorage.removeItem('userdata');
      this.router.navigateByUrl('/login');
    }catch (err){

    }
  }

}
