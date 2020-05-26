import { Component } from '@angular/core';
import { DatabaseServiceService } from './database-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-quiz';
  
  constructor(
    private db: DatabaseServiceService
  ) { 
    this.test();
  }
  
  test(): any {
    //this.db.initGame();
    //this.db.playerId = 9;
    //this.db.addAnswer(true).subscribe(d => console.log(d));
    //this.db.heartbeat().subscribe(d => console.log(d));
  }
}
