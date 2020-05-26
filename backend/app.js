const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const Pool = require('pg').Pool

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

//Enable Cross-Origin Resource Sharing
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json())

const game_table = "public.quiz_games";
const player_table = "public.quiz_players_1";
const question_table = "public.quiz_questions_de";

app.get('/game', async function (req, res) {
  try {
    let statementGame = "SELECT * FROM " + game_table + " WHERE id = " + req.query.game_id + ";";
    let game = await queryDatabase(statementGame);

    let statementPlayers = "SELECT * FROM " + player_table + " WHERE game_id = " + req.query.game_id + ";";
    let players = await queryDatabase(statementPlayers);

    let result = new Object();
    result.game = game.rows[0];
    result.players = players.rows;

    res.statusCode = 200;
    res.json(result);
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.end();
    return;
  }
})

app.post('/game', async function (req, res) {
  if(req.body.mode === "init"){
    try {
      let data = await initGame(req);
      res.statusCode = 200;
      res.json(data);
    } catch (e) {
      console.log(e);
      res.statusCode = 500;
      res.end();
    }
  } else if (req.body.mode === "start") {
    try {
      let data = await startGame(req);
      res.statusCode = 200;
      res.json(data);
    } catch (e) {
      console.log(e);
      res.statusCode = 500;
      res.end();
    }
  }
})

app.get('/question', async function (req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.header('Access-Control-Allow-Origin', '*');

  let statementQuestion = "select * from " + question_table + " WHERE id = " + req.query.question_id + ";";

  try {
    let data = await queryDatabase(statementQuestion);
    res.statusCode = 200;
    res.json(data.rows[0]);
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.end();
  }
})

app.get('/player', async function (req, res) {
  try {
    let statementPlayer = "SELECT * FROM " + player_table + " WHERE id = " + req.query.player_id + ";";
    let data = await queryDatabase(statementPlayer);
    res.statusCode = 200;
    res.json(data.rows[0]);
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.end();
  }
})

app.post('/player', async function (req, res) {
  if(req.body.mode === "addPlayer"){
    try {
      let data = await addPlayer(req);
      res.statusCode = 200;
      res.json(data);
    } catch (e) {
      console.log(e);
      res.statusCode = 500;
      res.end();
    }
  } else if (req.body.mode === "addAnswer") {
    try {
      let data = await addAnswer(req);
      res.statusCode = 200;
      res.json(data);
    } catch (e) {
      res.statusCode = 500;
      res.end();
    }
  } else if (req.body.mode === "heartbeat") {
    try {
      let data = await heartbeat(req);
      res.statusCode = 200;
      res.json(data);
    } catch (e) {
      res.statusCode = 500;
      res.end();
    }
  }
})

async function startGame(req) {
  return new Promise(async function(resolve, reject) {
    const statementStart = "UPDATE " + game_table + " SET accepting_players = false, running = true WHERE id = $1 RETURNING *;";

    let game_id = req.body.game_id;

    let values = [game_id];

    try {
      let result = await pool.query(statementStart, values);
      resolve(result);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

async function heartbeat(req) {
  return new Promise(async function(resolve, reject) {
    const statementHeartbeat = "UPDATE " + player_table + " SET heartbeat = $1 WHERE id = $2 RETURNING *;";

    let heartbeat = new Date();
    let player_id = req.body.player_id;

    let values = [heartbeat, player_id];

    try {
      let result = await pool.query(statementHeartbeat, values);
      resolve(result);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

async function addAnswer(req) {
  return new Promise(async function(resolve, reject) {
    const statementAddAnswer = "UPDATE " + player_table + " SET questions = array_append(questions, $1), heartbeat = $2 WHERE id = $3 RETURNING *;";

    let answer = req.body.answer;
    let heartbeat = new Date();
    let player_id = req.body.player_id;

    let values = [answer, heartbeat, player_id];

    try {
      let result = await pool.query(statementAddAnswer, values);
      resolve(result.rows);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });;
}

async function addPlayer(req) {
  return new Promise(async function(resolve, reject) {
    const statementNewPlayer = "INSERT INTO " + player_table + "(game_id, name, questions, heartbeat, main_player) VALUES ($1, $2, $3, $4, $5) RETURNING *;";

    let game_id = parseInt(req.body.game_id);
    let name = req.body.name;
    let questions = [];
    let heartbeat = new Date();
    let main_player = req.body.main_player || false;

    let values = [game_id, name, questions, heartbeat, main_player];

    try {
      let result = await pool.query(statementNewPlayer, values);
      resolve(result.rows[0]);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

async function initGame(req) {
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

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
})

server.listen(3000);
console.log("Server running on port 3000.");
