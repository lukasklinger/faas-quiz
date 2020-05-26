import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Game } from '../shared/game';

// Component shows currently added players before a game starts.
@Component({
  selector: 'app-waiting-component',
  templateUrl: './waiting-component.component.html',
  styleUrls: ['./waiting-component.component.css']
})
export class WaitingComponentComponent implements OnInit {
  @Output() startGame = new EventEmitter<boolean>();
  @Input() admin: Boolean;

  _gameState: Game;
  names: Array<any>;
  show: Boolean = false;

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set gameState(val: any) {
    if(val != undefined) {
      this._gameState = val;
      this.onGameUpdate();
    }
  }

  // Show player names on update, first player may start the game.
  onGameUpdate() {
    this.names = this._gameState.players;
    this.names.sort();

    if(this.admin) {
      this.show = true;
    }
  }

  onButtonClick() {
    this.startGame.emit(true);
  }

}
