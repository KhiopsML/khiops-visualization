import { Injectable } from '@angular/core';
import { FileVO } from '../../model/file-vo';

@Injectable({
  providedIn: 'root',
})
export class ImportFileLoaderService {
  readFile(file: File): any {
    return new Promise((resolve, reject) => {
      console.log(file);
      let reader = new FileReader();

      reader.addEventListener('loadend', async (e) => {
        // @ts-ignore
        const datas = e.target.result.toString();
        // @ts-ignore
        resolve(new FileVO(datas, file.path, file));
      });
      reader.addEventListener('error', () => {
        reader.abort();
        reject(new Error('failed to process file'));
      });
      reader.readAsText(file);
    });
  }
}
