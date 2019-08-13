import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { routeModule } from './route.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    routeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
