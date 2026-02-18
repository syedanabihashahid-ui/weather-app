import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app.routes';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { App } from './app';
@NgModule({
  declarations: [],
  exports: [App],
  imports: [
    CommonModule,
    App,
    AppRoutingModule,
    ],
  providers: [ 
  ]
})
export class AppModule { }



