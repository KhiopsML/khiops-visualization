import { ConfigModel } from './../model/config.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

	config: ConfigModel = new ConfigModel();

}
