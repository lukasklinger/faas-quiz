import { Component, OnInit, Input, Output } from '@angular/core';

import { Game } from '../shared/game';
import { Player } from '../shared/player';

// Component shows game results.

@Component({
  selector: 'app-results-component',
  templateUrl: './results-component.component.html',
  styleUrls: ['./results-component.component.css']
})
export class ResultsComponentComponent implements OnInit {
  results: Array<String> = [];
  private _gameState: Game;

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set gameState(val: any) {
    if(val != undefined) {
      this._gameState = val;
      this.calculateResult();
    }
  }

  // Sum points for each player.
  calculateResult() {
    this.results = [];

    for(let i = 0; i < this._gameState.players.length; i++) {
      let player: Player = this._gameState.players[i];
      let playerScore = 0;

      for(let j = 0; j < player.questions.length; j++) {
        if(player.questions[j]){
          playerScore++;
        }
      }

      let playerString = player.name + " (" + playerScore.toString(10) + " Punkte)";
      this.results.push(playerString);
    }

    this.results.sort();
  }

  onButtonClick() {
    window.location.href = '/';
  }
}
