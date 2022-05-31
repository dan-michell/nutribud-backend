const express = require("express");
const cors = require("cors");
const hasher = require("pbkdf2-password-hash");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Client } = require("pg");

const app = express();
const PORT = 8080;
const connectionString = "postgres://sqlokxrl:tU6XSVGra7oaORqUxVYznMiTNUnwlxdt@tyke.db.elephantsql.com/sqlokxrl";
const client = new Client(connectionString);
client.connect();
const corsOptions = {
  origin: "http://localhost:3000",
  // also has:
  // methods, allowedHeaders, credentials, maxAge, etc...
};

app.use(cors(corsOptions));
app.use(express.json());
app.post("/login", handleLogin);
app.delete("/login", handleUserLogout);
app.post("/register", handleRegistration);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

async function handleLogin(req, res) {
  const { username, password } = req.body;
  const authorisationInfo = await loginAuthentication(username, password);
  if (authorisationInfo.isValid) {
    const userId = authorisationInfo.user.rows[0].id;
    const sessionId = await createSessionId(userId);
    return res.json({ sessionID: sessionId });
  }
  return res.status(400).json({ error: "Login failed, check details and try again." });
}

async function handleUserLogout(req, res) {
  const { sessionId } = req.parameters;
  const user = await getCurrentUser(sessionId);
  if (user.count < 1) {
    return res.json({ response: "User not logged in" }).status(400);
  }
  const query = `DELETE FROM sessions WHERE user_id = $1`;
  await client.query(query, [user.id]);
  return res.json({ response: "Successfully logged out" });
}

async function handleRegistration(req, res) {
  const { username, password, passwordConfirmation } = req.body;
  const validateCredentials = await validateRegistrationCredentials(username, password, passwordConfirmation);
  if (validateCredentials) {
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await hashPassword(password, salt);
    const query = "INSERT INTO users (username, hashed_password, salt) VALUES ( $1, $2, $3)";
    await client.query(query, [username, hashedPassword, salt]);
    return res.json({ response: "Successful registration" });
  }
  return res.status(400).json({ error: "Invalid credentials" });
}

async function loginAuthentication(username, password) {
  const query = "SELECT * FROM users WHERE username = $1";
  const existingUserCheck = await client.query(query, [username]);
  if (existingUserCheck.rowCount > 0) {
    const userSalt = existingUserCheck.rows[0].salt;
    const userHashedPassword = existingUserCheck.rows[0].hashed_password;
    const passwordEncrypted = await hashPassword(password, userSalt);
    if (passwordEncrypted === userHashedPassword) {
      return { isValid: true, user: existingUserCheck };
    }
  }
  return { isValid: false };
}

async function validateRegistrationCredentials(username, password, passwordConformation) {
  const query = "SELECT * FROM users WHERE username = $1";
  const duplicateUsernameCheck = await client.query(query, [username]);
  if (duplicateUsernameCheck.rowCount < 1 && password === passwordConformation && password.length > 1) {
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
  const query = "INSERT INTO sessions (uuid, user_id, created_at) VALUES ($1, $2, NOW())";
  await client.query(query, [sessionId, userId]);
  return sessionId;
}

async function getCurrentUser(sessionId) {
  const query = "SELECT * FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.created_at < NOW() + INTERVAL '7 DAYS' AND sessions.uuid = $1";
  const user = await client.query(query, [sessionId]);
  return user;
}
