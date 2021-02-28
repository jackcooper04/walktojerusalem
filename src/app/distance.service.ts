import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
const BACKEND_URL = environment.apiUrl;
const token = environment.authToken;
@Injectable({
  providedIn: 'root'
})
export class DistanceService {
  private distanceInfo: any[];
  private checkPointInfo: any[];
  private current;
  private next;
  private apiOffline;
  private selfWalk;
  private maintenanceMode;
  private at;
  private total;
  private todayDist;
  private percent;
  private distamceUpdated = new Subject<{ total: number, percent: number }>();
  private todayDistUpdated = new Subject<{todayDist:Number,selfWalk:Number}>();
  private checkpointUpdated = new Subject<{ current: any[], next: any[], at: any[] }>();
  private statusUpdated = new Subject<{ apiOffline: boolean, maintenanceMode: boolean }>();
  constructor(public http: HttpClient,private cookie:CookieService) { }


  getDistanceListener() {
    return this.distamceUpdated.asObservable();
  };
  getTodayDistanceListener(){
    return this.todayDistUpdated.asObservable();
  }
  getCheckpointListener() {
    return this.checkpointUpdated.asObservable();
  };
  getStatusListener() {
    return this.statusUpdated.asObservable();
  };

  getCheckpoint() {
    this.http.get<{ next: any[], current: any[], at: any[] }>(BACKEND_URL + "walk/checkpoint/"+token)
      .subscribe(responseData => {
        this.current = responseData.current;
        this.next = responseData.next;
        this.at = responseData.at
        this.checkpointUpdated.next({ current: this.current, next: this.next, at: this.at });
      })
  }
  getDistanceToday() {
    let nameArray = this.cookie.get('name').split(" ");
    let modifiedString = nameArray[0] + nameArray[1][0];


    this.http.get<{ total:Number,self:Number }>(BACKEND_URL + "walk/getwalkedtoday/DUD/"+token)
      .subscribe(responseData => {
        this.todayDist = responseData.total;
        this.selfWalk = responseData.self;
        this.todayDistUpdated.next({ todayDist:this.todayDist,selfWalk:this.selfWalk });
      });
  };
  getStatus() {
    this.http.get<{ maintenance: boolean }>(BACKEND_URL + "walk")
      .subscribe(
        (responseData) => {
          console.log(responseData.maintenance)
          this.apiOffline = false;
          if (responseData.maintenance) {
            this.maintenanceMode = true;
            let root = this;
           let test = setInterval(function () {
             if (!root.maintenanceMode){
               clearInterval(test);
               root.getStatus();
             }
              root.getStatus()
            }, 30000);
          } else {

            this.maintenanceMode = false;
          }

          this.statusUpdated.next({ maintenanceMode: this.maintenanceMode, apiOffline: this.apiOffline });
          // alert(responseData.online)
        },
        (error) => {
          this.maintenanceMode = false;
          this.apiOffline = true;

          this.statusUpdated.next({ maintenanceMode: this.maintenanceMode, apiOffline: this.apiOffline });
          let root = this;
      let test2 = setInterval(function () {
           if (root.apiOffline == false){
             clearInterval(test2);
             root.getStatus();
           }
            root.getStatus()
          }, 30000);
          //alert("Error")
        }
      )
  }
  getDistance() {
    this.http.get<{ total: number, percent: number }>(BACKEND_URL + "walk/gettotaldistance/"+token)
      .subscribe(responseData => {
        this.total = responseData.total;
        this.percent = responseData.percent;
        this.distamceUpdated.next({ total: this.total, percent: this.percent })
      })
  }
}


