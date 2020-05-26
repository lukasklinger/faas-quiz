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

const player_table = "public.quiz_players_1";

module.exports = async function (context, req) {
  let event = req.body;
  context.log(event);

  let result = new Object();

  if(event.method === "getPlayer") {
    try {
      result = await getPlayer(event.id);
      result.status = 200;
    } catch (e) {
      context.log(e);
      result.status = 500;
    }
  } else if (event.method === "postPlayer") {
    try {
      result = await postPlayer(event.mode, event.id, event.answer, event.gameId, event.playerName, event.mainPlayer);
      result.status = 200;
    } catch (e) {
      context.log(e);
      result.status = 500;
    }
  } else {
    result.status = 500;
  }

  context.res = {
    status: 200, /* Defaults to 200 */
    body: result,
    headers: {
        'Content-Type': 'application/json'
    }
  };
};

// get player info from database
async function getPlayer(playerId) {
  return new Promise(async function(resolve, reject) {
    try {
      let statementPlayer = "SELECT * FROM " + player_table + " WHERE id = " + playerId + ";";
      let data = await queryDatabase(statementPlayer);

      resolve(data.rows);
    } catch (e) {
      reject(e);
    }
  });
}

// update player info in database
async function postPlayer(mode, playerId, answer, gameId, playerName, mainPlayer) {
  return new Promise(async function(resolve, reject) {
    if(mode === "addPlayer"){
      try {
        let data = await addPlayer(gameId, playerName, mainPlayer);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    } else if (mode === "addAnswer") {
      try {
        let data = await addAnswer(answer, playerId);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    } else if (mode === "heartbeat") {
      try {
        let data = await heartbeat(playerId);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    }
  });;
}

// add new player to database and game
async function addPlayer(gameId, playerName, mainPlayer) {
  return new Promise(async function(resolve, reject) {
    const statementNewPlayer = "INSERT INTO " + player_table + "(game_id, name, questions, heartbeat, main_player) VALUES ($1, $2, $3, $4, $5) RETURNING *;";

    let game_id = parseInt(gameId);
    let name = playerName;
    let questions = [];
    let heartbeat = new Date();
    let main_player = mainPlayer || false;

    let values = [game_id, name, questions, heartbeat, main_player];

    try {
      let result = await pool.query(statementNewPlayer, values);
      resolve(result.rows[0]);
    } catch (e) {
      reject(e);
    }
  });
}

// add player answer to game
async function addAnswer(answer, playerId) {
  return new Promise(async function(resolve, reject) {
    const statementAddAnswer = "UPDATE " + player_table + " SET questions = array_append(questions, $1), heartbeat = $2 WHERE id = $3 RETURNING *;";

    let heartbeat = new Date();

    let values = [answer, heartbeat, playerId];

    try {
      let result = await pool.query(statementAddAnswer, values);
      resolve(result.rows);
    } catch (e) {
      reject(e);
    }
  });
}

// update heartbeat variable in database
async function heartbeat(playerId) {
  return new Promise(async function(resolve, reject) {
    const statementHeartbeat = "UPDATE " + player_table + " SET heartbeat = $1 WHERE id = $2 RETURNING *;";

    let heartbeat = new Date();

    let values = [heartbeat, playerId];

    try {
      let result = await pool.query(statementHeartbeat, values);
      resolve(result.rows);
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
  context.error('Unexpected error on idle client', err);
  process.exit(-1);
})
