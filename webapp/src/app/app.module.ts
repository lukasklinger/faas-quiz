import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponentComponent } from './game-component/game-component.component';
import { NavbarComponent } from './navbar/navbar.component';
import { QuestionComponentComponent } from './question-component/question-component.component';
import { WelcomeComponentComponent } from './welcome-component/welcome-component.component';
import { WaitingComponentComponent } from './waiting-component/waiting-component.component';
import { LoadingComponentComponent } from './loading-component/loading-component.component';
import { ResultsComponentComponent } from './results-component/results-component.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponentComponent,
    NavbarComponent,
    QuestionComponentComponent,
    WelcomeComponentComponent,
    WaitingComponentComponent,
    LoadingComponentComponent,
    ResultsComponentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    WelcomeComponentComponent,
    WaitingComponentComponent,
    LoadingComponentComponent,
    QuestionComponentComponent,
    ResultsComponentComponent
  ]
})
export class AppModule { }
