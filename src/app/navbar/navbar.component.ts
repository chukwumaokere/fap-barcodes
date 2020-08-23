import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  logout(){
    console.log('logging out');
    this.router.navigateByUrl('/login'); //this would cause an infinite loop on this page. but it should be used on other pages to force others to log in.
  }

}
