import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {

  constructor() { }

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

}
