import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  online: Boolean;
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    //offline detector
    const setMsg = (flag) => {
      //const p = document.getElementById('msg')
      //p.innerHTML = '<b>Online?</b> ' + flag
        var badge = document.getElementById('status');
        if (flag === true){
           badge.innerHTML="Online"; 
            badge.classList.remove("badge-secondary");
            badge.classList.remove("badge-danger");
            badge.classList.add("badge-success");
        }else{
           badge.innerHTML="Offline"; 
            badge.classList.remove("badge-secondary");
            badge.classList.remove("badge-success");
            badge.classList.add("badge-danger");
        }
    }

    setMsg(navigator.onLine)

    window.addEventListener("online", () => {
      setMsg(true);
    })
    window.addEventListener("offline", () => {
      setMsg(false);
    })
  }

  logout(){
    console.log('logging out');
    try{
      localStorage.removeItem("userdata");
      this.router.navigateByUrl('/login');
    }catch(err){

    }
  }

}
