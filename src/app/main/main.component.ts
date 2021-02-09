import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CreateDialogComponent } from '../create-dialog/create-dialog.component';
import { DistanceService } from '../distance.service';
const BACKENDURL = environment.apiUrl;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  breakpoint;
  disableButton = false;
  total;
  percent;
  categories = [];
  at;
  realDistance;
  checkpoints = [

  ]
  current;
  knomiUnlock = false;
  showCat = true;
  showImage = true;
  next;
  distanceSub: Subscription;
  dataCheck;
  checkpointSub: Subscription;
  form;
  submitDisabled = true;
  buttonText = "Sign In With Google (tcstadmin)"
  user$: Observable<any>;
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private cookie: CookieService, public _formBuilder: FormBuilder, public http: HttpClient, private matDialog: MatDialog, private distanceService: DistanceService) {
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

  ngOnInit(): void {
    function konami(callback) {
      let kkeys = [];
      // up,up,down,down,left,right,left,right,B,A
      const konami = '38,38,40,40,37,39,37,39,66,65';
      return event => {
          kkeys.push(event.keyCode);
          if (kkeys.toString().indexOf(konami) >= 0) {
              callback();
              kkeys = [];
          }
      };
  }
  const handler = konami(() => {
    for (let checkIdx in this.checkpoints) {
      this.checkpoints[checkIdx].disabled = false;


    }
      console.log('konami 1');
  });
  window.addEventListener('keydown', handler);
    console.log('WARNING: DO NOT PASTE ANYTHING HERE UNLESS YOU UNDERSTAND IT COMPLETELY!');
    this.http.get<{ checkpoints: any[] }>(BACKENDURL + "wtj/allcheckpoints/4w5q7wedbh236")
      .subscribe((responseData) => {
        //console.log(responseData.checkpoints)
         this.checkpoints = responseData.checkpoints;

      })
    this.distanceSub = this.distanceService.getDistanceListener().subscribe(responseData => {
      this.total = responseData.total;
      this.percent = responseData.percent;
      // console.log(this.total);
      //console.log(this.percent);
    });
    this.checkpointSub = this.distanceService.getCheckpointListener().subscribe(responseData => {
      this.current = responseData.current;
      this.next = responseData.next;
      this.at = responseData.at;
      let test = this.checkpoints.length;
      for (let checkIdx in this.checkpoints) {
        if (checkIdx > this.at) {
          if (this.checkpoints[checkIdx].name != 'Map'){
            this.checkpoints[checkIdx].disabled = true;
          }

        }
        if (checkIdx == this.at){
          this.checkpoints.splice(Number(checkIdx) + 1,0,{"name":"Map","disabled":false})
        }

      }
    //  console.log(this.checkpoints)
      this.realDistance = this.next.distance - this.current.takeoff
      //console.log(this.current);
     // console.log(this.next);
      this.getCheckpoint(this.checkpoints[this.at].name)
    })
    this.distanceService.getCheckpoint();
    this.distanceService.getDistance();
    this.form = this._formBuilder.group({
      distance: ['', Validators.required],

    });
    let name = this.cookie.get('name');
    if (name != "") {
      this.disableButton = true;
      this.buttonText = name;
    } else {
      //console.log('hello')
    }
   // console.log(this.mobileCheck())
    //console.log(this.tabletCheck())
    // console.log(this.cookie.get('name') == "")
    if (!this.mobileCheck() && !this.tabletCheck()) {
      this.breakpoint = 3
    } else {
      this.breakpoint = 1
    }
    //this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
  }
  onResize(event) {
    //this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 6;
  }
  changeCheck(event) {
   // console.log('acti')
    this.getCheckpoint(this.checkpoints[event.index].name)
  }
  getCheckpoint(name) {
    var storeNeeded = false;
    var indexStore = null;
    for (let checkIdx in this.checkpoints){
      if (this.checkpoints[checkIdx].name == name){

        if (this.checkpoints[checkIdx].cache.filled != false){
        //  console.log('cached');
          this.dataCheck = this.checkpoints[checkIdx].cache.main;
          this.categories = this.checkpoints[checkIdx].cache.cat;
          if (this.categories.length == 1){
            this.showCat = false;
          } else {
            this.showCat = true;
          };
      //    console.log('Retrived From Cache')
          return;
        } else {
        //  console.log('found but not cached caching now')
          indexStore = checkIdx;
          storeNeeded = true;
        }
      }
    }
    this.http.get<{ data: any[] }>(BACKENDURL + "wtj/getcheckpoint/" + name + "/4w5q7wedbh236")
      .subscribe((responseData) => {
        //console.log('requesting')
        this.dataCheck = responseData.data;
        this.categories = new Array();
       // console.log(this.dataCheck)
        for (let checkIdx in this.dataCheck.info){
          //console.log(this.dataCheck.info[checkIdx])
          var obj = {
            type:this.dataCheck.info[checkIdx].type,
            name:this.dataCheck.info[checkIdx].name,
            actutal:this.dataCheck.info[checkIdx].name
          }
          if (this.dataCheck.info[checkIdx].type == "facts"){
            obj.name = "Fun Facts",
            obj.actutal = "facts"
          } else if (this.dataCheck.info[checkIdx].type == "landmarks"){
            obj.name = "Landmarks"
            obj.actutal = "landmark"
          } else if (this.dataCheck.info[checkIdx].type == "recipe"){
            obj.name = "Recipe: "+ obj.name
          } else if (this.dataCheck.info[checkIdx].type == "clothes"){
            obj.name = "Traditional Clothing"
            obj.actutal = "clothes"
          }
          this.categories.push(obj)

        };
        if (storeNeeded){
          var object = {
            main:this.dataCheck,
            cat:this.categories,
            filled:true
          };
          this.checkpoints[indexStore].cache = object;
         // console.log(this.checkpoints[indexStore])
        }
        if (this.categories.length == 1){
          console.log('match')
          this.showCat = false;
        } else {
          this.showCat = true;
        };
      //  console.log(this.categories)
      });
  };
  mobileCheck() {
    let check = false;

    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor);
    if (check) {
      this.showImage = false
    }
    return check;
  };

  printDiv(divName) {

    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
    window.location.reload();

  }
  scrollTo(id) {
    let el = document.getElementById(id);
    el.scrollIntoView();
  }
  submit() {
    let body = {
      distance: this.form.value.distance,
      init: this.cookie.get('init')
    };
    this.http.post<{ message: string }>(BACKENDURL + "wtj/submitwalk/4w5q7wedbh236", body)
      .subscribe((responseData) => {
     //   console.log(responseData.message);
        this.form.reset();
        this.submitDisabled = true;
      })
  }
  tabletCheck() {
    let check = false;
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    check = isTablet;
    return check;
  }
  changed(event) {
    if (this.form.value.distance != undefined && this.disableButton) {
      this.submitDisabled = false;
  //    console.log('valid')
    } else {
    //  console.log('invalid')
      this.submitDisabled = true
    }

  }
  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    // console.log(data)
    return userRef.set(data, { merge: true });

  }
  async google() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    const credential = await this.afAuth.signInWithPopup(provider);
    // const credential = await this.afAuth.firebase.auth.signInWithPopup(provider);
    let userEmail = credential.user.email;
    if (userEmail.includes("tcstadmin")) {

      let name = credential.user.displayName;
      let splitName = name.split(" ");
      let initals = ""
      for (let nameIdx in splitName) {
        let letter = splitName[nameIdx][0];
        initals += letter
      }
      this.cookie.set('init', initals, { expires: 999 })
      this.cookie.set('name', credential.user.displayName, { expires: 999 })
    //  console.log(initals)

      this.disableButton = true;
      this.buttonText = credential.user.displayName;

    //  console.log('OK')
      return this.updateUserData(credential.user);
    } else if (userEmail.includes("gmail")) {
      this.logout()

    }

  }
  logout() {
    this.afAuth.signOut()
  }
}
