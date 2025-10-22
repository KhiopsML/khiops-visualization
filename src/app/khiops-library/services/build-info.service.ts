import { Injectable } from '@angular/core';

// Log commit ID immediately when the service file is loaded
(() => {
  if (typeof window !== 'undefined' && (window as any).KHIOPS_BUILD_INFO) {
    const commitId = (window as any).KHIOPS_BUILD_INFO.commit?.hash;
    if (commitId) {
      console.log('Build commit ID:', commitId);
    } else {
      console.warn('No commit ID available');
    }
  } else {
    console.warn('No commit ID available');
  }
})();

@Injectable({
  providedIn: 'root',
})
export class BuildInfoService {
  constructor() {
    // Service ready but commit ID already logged above
  }
}
