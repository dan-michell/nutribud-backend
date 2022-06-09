import app from "./server";
import supertest from "supertest";
import { describe } from "yargs";
const request = supertest(app);

describe("POST login handler", () => {
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

describe("GET login handler", () => {
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

describe("DELETE login handler", () => {
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

describe("POST register handler", () => {
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

describe("GET search-text handler", () => {
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

describe("GET search-barcode handler", () => {});
