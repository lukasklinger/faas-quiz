const Pool = require('pg').Pool

// conntect to database
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
  ssl:{
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
})

const game_table = "public.quiz_games";
const player_table = "public.quiz_players_1";
const question_table = "public.quiz_questions_de";

exports.handler = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    let event = req.body;
    console.log(event);

    let result = new Object();

    if(event.method === "getGame") {
      try {
        result = await getGame(event.id);
        result.status = 200;
      } catch (e) {
        result.status = 500;
        console.log(e);
      }
    } else if (event.method === "postGame") {
      try {
        result = await postGame(event.mode, event.id);
        result.status = 200;
      } catch (e) {
        result.status = 500;
        console.log(e);
      }
    } else {
      result.status = 500;
    }

    res.json(result);
  }
};

// update game in database
async function postGame(mode, gameId) {
  return new Promise(async function(resolve, reject) {
    let result = new Object();

    if(mode === "init"){
      try {
        result = await initGame();
        result.status = 200;

        resolve(result);
      } catch (e) {
        console.log(e);
        reject(e);
      }
    } else if (mode === "start") {
      try {
        result = await startGame(gameId);
        result.status = 200;

        resolve(result);
      } catch (e) {
        console.log(e);
        reject(e);
      }
    }
  });
}

// initialize new game
async function initGame() {
  return new Promise(async function(resolve, reject) {
    const statementNewGame = "INSERT INTO " + game_table + "(start_date, question_ids, accepting_players, running) VALUES ($1, $2, $3, $4) RETURNING *;";

    let start_date = new Date();
    let questionIDs = await getRandomQuestions(1, 10);
    let accepting_players = true;
    let running = false;

    let values = [start_date, questionIDs, accepting_players, running];

    try {
      let result = await pool.query(statementNewGame, values);
      resolve(result.rows[0]);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

// start new game
async function startGame(gameId) {
  return new Promise(async function(resolve, reject) {
    const statementStart = "UPDATE " + game_table + " SET accepting_players = false, running = true WHERE id = $1 RETURNING *;";

    let values = [gameId];

    try {
      let result = await pool.query(statementStart, values);
      resolve(result.rows);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

// select random questions from database and add to game
async function getRandomQuestions(difficulty, limit){
  return new Promise(async function(resolve, reject) {
    // selecting 10 random question ids
    let questionIDs = new Array;
    let statementQuestions = "select id from " + question_table;
    //statementQuestions += " where difficulty = " + difficulty;
    statementQuestions += " order by random() limit " + limit + ";";

    try {
      let dataQuestions = await queryDatabase(statementQuestions);

      dataQuestions.rows.forEach(function (d) {
        questionIDs.push(d.id);
      });

      resolve(questionIDs);
    } catch (e) {
      reject(e);
    }
  });
}

// retrieve game data
async function getGame(gameId) {
  return new Promise(async function(resolve, reject) {
    try {
      let result = new Object();

      let statementGame = "SELECT * FROM " + game_table + " WHERE id = " + gameId + ";";
      let game = await queryDatabase(statementGame);

      let statementPlayers = "SELECT * FROM " + player_table + " WHERE game_id = " + gameId + ";";
      let players = await queryDatabase(statementPlayers);

      result.game = game.rows[0];
      result.players = players.rows;

      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
}

// generic function to query database
async function queryDatabase(statement) {
  return new Promise(function(resolve, reject) {
    pool.query(statement, function(error, result){
      if (error){
        reject(error);
      };

      resolve(result);
    });
  });
}

// generic error handler for database
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
})
