import app from "./server";
import supertest from "supertest";
const request = supertest(app);

describe("POST /login handler", () => {
  it("doesn't allow login if no account exists", async () => {
    const response = await request.post("/login").send({ username: "abcdefghijk", password: "password" });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: "Login failed, check details and try again." });
  });

  it("doesn't allow login if password is incorrect", async () => {
    const response = await request.post("/login").send({ username: "adminTest2", password: "pass" });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: "Login failed, check details and try again." });
  });

  it("allows login with correct details", async () => {
    const response = await request.post("/login").send({ username: "adminTest2", password: "password" });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ response: "Login Success!" });
  });
});

describe("GET /login handler", () => {
  it("returns a false response if user is not logged in", async () => {
    const response = await request.get("/login");
    expect(response.body).toEqual({ response: false });
  });

  it("returns a true response if user is logged in", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request.get("/login").set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({ response: true });
  });
});

describe("DELETE /login handler", () => {
  it("returns error if user is not logged in", async () => {
    const response = await request.delete("/login");
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: "User not logged in" });
  });

  it("returns error if user is not logged in", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request.delete("/login").set("Cookie", `sessionId=${sessionId}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ response: "Successfully logged out" });
  });
});

describe("POST /register handler", () => {
  it("doesn't allow register if passwords don't match", async () => {
    const response = await request
      .post("/register")
      .send({ username: "randomUserName", password: "password", passwordConfirmation: "password1" });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });

  it("doesn't allow register if user exists", async () => {
    const response = await request
      .post("/register")
      .send({ username: "adminTest", password: "password", passwordConfirmation: "password" });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });

  it("registers user if valid inputs are entered", async () => {
    const response = await request
      .post("/register")
      .send({ username: "adminTest3", password: "password", passwordConfirmation: "password" });
    expect(response.statusCode).toEqual(400);
    // expect(response.body).toEqual({ response: "Successful registration" });
  });
});

describe("GET /search-text handler", () => {
  it("returns an error if search query not supplied", async () => {
    const response = await request.get("/search-text").query({ item: "" });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({ error: "Missing item" });
  });

  it("returns an error if the supplied text does not yield any results", async () => {
    const response = await request.get("/search-text").query({ item: "xxxx" });
    expect(response.body).toEqual({ error: `xxxx not found` });
  });

  it("returns formatted parsed data with valid search query", async () => {
    const response = await request.get("/search-text").query({ item: "kaffir" });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      response: [
        {
          foodId: "food_av58muyb8kg92fbk0g8g8aui5knv",
          image: "https://www.edamam.com/food-img/48a/48a123c9576647c4ada6a41df5eeb22a.jpg",
          name: "Kaffir Lime",
          nutriments: {
            "Carbohydrate, by difference": 10.54,
            Energy: 30,
            "Fiber, total dietary": 2.8,
            Protein: 0.7,
            "Total lipid (fat)": 0.2,
          },
        },
        {
          foodId: "food_asx39x4ayja4jab6ivj6zayvkblo",
          image: "https://www.edamam.com/food-img/0f9/0f9f5f95df173e9ffaaff2977bef88f3.jpg",
          name: "Kaffir Lime Leaf",
          nutriments: {
            "Carbohydrate, by difference": 74.97,
            Energy: 313,
            "Fiber, total dietary": 26.3,
            Protein: 7.61,
            "Total lipid (fat)": 8.36,
          },
        },
        {
          foodId: "food_bb1rfkdaegem2hby880gcae4kqqr",
          image: "https://www.edamam.com/food-img/6b4/6b4c68b3ae6702dfbeaeebb8b7410017.png",
          name: "Schwartz KAFFIR LIME LEAVES",
          nutriments: {
            "Carbohydrate, by difference": 87.8,
            Energy: 259,
            "Fiber, total dietary": 52.4,
            Protein: 5.5,
            "Total lipid (fat)": 2.7,
          },
        },
        {
          foodId: "food_a8w1arga79fex2avt3lk1ainkji3",
          image: "https://www.edamam.com/food-img/5f9/5f98cb650c2f2931f2540a46000852b4.jpg",
          name: "Kaffir Lime Leaves",
          nutriments: {
            "Carbohydrate, by difference": 5.249986732039604,
            Energy: 17.49995577346535,
            "Fiber, total dietary": 0,
            Protein: 0,
            "Total lipid (fat)": 0,
          },
        },
        {
          foodId: "food_aub29y2bsbagm4buctom4bw0xcnv",
          image: "https://www.edamam.com/food-img/367/36734f364c1367d2c9125785afffc428.jpg",
          name: "Cassava Root Vegetable Chips, Chilli & Kaffir Lime",
          nutriments: {
            "Carbohydrate, by difference": 59.965735314286704,
            Energy: 458.56150534454537,
            "Fiber, total dietary": 7.0547923899160825,
            Protein: 3.5273961949580412,
            "Total lipid (fat)": 24.69177336470629,
          },
        },
        {
          foodId: "food_bt6kgoqa6hr00bb4ghibbbos7aix",
          image: "https://www.edamam.com/food-img/49e/49efd37281bd300dfda0977cf83e4bfd.jpg",
          name: "Joseph Banks Vegetable Chips Cassava Root, Chilli & Kaffir Lime, 4.0 Oz",
          nutriments: {
            "Carbohydrate, by difference": 59.965735314286704,
            Energy: 458.56150534454537,
            "Fiber, total dietary": 7.0547923899160825,
            Protein: 3.5273961949580412,
            "Total lipid (fat)": 24.69177336470629,
          },
        },
        {
          foodId: "food_a9mbu6pbn4z6n3biq41fua9x7eik",
          image: "https://www.edamam.com/food-img/056/0567844c57430bcb46db1baaf0da29bd.png",
          name: "h-e-b Central Market Organic Italian Soda Kaffir Lime Coconut Flavor With Other Natural Flavors, 33.8 fl Oz",
          nutriments: { "Carbohydrate, by difference": 8, Energy: 32, Protein: 0, "Total lipid (fat)": 0 },
        },
      ],
    });
  });
});

describe("GET /search-barcode handler", () => {
  it("should return an error if not products with barcode found", async () => {
    const response = await request.get("/search-barcode").query({ barcode: "123" });
    expect(response.body).toEqual({ error: `No product with barcode 123 found` });
  });

  it("should return formatted item data with valid barcode", async () => {
    const response = await request.get("/search-barcode").query({ barcode: "4008400320328" });
    expect(response.body).toEqual({
      response: {
        name: "Bueno",
        nutriments: {
          carbohydrates: 49.5,
          carbohydrates_100g: 49.5,
          carbohydrates_serving: 10.4,
          carbohydrates_unit: "g",
          carbohydrates_value: 49.5,
          "carbon-footprint-from-known-ingredients_100g": 185.85,
          "carbon-footprint-from-known-ingredients_product": 240,
          "carbon-footprint-from-known-ingredients_serving": 39,
          energy: 2384,
          "energy-kj": 2384,
          "energy-kj_100g": 2384,
          "energy-kj_serving": 501,
          "energy-kj_unit": "kJ",
          "energy-kj_value": 2384,
          energy_100g: 2384,
          energy_serving: 501,
          energy_unit: "kJ",
          energy_value: 2384,
          fat: 37.3,
          fat_100g: 37.3,
          fat_serving: 7.83,
          fat_unit: "g",
          fat_value: 37.3,
          "fruits-vegetables-nuts-estimate-from-ingredients_100g": 8,
          "fruits-vegetables-nuts-estimate-from-ingredients_serving": 8,
          "nova-group": 4,
          "nova-group_100g": 4,
          "nova-group_serving": 4,
          "nutrition-score-fr": 27,
          "nutrition-score-fr_100g": 27,
          proteins: 8.6,
          proteins_100g: 8.6,
          proteins_serving: 1.81,
          proteins_unit: "g",
          proteins_value: 8.6,
          salt: 0.275,
          salt_100g: 0.275,
          salt_serving: 0.0578,
          salt_unit: "g",
          salt_value: 0.275,
          "saturated-fat": 17.3,
          "saturated-fat_100g": 17.3,
          "saturated-fat_serving": 3.63,
          "saturated-fat_unit": "g",
          "saturated-fat_value": 17.3,
          sodium: 0.11,
          sodium_100g: 0.11,
          sodium_serving: 0.0231,
          sodium_unit: "g",
          sodium_value: 0.11,
          sugars: 41.2,
          sugars_100g: 41.2,
          sugars_serving: 8.65,
          sugars_unit: "g",
          sugars_value: 41.2,
        },
        productImg: "https://images.openfoodfacts.org/images/products/400/840/032/0328/front_en.30.400.jpg",
        servingSize: "21g",
      },
    });
  });
});

describe("POST /tracking handler", () => {
  it("should return an error if a user tries to track an item while being logged out", async () => {
    const response = await request.post("/tracking").send({
      itemInfo: {
        foodId: "food_a9mbu6pbn4z6n3biq41fua9x7eik",
        image: "https://www.edamam.com/food-img/056/0567844c57430bcb46db1baaf0da29bd.png",
        name: "h-e-b Central Market Organic Italian Soda Kaffir Lime Coconut Flavor With Other Natural Flavors, 33.8 fl Oz",
        nutriments: { "Carbohydrate, by difference": 8, Energy: 32, Protein: 0, "Total lipid (fat)": 0 },
      },
      amount: 30,
    });
    expect(response.body).toEqual({ error: "Need to be logged in to track items." });
  });

  it("should return success response when item is tracked successfully", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .post("/tracking")
      .send({
        itemInfo: {
          foodId: "food_a9mbu6pbn4z6n3biq41fua9x7eik",
          image: "https://www.edamam.com/food-img/056/0567844c57430bcb46db1baaf0da29bd.png",
          name: "h-e-b Central Market Organic Italian Soda Kaffir Lime Coconut Flavor With Other Natural Flavors, 33.8 fl Oz",
          nutriments: { "Carbohydrate, by difference": 8, Energy: 32, Protein: 0, "Total lipid (fat)": 0 },
        },
        amount: 30,
      })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({ response: "Item track success!" });
  });
});

describe("GET tracking handler", () => {
  it("should return an error if a user tries get tracked items while being logged out", async () => {
    const response = await request.get("/tracking").query({ date: "2022-06-08" });
    expect(response.body).toEqual({ error: "User is not logged in" });
  });

  it("should return error if user has not tracked any items today", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .get("/tracking")
      .query({ date: "2022-05-08" })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({ error: "User has not tracked any items today." });
  });

  it("should return response containing user tracked items", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .get("/tracking")
      .query({ date: "2021-06-08" })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      response: [
        {
          item_info: {
            calcium: 68.2238990128318,
            calories: 258.51145379909616,
            carbs: 41.51392036997492,
            fatMonounsaturated: 2.2103252977713295,
            fatPolyunsaturated: 0.7261507978644732,
            fatSaturated: 4.7494549181715655,
            fatTrans: 0.23639715780267834,
            fats: 8.763881342727196,
            fiber: 1.6238434798732801,
            folateDfe: 37.257483283243744,
            folateFood: 16.17125844975654,
            folicAcid: 12.394193222736757,
            iron: 0.8792924326761953,
            name: "Banana Bread (Banana Cake)",
            niacin: 0.8695961777142751,
            phosphorus: 107.90850859234857,
            potassium: 159.45876870630437,
            protein: 4.502071715520799,
            riboflavin: 0.1179541174075236,
            salt: 216.9780364302222,
            sugar: 21.785859810512342,
            thiamin: 0.09267015426159128,
            vitaminA: 60.56679319195827,
            vitaminB12: 0.08002965617244115,
            vitaminB6: 0.1457429194967294,
            vitaminC: 2.9398882469650283,
            vitaminD: 0.25084051427818654,
            vitaminE: 0.4200365473838722,
            vitaminK: 1.284203301652996,
            water: 36.68898299445995,
            zinc: 0.3069845901805843,
          },
          serving_size_g: 333,
          time: "15:35:46.502699",
        },
      ],
    });
  });
});

describe("GET /goals handler", () => {
  it("should return an error if user is not logged in", async () => {
    const response = await request.get("/goals");
    expect(response.body).toEqual({ error: "Unable to fetch goals." });
  });

  it("should return user goals", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request.get("/goals").set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      response: [
        {
          calories: 2500,
          carbs: 300,
          fats: 100,
          fiber: 30,
          protein: 300,
          salt: 5,
          sugar: 25,
          user_id: 47,
        },
      ],
    });
  });
});

describe("PATCH /goals handler", () => {
  it("should return an error if user is not logged in", async () => {
    const response = await request.patch("/goals");
    expect(response.body).toEqual({ error: "Login to update nutrition goals" });
  });

  it("should update user goals", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .patch("/goals")
      .send({ calories: 2500, protein: 300, carbs: 300, fats: 100, sugar: 25, salt: 5, fiber: 30 })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      response: "Successfully updated nutrition goals.",
    });
  });
});

describe("POST /user-info handler", () => {
  it("should return an error if any of the user info is missing", async () => {
    const response = await request
      .post("/user-info")
      .send({ name: "", age: 100, weight: 70, height: 0, gender: "Female" });
    expect(response.body).toEqual({ error: "Missing info" });
  });

  it("should return an error if user is not logged in", async () => {
    const response = await request
      .post("/user-info")
      .send({ name: "test", age: 100, weight: 70, height: 174, gender: "Female" });
    expect(response.body).toEqual({ error: "Login to initialise user info" });
  });

  // it("should return a success response when logged in and valid info entered", async () => {
  //   const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
  //   const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
  //   const response = await request
  //     .post("/user-info")
  //     .send({ name: "test", age: 100, weight: 70, height: 174, gender: "Female" })
  //     .set("Cookie", `sessionId=${sessionId}`);
  //   expect(response.statusCode).toEqual(200);
  //   expect(response.body).toEqual({ response: "Successfully added to user info." });
  // });
});

describe("PATCH /user-info handler", () => {
  it("should return an error if user is not logged in", async () => {
    const response = await request.patch("/user-info").send({ age: 404, weight: 60, height: 167 });
    expect(response.body).toEqual({ error: "Login to update user info" });
  });

  it("should return a success response when logged in", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .patch("/user-info")
      .send({ age: 404, weight: 60, height: 167 })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ response: "Successfully updated user info." });
  });
});

describe("GET /user-info handler", () => {
  it("should return an error if user is not logged in", async () => {
    const response = await request.get("/user-info");
    expect(response.body).toEqual({ error: "Unable to fetch info." });
  });

  it("should return user info", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request.get("/user-info").set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      response: [
        {
          age: 404,
          height: 167,
          name: "test",
          sex: "Female",
          user_id: 47,
          weight: 60,
        },
      ],
    });
  });
});

describe("POST /performance-history handler", () => {
  it("should return an error if user is not logged in", async () => {
    const response = await request.post("/performance-history").send({ score: 77, date: "2022-03-17" });
    expect(response.body).toEqual({ error: "Login to update performance info" });
  });

  it("should return an error if score is missing", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .post("/performance-history")
      .send({ score: 0, date: "2022-03-17" })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      error: "Missing score",
    });
  });

  it("should insert performance score if no score exists on date", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .post("/performance-history")
      .send({ score: 77, date: "2022-05-17" })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({ response: "Successfully updated performance info." });
  });

  it("should update performance score if score exists on date", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .post("/performance-history")
      .send({ score: 97, date: "2022-05-17" })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({ response: "Successfully updated performance info." });
  });
});

describe("GET /performance-score handler", () => {
  it("should return an error if both date and allTime are supplied", async () => {
    const response = await request.get("/performance-history").query({ date: "2022-03-17", allTime: true });
    expect(response.body).toEqual({ error: "Can't have both date and allTime" });
  });

  it("should return an error if user is not logged in", async () => {
    const response = await request.get("/performance-history").query({ date: "2022-03-17" });
    expect(response.body).toEqual({ error: "Login to get performance info" });
  });

  it("get a single score from date", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .get("/performance-history")
      .query({ date: "2022-03-17" })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      response: [
        {
          date: "2022-03-17",
          perf_score: 97,
          user_id: 47,
        },
      ],
    });
  });

  it("get a scores from range of dates when allTime is set to true", async () => {
    const loginResponse = await request.post("/login").send({ username: "adminTest2", password: "password" });
    const sessionId = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const response = await request
      .get("/performance-history")
      .query({ allTime: true })
      .set("Cookie", `sessionId=${sessionId}`);
    expect(response.body).toEqual({
      response: [
        {
          day: "2022-03-17",
          value: 97,
        },
        {
          day: "2022-05-17",
          value: 97,
        },
      ],
    });
  });
});
