import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatabaseServiceService } from '../database-service.service';

// Component shows question and adds answer to database.

@Component({
  selector: 'app-question-component',
  templateUrl: './question-component.component.html',
  styleUrls: ['./question-component.component.css']
})
export class QuestionComponentComponent implements OnInit {
  @Output() questionDone = new EventEmitter<boolean>();
  @Input() questionId: Number;

  data: any;
  question: String;
  answer1: String;
  answer2: String;
  answer3: String;
  answer4: String;
  answersArray: Array<any>;

  button1light: Boolean = true;
  button2light: Boolean = true;
  button3light: Boolean = true;
  button4light: Boolean = true;
  progressSecs = 1000;

  wrong: Boolean = false;
  correct: Boolean = false;
  inputActive: Boolean = true;

  constructor(private db: DatabaseServiceService) { }

  ngOnInit() {
    if(this.questionId != undefined){
      this.loadQuestion(this.questionId);
    }
  }

  // Retrieves question from database.
  loadQuestion(questionId: Number) {
    this.db.getQuestion(questionId).subscribe((d) => this.updateQuestion(d));
  }

  // Click/tap on button deactivates input, result is evaluated.
  clickedButton(buttonId) {
    if(this.inputActive){
      this.inputActive = false;
      let givenAnswer: String = this.answersArray[buttonId];

      if(givenAnswer === this.data.answer) {
        this.isCorrect(buttonId);
      } else {
        this.isWrong();
      }
    }
  }

  // If given answer is correct, background turns green and answer is added
  // to the database.
  isCorrect(buttonId){
    this.addAnswer(true);
    this.correct = true;

    if(buttonId == 0) {
      this.button1light = false;
    } else if (buttonId == 1) {
      this.button2light = false;
    } else if (buttonId == 2) {
      this.button3light = false;
    } else if (buttonId == 3) {
      this.button4light = false;
    }
  }

  // If given answer is incorrect, background turns red and answer is added
  // to the database.
  isWrong(){
    this.addAnswer(false);
    this.wrong = true;
  }

  addAnswer(answer: Boolean) {
    this.db.addAnswer(answer).subscribe(d => console.log(d));

    setTimeout(() => this.notifyDone(), 2000);
  }

  // Inform GameComponent that user answered.
  notifyDone() {
    this.questionDone.emit(true);
  }

  startCountdown() {
    this.progressSecs = 1000;
    setInterval(() => this.countdownTick(), 10);
  }

  // Count down, update animation.
  countdownTick() {
    if(this.progressSecs > 0) {
      this.progressSecs = this.progressSecs - 1;
    } else {
      if(this.inputActive == true) {
        this.inputActive = false;
        this.isWrong();
      }
    }
  }

  // Add data to interface.
  updateQuestion(data) {
    this.data = data;

    let answers = [data.answer, data.incorrect1, data.incorrect2, data.incorrect3];
    this.answersArray = this.shuffleArray(answers);

    this.question = this.data.question;
    this.answer1 = this.answersArray[0];
    this.answer2 = this.answersArray[1];
    this.answer3 = this.answersArray[2];
    this.answer4 = this.answersArray[3];

    this.startCountdown();
  }

  // Shuffle answers for every user.
  shuffleArray(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
