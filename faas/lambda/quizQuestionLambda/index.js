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

const question_table = "public.quiz_questions_de";

exports.handler = async (event) => {
  console.log(event);

  let result = new Object();
  let statementQuestion = "select * from " + question_table + " WHERE id = " + event.id + ";";

  try {
    result = await queryDatabase(statementQuestion);
    result = result.rows[0];
    result.status = 200;
  } catch (e) {
    console.log(e);
    result.status = 500;
  }

  return result;
};

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
