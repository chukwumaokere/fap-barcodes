import { Injectable } from '@angular/core';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public  showToast(msg): void {
      const options = {
          delay: 2500,
      };
      const toast = $('.toast');
      $('.toast').toast(options);
      $('#toast-body').html(msg);
      $('.toast').toast('show');
  }

  public setMsg(flag): void {
      const badge = document.getElementById('status');
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
}
