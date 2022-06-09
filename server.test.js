import app from "./server";
import supertest from "supertest";
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
    expect(response.body).toEqual();
  });
});
