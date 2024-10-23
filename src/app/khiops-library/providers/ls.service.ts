import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Ls {
  public LS_ID: string;

  setLsId(id: string) {
    this.LS_ID = id;
  }

  get(key: string, defaultValue?) {
    return localStorage.getItem(this.LS_ID + key) || defaultValue || undefined;
  }

  set(key: string, value: any) {
    localStorage.setItem(this.LS_ID + key, value);
  }

  del(key: string) {
    localStorage.removeItem(this.LS_ID + key);
  }
}
