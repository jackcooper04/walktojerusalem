import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private matIconRegistry: MatIconRegistry,private domSanitizer: DomSanitizer){
    this.matIconRegistry.addSvgIcon(
      "git",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/github.svg"));
  }
  title = 'walktojerusalem';

  openGithub(){
    window.open('https://github.com/jackcooper04/walktojerusalem')
  }
}
