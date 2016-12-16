import { Injectable } from '@angular/core';
import { Http, Headers, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/toPromise';

declare var saveAs: any;

@Injectable()
export class MainService {

  private serverUrl = 'http://localhost:3000/youtube/process_get';
  private headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: Http) { }

  makeRequest(theLink: String): void {
    const url = `${this.serverUrl}/?link=${theLink}`;

    this.http.get(url, { responseType: ResponseContentType.ArrayBuffer })
      .toPromise()
      .then(response => {
        let file = new Blob([response.blob()], {
          type: 'audio/mpeg'
        });
        let title = JSON.parse(response.headers.get('content-disposition').split(';')[1].split('=')[1]);
        saveAs(file, title);
      });
  }

}
