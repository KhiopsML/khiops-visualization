import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NoteVO } from './note-vo';
import _ from 'lodash';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';

@Injectable({
  providedIn: 'root',
})
export class ReleaseNotesService {
  constructor(
    private http: HttpClient,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {}

  loadGithubReleaseNotes(): Promise<NoteVO[]> {
    return new Promise((resolve, reject) => {
      let url: string = '';
      if (
        this.khiopsLibraryService.getAppConfig().common.GLOBAL
          .DEBUG_SOFTWARE_LABEL === 'KV'
      ) {
        url = 'https://api.github.com/repos/KhiopsML/kv-electron/releases';
      } else {
        url = 'https://api.github.com/repos/KhiopsML/kc-electron/releases';
      }

      this.http
        .get(url, {
          responseType: 'json',
          // Comment headers for local dev testing
          // CORS policy: Request header field timeout is not allowed by Access-Control-Allow-Headers in preflight response.
          headers: new HttpHeaders({
            timeout: `${60000}`,
          }),
        })
        .subscribe(
          (datas: any) => {
            if (datas) {
              const notes: NoteVO[] = [];
              for (let i = 0; i < datas.length; i++) {
                const noteVO = new NoteVO(datas[i]);
                notes.push(noteVO);
              }
              resolve(notes);
            } else {
              reject({
                status: 500,
              });
            }
          },
          (error) => {
            reject({
              status: 500,
            });
          },
        );
    });
  }
}
