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

    public getCookie(name: string): any {
        const ca: Array<string> = document.cookie.split(';');
        const caLen: number = ca.length;
        const cookieName = `${name}=`;
        let c: string;

        for (let i = 0; i < caLen; i += 1) {
            c = ca[i].replace(/^\s+/g, '');
            if (c.indexOf(cookieName) === 0) {
                return c.substring(cookieName.length, c.length);
            }
        }
        return '';
    }

    public deleteCookie(name): void {
        this.setCookie(name, '', -1);
    }

    public setCookie(name: string, value: string, expireDays: number, path: string = ''): void {
        const d: Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        const expires = `expires=${d.toUTCString()}`;
        const cpath: string = path ? `; path=${path}` : '';
        document.cookie = `${name}=${value}; ${expires}${cpath}`;
    }
}
