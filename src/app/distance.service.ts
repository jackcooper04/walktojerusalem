import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
const BACKEND_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class DistanceService {
  private distanceInfo: any[];
  private total;
  private percent;
  private distamceUpdated = new Subject<{total:number,percent:number}>();
  constructor(public http:HttpClient) { }


  getDistanceListener(){
    return this.distamceUpdated.asObservable();
  };
  getDistance(){
    this.http.get<{total:number,percent:number}>(BACKEND_URL+"other/gettotaldistance/4w5q7wedbh236")
    .subscribe(responseData=>{
      this.total = responseData.total;
      this.percent = responseData.percent;
      this.distamceUpdated.next({total:this.total,percent:this.percent})
    })
  }
}


