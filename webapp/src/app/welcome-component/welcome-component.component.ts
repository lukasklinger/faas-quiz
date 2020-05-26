import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { DatabaseServiceService } from '../database-service.service';

// This component allows users to enter their username,
// create a new game or join an existing game.

@Component({
  selector: 'app-welcome-component',
  templateUrl: './welcome-component.component.html',
  styleUrls: ['./welcome-component.component.css']
})
export class WelcomeComponentComponent implements OnInit {
  @ViewChild('gameIdInput', {static: true}) gameIdInput: ElementRef;
  @ViewChild('nameInput', {static: true}) nameInput: ElementRef;
  @Output() initializedEvent = new EventEmitter<boolean>();
  @Output() newGame = new EventEmitter<boolean>();
  @Output() playerName = new EventEmitter<String>();

  constructor(private db: DatabaseServiceService) { }

  ngOnInit() {
  }

  // Gets username from input field, and emits it back to GameComponent.
  startNewGame() {
    let playerName = this.nameInput.nativeElement.value;

    this.newGame.emit(true);
    this.playerName.emit(playerName);
    this.initializedEvent.emit(true);
  }

  // Gets username and game ID, emits it back to GameComponent.
  joinExistingGame() {
    let gameIdInputString = this.gameIdInput.nativeElement.value;
    let playerName = this.nameInput.nativeElement.value;
    let gameIdInputNo = parseInt(gameIdInputString);

    if(Number.isInteger(gameIdInputNo)){
      this.db.gameId = parseInt(gameIdInputString);
      this.playerName.emit(playerName);
      this.initializedEvent.emit(true);
    }
  }

}
