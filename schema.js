const { Client } = require("pg");
const client = new Client("postgres://sqlokxrl:tU6XSVGra7oaORqUxVYznMiTNUnwlxdt@tyke.db.elephantsql.com/sqlokxrl");

async function populateDb() {
  await client.connect();

  await client.query(`CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  salt TEXT NOT NULL
  )`);

  await client.query(`CREATE TABLE sessions (
  uuid TEXT PRIMARY KEY,
  user_id INTEGER,
  created_at DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await client.query(`CREATE TABLE user_info (
  user_id INTEGER,
  name TEXT,
  age INTEGER,
  weight INTEGER,
  height INTEGER,
  sex, TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await client.query(`CREATE TABLE user_goals (
  user_id INTEGER,
  calories INTEGER DEFAULT 2000 NOT NULL,
  protein INTEGER DEFAULT 125 NOT NULL,
  carbs INTEGER DEFAULT 275 NOT NULL,
  fats INTEGER DEFAULT 55 NOT NULL,
  sugar INTEGER DEFAULT 30 NOT NULL,
  salt INTEGER DEFAULT 6 NOT NULL,
  fiber INTEGER DEFAULT 30 NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await client.query(`CREATE TABLE tracked_items (
  id SERIAL PRIMARY KEY,
  item_info JSONB
  )`);

  await client.query(`CREATE TABLE user_history (
  item_id INTEGER,
  user_id INTEGER,
  serving_size_g INTEGER NOT NULL,
  created_at DATE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (item_id) REFERENCES tracked_items(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await client.query(`CREATE TABLE user_perf (
  user_id INTEGER,
  perf_score INTEGER DEFAULT 0 NOT NULL,
  created_at DATE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await client.end();
}

populateDb();
