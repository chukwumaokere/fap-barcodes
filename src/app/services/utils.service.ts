import { Injectable } from '@angular/core';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public  showToast(msg): void {
      const options = {
          delay: 2000,
      };
      const toast = $('.toast');
      $('.toast').toast(options);
      $('#toast-body').html(msg);
      $('.toast').toast('show');
  }
}
