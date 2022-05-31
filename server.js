const express = require("express");
const cors = require("cors");
const hasher = require("pbkdf2-password-hash");
const { Client } = require("pg");

const app = express();
const PORT = 8080;
const connectionString = "postgres://sqlokxrl:tU6XSVGra7oaORqUxVYznMiTNUnwlxdt@tyke.db.elephantsql.com/sqlokxrl";
const client = new Client(connectionString);
const corsOptions = {
  origin: "http://localhost:3000",
  // also has:
  // methods, allowedHeaders, credentials, maxAge, etc...
};

app.use(cors(corsOptions));
app.post("/login", handleLogin);
app.delete("/login", handleUserLogout);
app.post("/register", handleRegistration);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

async function handleLogin(req, res) {
  // Login User
}

async function handleUserLogout(req, res) {
  // Logout user, delete from sessions table
}

async function handleRegistration(req, res) {
  const { username, password, passwordConfirmation } = req.body;
  const validateCredentials = validateRegistrationCredentials(username, password, passwordConfirmation);
  if (validateCredentials) {
    const salt = crypto.randomUUID();
    const hashedPassword = hashPassword(password, salt);
    await client.query({
      text: "INSERT INTO users (username, hashed_password, salt) VALUES ( $1, $2, $3)",
      args: [username, hashedPassword, salt],
    });
    return res.send({ response: "Successful registration" }).status(200);
  }
  res.send({ error: "Invalid credentials" }).status(400);
}

async function loginAuthentication(username, password) {
  const existingUserCheck = await client.queryObject({
    text: "SELECT * FROM users WHERE username = $1",
    args: [username],
  });
  if (existingUserCheck.rowCount > 0) {
    const userSalt = existingUserCheck.rows[0].salt;
    const userHashedPassword = existingUserCheck.rows[0].encrypted_password;
    const passwordEncrypted = await hashPassword(password, userSalt);
    if (passwordEncrypted === userHashedPassword) {
      return [true, existingUserCheck];
    }
  }
  return [false];
}

async function validateRegistrationCredentials(username, password, passwordConformation) {
  const duplicateUsernameCheck = await client.queryArray({
    text: "SELECT * FROM users WHERE username = $1",
    args: [username],
  });
  if (duplicateUsernameCheck.rowCount < 1 && password === passwordConformation && password.length > 5) {
    return true;
  }
  return false;
}

async function hashPassword(password, salt) {
  const hashedPassword = await hasher.hash(password, salt);
  return hashedPassword;
}

async function createSessionId(userId) {
  const sessionId = crypto.randomUUID();
  await client.queryArray({
    text: "INSERT INTO sessions (uuid, user_id, created_at) VALUES ($1, $2, NOW())",
    args: [sessionId, userId],
  });
  return sessionId;
}

async function getCurrentUser(sessionId) {
  const query = "SELECT * FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.created_at < NOW() + INTERVAL '7 DAYS' AND sessions.uuid = $1";
  const user = await client.queryObject({
    text: query,
    args: [sessionId],
  });
  return user;
}
