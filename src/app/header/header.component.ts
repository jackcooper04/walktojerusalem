import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { CreateDialogComponent } from '../create-dialog/create-dialog.component';
const MAIN = environment.maintenance
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  maintenance = MAIN;
  constructor(private matDialog:MatDialog) { }
  openDialog(){
    const dialogRef = this.matDialog.open(CreateDialogComponent,{
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
  ngOnInit(): void {
  }

}
