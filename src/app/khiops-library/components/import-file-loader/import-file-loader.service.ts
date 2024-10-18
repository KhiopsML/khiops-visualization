import { Injectable } from '@angular/core';
import { FileModel } from '../../model/file.model';
import { ConfigService } from '@khiops-library/providers/config.service';

@Injectable({
  providedIn: 'root',
})
export class ImportFileLoaderService {
  constructor(private configService: ConfigService) {}
  readImportFile(file: File): any {
    if (this.configService.isElectron) {
      // Method called automatically at startup
      // For security reasons, local files can not be loaded automatically without Electron
      return new Promise((resolve, reject) => {
        this.configService?.getConfig()?.readLocalFile?.(file, (datas) => {
          resolve(new FileModel(datas, file.name, file));
        });
      });
    } else {
      // Method called when user open an external file manually
      return new Promise((resolve, reject) => {
        console.log(file);
        let reader = new FileReader();
        reader.addEventListener('loadend', async (e) => {
          // @ts-ignore
          const datas = e.target.result.toString();
          // @ts-ignore
          resolve(new FileModel(datas, file.path, file));
        });
        reader.addEventListener('error', () => {
          reader.abort();
          reject(new Error('failed to process file'));
        });
        reader.readAsText(file);
      });
    }
  }
}
