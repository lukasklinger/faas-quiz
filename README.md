# FaaS-Quiz
A quiz for multiple people based on Angular, running on FaaS.

## Components
### Backend
In the folder "backend" you will find Node.js code that connects to a PostgreSQL database and provide all endpoints as needed by the web app. Environment variables *PG_USER*, *PG_HOST*, *PG_DB*, *PG_PASS*, *PG_PORT* need to be set.

### FaaS Functions
The code in this directory is separated into functions for Amazon Lambda, Google Cloud Functions and Microsoft Azure Functions. Same environment variables as backend.

#### quizGame Function
Function connects to database and provides access to game data.

#### quizPlayer Function
Function connects to database and provides access to player data.

#### quizQuestion Function
Function connects to database and provides access to question data.

### Web App
The web app connects to the backend or the FaaS functions to access the database.

## Database Layout
FaaS-Quiz uses 3 tables in a PostgreSQL database.

### quiz_games
Columns:
* *id* (int, automatically incrementing)
* *question_ids* (int array)
* *current_question* (int)
* *accepting_players* (boolean)
* *running* (boolean)
* *start_date* (timestamptz)

### quiz_players_1
Columns:
* *id* (int, automatically incrementing)
* *game_id* (int)
* *name* (varchar)
* *questions* (boolean array)
* *heartbeat* (timestamptz)
* *main_player* (boolean)

### quiz_questions_de
Columns:
* *id* (int, automatically incrementing)
* *question* (varchar)
* *answer* (varchar)
* *incorrect1* (varchar)
* *incorrect2* (varchar)
* *incorrect3* (varchar)
* *difficulty* (int)
* *category* (varchar)
* *hint* (varchar)
* *explanation* (varchar)
* *source* (varchar)
