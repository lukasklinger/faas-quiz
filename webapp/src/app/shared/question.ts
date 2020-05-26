export class Question {
  constructor(
    public id: Number,
    public question: String,
    public answer: String,
    public incorrect1: String,
    public incorrect2: String,
    public incorrect3: String,
    public difficulty: Number,
    public category: String,
    public hint: String,
    public explanation: String,
    public source: String
  ) { }
}
