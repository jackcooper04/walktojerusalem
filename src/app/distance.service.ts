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
  private checkPointInfo:any[];
  private current;
  private next;
  private at;
  private total;
  private percent;
  private distamceUpdated = new Subject<{total:number,percent:number}>();
  private checkpointUpdated = new Subject<{current:any[],next:any[],at:any[]}>()
  constructor(public http:HttpClient) { }


  getDistanceListener(){
    return this.distamceUpdated.asObservable();
  };
  getCheckpointListener(){
    return this.checkpointUpdated.asObservable();
  }

  getCheckpoint(){
    this.http.get<{next:any[],current:any[],at:any[]}>(BACKEND_URL+"other/checkpoint/4w5q7wedbh236")
    .subscribe(responseData=>{
      this.current = responseData.current;
      this.next = responseData.next;
      this.at = responseData.at
      this.checkpointUpdated.next({current:this.current,next:this.next,at:this.at});
    })
  }
  getDistance(){
    this.http.get<{total:number,percent:number}>(BACKEND_URL+"other/gettotaldistance/4w5q7wedbh236")
    .subscribe(responseData=>{
      this.total = responseData.total;
      this.percent = responseData.percent;
      this.distamceUpdated.next({total:this.total,percent:this.percent})
    })
  }
}


