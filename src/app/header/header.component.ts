import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateDialogComponent } from '../create-dialog/create-dialog.component';
import { DistanceService } from '../distance.service';
const MAIN = environment.maintenance
const APIURL  = environment.apiUrl
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  maintenance = MAIN;
  apioffline = false;
  statusSub:Subscription;
  constructor(private matDialog:MatDialog,private http:HttpClient,public distanceService:DistanceService) { }

  openDialog(){
    this.distanceService.getStatus();
    let root = this;
    setTimeout(function(){
      if (root.maintenance || root.apioffline){
        console.log('Down')
      } else {
        const dialogRef = root.matDialog.open(CreateDialogComponent,{
          height:"310px",
          width:'300px',
          data:{
            text:'Hello World',
            buttonText:'No'
          }
        });
        dialogRef.afterClosed().subscribe(result=>{
          console.log(result)
        })
      }
    }, 500);


  }
  ngOnInit(): void {
    this.statusSub = this.distanceService.getStatusListener().subscribe(responseData => {
      this.apioffline = responseData.apiOffline;
      this.maintenance = responseData.maintenanceMode;
      // console.log(this.total);
      //console.log(this.percent);
    });
  }

}
