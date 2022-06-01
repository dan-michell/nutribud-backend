const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const hasher = require("pbkdf2-password-hash");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Client } = require("pg");

const baseFoodParserApiUrl = "https://api.edamam.com/api/food-database/v2/parser?app_id=45463206&app_key=1fa94f20926c60638eb14a7abca872b3";
const baseFoodNutrientsApiUrl = "https://api.edamam.com/api/food-database/v2/nutrients?app_id=45463206&app_key=1fa94f20926c60638eb14a7abca872b3";

const app = express();
const PORT = process.env.PORT || 8080;
const connectionString = "postgres://sqlokxrl:tU6XSVGra7oaORqUxVYznMiTNUnwlxdt@tyke.db.elephantsql.com/sqlokxrl";
const client = new Client(connectionString);
client.connect();
const corsOptions = {
  origin: ["http://localhost:3000", "https://nutribud-frontend.sigmalabs.co.uk"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.json({ response: "running" });
});
app.post("/login", handleLogin);
app.delete("/login", handleUserLogout);
app.get("/login", getLoggedInUser);
app.post("/register", handleRegistration);
app.get("/search-text", handleItemSearchText);
app.get("/search-barcode", handleItemSearchBarcode);
app.post("/tracking", handleTrackItem);
app.get("/tracking", getUserTrackedItems);
app.get("/goals", getUserGoals);
app.post("/goals", handleGoalAddition);
app.patch("/goals", updateUserGoals);
app.get("/user-info", getUserInfo);
app.post("/user-info", handleUserInfoAddition);
app.patch("/user-info", updateUserInfo);
app.get("/performance-history", getUserPerformance);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
module.exports = app;

async function handleLogin(req, res) {
  const { username, password } = req.body;
  const authorisationInfo = await loginAuthentication(username, password);
  if (authorisationInfo.isValid) {
    const userId = authorisationInfo.user.rows[0].id;
    const sessionId = await createSessionId(userId);
    res.cookie("sessionId", sessionId);
    return res.json({ response: "Login Success!" });
  }
  return res.status(400).json({ error: "Login failed, check details and try again." });
}

async function handleUserLogout(req, res) {
  const sessionId = req.cookies.sessionId;
  const user = await getCurrentUser(sessionId);
  if (user.length > 0) {
    const query = `DELETE FROM sessions WHERE user_id = $1`;
    await client.query(query, [user[0].id]);
    return res.json({ response: "Successfully logged out" });
  }
  return res.status(400).json({ error: "User not logged in" });
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

async function getLoggedInUser(req, res) {
  const sessionId = req.cookies.sessionId;
  const user = await getCurrentUser(sessionId);
  if (user.length > 0) {
    return res.json({ response: true });
  } else {
    return res.json({ response: false });
  }
}

async function handleItemSearchText(req, res) {
  const { item } = req.query;
  const parsedResponse = await fetch(`${baseFoodParserApiUrl}&ingr=${item}&nutrition-type=cooking`);
  const parsedData = await parsedResponse.json();
  const formattedParsedData = formatParsedData(parsedData);

  return formattedParsedData.length > 0 ? res.json({ response: formattedParsedData }) : res.json({ error: `${item} not found` });
}

async function handleItemSearchBarcode(req, res) {
  const { barcode } = req.query;
  const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  const foodData = await response.json();
  if (foodData.status !== 0) {
    const productImg = foodData.product.image_url;
    const nutriments = foodData.product.nutriments;
    const servingSize = foodData.product.serving_size;
    const name = foodData.product.product_name;
    const genericName = foodData.product.generic_name;
    return res.json({ productImg, nutriments, servingSize, name, genericName });
  }
  return res.json({ error: `No product with barcode ${barcode} found` });
}

async function handleTrackItem(req, res) {
  const { itemInfo, amount } = req.body;
  const sessionId = req.cookies.sessionId;
  const user = await getCurrentUser(sessionId);
  if (user.length > 0) {
    const trackedItemsQuery = "INSERT INTO tracked_items (item_info) VALUES ($1)";
    await client.query(trackedItemsQuery, [itemInfo]);
    await addToUserHistory(itemInfo, amount, user[0]);
    return res.json({ response: "Item track success!" });
  }
  return res.json({ error: "Need to be logged in to track items." });
}

async function getUserTrackedItems(req, res) {
  const sessionId = req.cookies.sessionId;
  const user = await getCurrentUser(sessionId);
  const query =
    "SELECT item_info, serving_size_g FROM user_history JOIN tracked_items ON user_history.item_id = tracked_items.id WHERE user_history.created_at = NOW() AND user_history.user_id = $1";
  const todayTrackedItems = await client.query(query, [user[0].id]);
  if (todayTrackedItems.rows.length > 0) {
    return res.json(todayTrackedItems.rows);
  }
  return res.json({ error: "User has not tracked any items today." });
}

async function getUserGoals(req, res) {
  const sessionId = req.cookies.sessionId;
  const user = await getCurrentUser(sessionId);
  if (user.length > 1) {
    const query = "SELECT * FROM user_goals WHERE user_id = $1";
    const userGoals = await client.query(query, [user[0].id]);
    return res.json(userGoals);
  }
}

async function handleGoalAddition(req, res) {}

async function updateUserGoals(req, res) {}

async function getUserInfo(req, res) {}

async function handleUserInfoAddition(req, res) {}

async function updateUserInfo(req, res) {}

async function getUserPerformance(req, res) {}

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
  return user.rows;
}

function formatParsedData(parsedData) {
  const formattedData = [];
  const nutrientLabels = {
    ENERC_KCAL: "Calories",
    PROCNT: "Protein",
    FAT: "Total lipid (fat)",
    CHOCDF: "Carbohydrate, by difference",
    FIBTG: "Fiber, total dietary",
  };
  for (const item of parsedData["hints"]) {
    const rawNutrients = item["food"]["nutrients"];
    const foodId = item["food"]["foodId"];
    const name = item["food"]["label"];
    const nutriments = {};
    const image = item["food"]["image"];
    for (const nutrient of Object.keys(rawNutrients)) {
      const nutrienLabel = nutrientLabels[nutrient];
      nutriments[nutrienLabel] = rawNutrients[nutrient];
    }
    formattedData.push({ name, nutriments, image, foodId });
  }
  return formattedData;
}
function getBodyInfoNutrientFetch(foodId, quantity) {
  const measure = "http://www.edamam.com/ontologies/edamam.owl#Measure_gram";
  const body = { ingredients: [{ quantity, measureURI: measure, foodId }] };
  return JSON.stringify(body);
}

async function getNutrientData(body) {
  const nutrientsResponse = await fetch(`${baseFoodNutrientsApiUrl}`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  const nutrientData = await nutrientsResponse.json();

  return nutrientData;
}

function getFormattedNutrientsData(nutrientInfo) {
  const name = nutrientInfo["ingredients"][0]["parsed"][0]["food"];
  const calories = nutrientInfo["calories"];
  const nutriments = {};
  const totalNutrients = nutrientInfo["totalNutrients"];
  for (const nutrient of Object.keys(totalNutrients)) {
    const nutrientName = totalNutrients[nutrient]["label"];
    const nutrientQuantity = totalNutrients[nutrient]["quantity"];
    nutriments[nutrientName] = nutrientQuantity;
  }
  const formattedData = { name, calories, nutriments };

  return formattedData;
}
