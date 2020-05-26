import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import { catchError, map, tap, take } from 'rxjs/operators';

import { Game } from './shared/game';
import { Player } from './shared/player';
import { Question } from './shared/question';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

// This database services provides an interface between the application and
// the database API running on a FaaS provider.
export class DatabaseServiceService {
  // URL to RESTful API endpoints.
  baseURL: String = "https://izcknkl1qg.execute-api.eu-west-1.amazonaws.com/production/";

  // Once set, gameId and playerId will be used for further requests
  // to API.
  public gameId: Number = undefined;
  public playerId: Number = undefined;

  constructor(private http: HttpClient) { }

  // Retrieve game info from database.
  getGame(): Observable<Game> {
    let reqData: any = new Object();
    reqData.id = this.gameId;
    reqData.method = "getGame";

    return this.http.post<Game>(this.baseURL + "game", reqData, httpOptions).pipe(
      catchError(this.handleError('getGame', undefined)));
  }

  // Retrieve player info from database.
  getPlayer(player_id: Number): Observable<Player> {
    let reqData: any = new Object();
    reqData.method = "getPlayer";
    reqData.id = player_id;

    return this.http.post<Player>(this.baseURL + "player", reqData, httpOptions).pipe(
      catchError(this.handleError('getPlayer', undefined)));
  }

  // Retrieve info on question from database.
  getQuestion(question_id: Number): Observable<Question> {
    let reqData: any = new Object();
    reqData.id = question_id;

    return this.http.post<Question>(this.baseURL + "question", reqData, httpOptions).pipe(
      catchError(this.handleError('getPlayer', undefined)));
  }

  // Initialize a new game.
  initGame(player_name: String): void {
    let reqData: any = new Object();
    reqData.method = "postGame";
    reqData.mode = "init";

    let resultGame = this.http.post<Game>(this.baseURL + "game", reqData, httpOptions).pipe(
        catchError(this.handleError('initGame', undefined)));

    resultGame.subscribe(d => this.initializeGame(d, player_name));
  }

  // Start a new game.
  startGame(): void {
    let reqData: any = new Object();
    reqData.method = "postGame";
    reqData.mode = "start";
    reqData.id = this.gameId;

    let result = this.http.post<any>(this.baseURL + "game", reqData, httpOptions).pipe(
      catchError(this.handleError('startGame', undefined)));

    result.subscribe(d => console.log(d));
  }

  // Function initializes game further by adding first player once the game has
  // been set up in database and stores playerId and gameId locally for
  // further requests.
  private initializeGame(data, player_name){
    this.gameId = data.id;

    let reqData: any = new Object();
    reqData.method = "postPlayer";
    reqData.mode = "addPlayer";
    reqData.gameId = this.gameId;
    reqData.playerName = player_name;
    reqData.mainPlayer = true;

    let resultPlayer = this.http.post<Player>(this.baseURL + "player", reqData, httpOptions).pipe(
        catchError(this.handleError('initGame', undefined)));

    resultPlayer.subscribe(d => this.playerId = d.id);
  }

  // Add a new player to a preexisting game.
  addPlayer(name: String): void {
    let reqData: any = new Object();
    reqData.method = "postPlayer";
    reqData.mode = "addPlayer";
    reqData.gameId = this.gameId;
    reqData.playerName = name;
    reqData.mainPlayer = false;

    let result = this.http.post<Player>(this.baseURL + "player", reqData, httpOptions).pipe(
        catchError(this.handleError('addPlayer', undefined)));

    result.subscribe(d => {this.playerId = d.id; console.log(d);});
  }

  // Add player's answer to a question to the database.
  addAnswer(answer: Boolean): Observable<any> {
    let reqData: any = new Object();
    reqData.method = "postPlayer";
    reqData.mode = "addAnswer";
    reqData.answer = answer;
    reqData.id = this.playerId;

    return this.http.post<Player>(this.baseURL + "player", reqData, httpOptions).pipe(
        catchError(this.handleError('addAnswer', undefined)));
  }

  // Update last seen variable in database.
  heartbeat(): void {
    if(this.playerId != undefined) {
      let reqData: any = new Object();
      reqData.method = "postPlayer";
      reqData.mode = "heartbeat";
      reqData.id = this.playerId;

      let result = this.http.post<any>(this.baseURL + "player", reqData, httpOptions).pipe(
        catchError(this.handleError('heartbeat', undefined)));

      result.subscribe((d) => (d));
    }
  }

  // Generic error handler.
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(operation + ' failed: ');
      console.log(error);
      return of (result as T);
    }
  }
}
