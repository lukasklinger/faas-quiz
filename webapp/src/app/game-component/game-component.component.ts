import { Component, OnInit, ViewChild, ViewContainerRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef, ComponentFactory } from '@angular/core';

import { WelcomeComponentComponent } from '../welcome-component/welcome-component.component';
import { WaitingComponentComponent } from '../waiting-component/waiting-component.component';
import { LoadingComponentComponent } from '../loading-component/loading-component.component';
import { QuestionComponentComponent } from '../question-component/question-component.component';
import { ResultsComponentComponent } from '../results-component/results-component.component';

import { DatabaseServiceService } from '../database-service.service';

import { Game } from '../shared/game';
import { Player } from '../shared/player';

// This component is used to organize and show other components, depending
// on the current state of the game.

@Component({
  selector: 'app-game-component',
  templateUrl: './game-component.component.html',
  styleUrls: ['./game-component.component.css']
})
export class GameComponentComponent implements OnInit, AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef, static: false }) container: ViewContainerRef;

  welcomeComponentRef: any;
  waitingComponentRef: any;
  loadingComponentRef: any;
  questionComponentRef: any;
  resultsComponentRef: any;

  currentQuestion = 0;
  initialized: Boolean = false;
  newGame: Boolean = false;
  startGame: Boolean = false;
  admin: Boolean = false;
  playerName: String;
  gameState: Game;
  waitingForPlayer: Boolean = false;

  constructor(
    private resolver: ComponentFactoryResolver,
    private db: DatabaseServiceService
  ) { }

  ngOnInit() { }

  // Show WelcomeComponent first.
  ngAfterViewInit() {
    this.showWelcome();
  }

  // Removes any remaining components.
  ngOnDestroy() {
    if(this.welcomeComponentRef != undefined) {
      this.welcomeComponentRef.destroy();
    }

    if(this.waitingComponentRef != undefined) {
      this.waitingComponentRef.destroy();
    }

    if(this.loadingComponentRef != undefined) {
      this.loadingComponentRef.destroy();
    }

    if(this.questionComponentRef != undefined) {
      this.questionComponentRef.destroy();
    }

    if(this.resultsComponentRef != undefined) {
      this.resultsComponentRef.destroy();
    }
  }

  // Initializes game, removes WelcomeComponent and shows WaitingComponent.
  // Sets interval to update game state and heartbeat.
  gameInitialized() {
    // initializing game / adding player
    if(this.newGame) {
      this.db.initGame(this.playerName);
      this.admin = true;
    } else {
      this.db.addPlayer(this.playerName);
    }

    this.removeWelcome();
    this.showWaiting();

    setInterval(() => this.refreshGameState(), 1000);
    setInterval(() => this.db.heartbeat(), 3000);
  }

  // Removes WaitingComponent, shows loading animation and starts game.
  playersAdded() {
    this.removeWaiting();
    this.showLoading();
    this.db.startGame();
  }

  // Wait for all players to turn in their answers for a question. Will
  // advance to next question if everyone has answered, regardless of
  // remaining time.
  waitForPlayers(): Boolean {
    let keepWaiting = false;

    for(let i = 0; i < this.gameState.players.length; i++) {
      let player: Player = this.gameState.players[i];

      if(this.currentQuestion != 0) {
        if(player.questions.length != this.currentQuestion) {
          keepWaiting = true;
        }
      }
    }

    this.waitingForPlayer = keepWaiting;
    return keepWaiting;
  }

  // Removes old question, creates new QuestionComponent for next question
  // and displays it.
  startNewQuestion() {
    if(!this.waitForPlayers()) {
      if(this.questionComponentRef != undefined) {
        this.removeQuestion();
      }

      if(this.currentQuestion < 10) {
        let questionId = this.gameState.game.question_ids[this.currentQuestion];

        this.showQuestion(questionId);

        this.currentQuestion = this.currentQuestion + 1;
      } else {
        this.removeQuestion();
        this.showResults();
      }
    }
  }

  // Subscribe to new game states.
  refreshGameState() {
    this.db.getGame().subscribe(d => this.gotNewGameState(d));
  }

  // Function receives new game states and propagates updates as necessary.
  gotNewGameState(newState) {
    this.gameState = newState;

    if(this.waitingComponentRef != undefined) {
      this.waitingComponentRef.instance.gameState = this.gameState;
    }

    if(this.resultsComponentRef != undefined) {
      this.resultsComponentRef.instance.gameState = this.gameState;
    }

    if(this.startGame == false) {
      this.startGame = this.gameState.game.running;

      if(this.startGame == true) {
        this.startNewQuestion();
      }
    }

    if(this.waitingForPlayer) {
      this.startNewQuestion();
    }
  }

  // Adds WelcomeComponent.
  showWelcome() {
    this.container.clear();
    let factory = this.resolver.resolveComponentFactory(WelcomeComponentComponent);
    this.welcomeComponentRef = this.container.createComponent(factory);

    this.welcomeComponentRef.instance.newGame.subscribe(data => {this.newGame = data;});
    this.welcomeComponentRef.instance.playerName.subscribe(data => {this.playerName = data;});
    this.welcomeComponentRef.instance.initializedEvent.subscribe(data => {this.gameInitialized()});
  }

  // Removes WelcomeComponent.
  removeWelcome() {
    this.welcomeComponentRef = undefined;
  }

  showWaiting() {
    this.container.clear();
    let factory = this.resolver.resolveComponentFactory(WaitingComponentComponent);
    this.waitingComponentRef = this.container.createComponent(factory);
    this.waitingComponentRef.instance.admin = this.admin;
    this.waitingComponentRef.instance.startGame.subscribe(data => {this.initialized = data; this.playersAdded()});
  }

  removeWaiting() {
    this.waitingComponentRef = undefined;
  }

  showLoading() {
    this.container.clear();
    let factory = this.resolver.resolveComponentFactory(LoadingComponentComponent);
    this.loadingComponentRef = this.container.createComponent(factory);
  }

  removeLoading() {
    this.loadingComponentRef = undefined;
  }

  // Adds QuestionComponent for question from database.
  showQuestion(questionId: Number) {
    this.container.clear();
    let factory = this.resolver.resolveComponentFactory(QuestionComponentComponent);
    this.questionComponentRef = this.container.createComponent(factory);
    this.questionComponentRef.instance.questionId = questionId;
    this.questionComponentRef.instance.questionDone.subscribe(data => {this.startNewQuestion()});
  }

  removeQuestion() {
    this.questionComponentRef = undefined;
  }

  showResults() {
    this.container.clear();
    let factory = this.resolver.resolveComponentFactory(ResultsComponentComponent);
    this.resultsComponentRef = this.container.createComponent(factory);
    this.resultsComponentRef.instance.gameState = this.gameState;
  }

  removeResults() {
    this.resultsComponentRef = undefined;
  }

}
