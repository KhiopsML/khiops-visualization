import { Injectable } from '@angular/core';
import { LS } from '@khiops-library/enum/ls';

@Injectable({
  providedIn: 'root',
})
export class Ls {
  LS_ID: string;

  setLsId(id: string) {
    this.LS_ID = id;
  }

  get(key: string, defaultValue?) {
    return (
      localStorage.getItem(this.LS_ID + LS[key]) || defaultValue || undefined
    );
  }

  set(key: string, value: any) {
    localStorage.setItem(this.LS_ID + LS[key], value);
  }

  del(key: string) {
    localStorage.removeItem(this.LS_ID + LS[key]);
  }
}
