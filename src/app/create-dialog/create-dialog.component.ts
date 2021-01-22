import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import firebase from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { DistanceService } from '../distance.service';
const BACKENDURL = environment.apiUrl;
@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.css']
})
export class CreateDialogComponent implements OnInit {
  message:string = "";
  cancelButtonText = " Cancel";
  breakpoint;
  disableButton = false;
  form;
  submitDisabled = true;
  buttonText = "Sign In With Google (tcstadmin)"
  user$: Observable<any>;
  constructor(private afAuth: AngularFireAuth, private afs:AngularFirestore,private cookie:CookieService,public _formBuilder: FormBuilder,public http:HttpClient,public distanceService:DistanceService,
    @Inject (MAT_DIALOG_DATA) public data:any,public dialogref:MatDialogRef<CreateDialogComponent>
  ) {
    if (data){
      this.message = data.message || this.message;
      if(data.buttonText){
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
    }
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }
  onConfirmClick(): void {
    this.dialogref.close(true);
  }
  ngOnInit(): void {
    this.form = this._formBuilder.group({
      distance: ['', Validators.required],

    });
    let name = this.cookie.get('name');
    if (name != ""){
      this.disableButton = true;
      this.buttonText = name;
    } else {
      //console.log('hello')
    }
  }
  submit(){
    let body = {
      distance:this.form.value.distance,
      init:this.cookie.get('init')
    };
    this.http.post<{message:string}>(BACKENDURL+"other/submitwalk/4w5q7wedbh236",body)
    .subscribe((responseData)=>{
      console.log(responseData.message);
      this.form.reset();
      this.submitDisabled = true;
      this.distanceService.getDistance();
      this.dialogref.close(true);
    })
  }
  changed(event){
    if (this.form.value.distance != undefined && this.disableButton){
      this.submitDisabled = false;
      console.log('valid')
    } else {
      console.log('invalid')
      this.submitDisabled = true
    }

  }
  async google(){
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt:'select_account'
    })
    const credential = await this.afAuth.signInWithPopup(provider);
   // const credential = await this.afAuth.firebase.auth.signInWithPopup(provider);
   let userEmail = credential.user.email;
   if (userEmail.includes("tcstadmin")){

    let name = credential.user.displayName;
    let splitName = name.split(" ");
    let initals = ""
    for (let nameIdx in splitName){
      let letter = splitName[nameIdx][0];
      initals += letter
    }
    this.cookie.set('init',initals,{expires:999})
    this.cookie.set('name',credential.user.displayName,{expires:999})
    console.log(initals)

    this.disableButton = true;
    this.buttonText = credential.user.displayName;

     console.log('OK')
     return this.updateUserData(credential.user);
   } else if (userEmail.includes("gmail")){
     this.logout()

   }

  }
  logout(){
    this.afAuth.signOut()
  }
  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument= this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
   // console.log(data)
    return userRef.set(data, { merge: true });

  }
}
