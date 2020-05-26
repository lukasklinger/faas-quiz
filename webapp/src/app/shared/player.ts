export class Player {
  constructor(
    public id: Number,
    public game_id: Number,
    public name: String,
    public questions: Array<Boolean>,
    public heartbeat: Object
  ) { }
}
