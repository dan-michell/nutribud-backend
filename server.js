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
  // Register user
}

async function hashPassword() {
  // Randomly generate a salt
  const hashedPassword = await hasher.hash("password");
  // Or add in salt
  // const hashedPassword = await hasher.hash("password", saltString);
  return hashedPassword;
}

async function compare(plainTextPassword, passwordHash) {
  const auth = hasher.compare(plainTextPassword, passwordHash);
  if (auth) {
    console.log("Authenticated!");
  } else {
    console.log("Not authenticated. :(");
  }
}
