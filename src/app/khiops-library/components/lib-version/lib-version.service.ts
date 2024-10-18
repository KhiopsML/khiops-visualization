import { Injectable } from '@angular/core';
import pjson from 'package.json';

@Injectable({
  providedIn: 'root',
})
export class LibVersionService {

  static getVersion() {
    return pjson?.version || undefined;
  }
}
