import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl, bulkApiUrl } from '../../core/config/api.config';
import { Observable } from 'rxjs';

export type AdminDataType = 'Student' | 'Teacher' | 'Section';

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly http = inject(HttpClient);

  importFile(file: File, dataType: AdminDataType): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(bulkApiUrl('/import-csv/' + dataType), formData);
  }

  exportRecords(dataType: AdminDataType): Observable<Blob> {
    if (dataType === 'Teacher') {
      return this.http.get(bulkApiUrl('/export/teacher'), {
        responseType: 'blob'
      });
    }
    else if (dataType === 'Student') {
      return this.http.get(bulkApiUrl('/export/student/class/0/section/0'), {
        responseType: 'blob'
      });
    }
    else {
      return this.http.get(bulkApiUrl('/export/section'), {
        responseType: 'blob'
      });
    }
  }
    exportSample(dataType: AdminDataType): Observable<Blob> {
    return this.http.get(bulkApiUrl('/template/' + dataType), {
      responseType: 'blob'
    });
  }
}
