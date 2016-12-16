import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing/app-routing.module';

import { AppComponent } from './app.component';
import { CatComponent } from './cat/cat.component';
import { MainComponent } from './main/main.component';
import { MainService } from './main.service';
import { VideoComponent } from './video/video.component';

@NgModule({
  declarations: [
    AppComponent,
    CatComponent,
    MainComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [MainService],
  bootstrap: [AppComponent]
})
export class AppModule { }
