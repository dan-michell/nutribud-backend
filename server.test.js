const app = require("./server");
const supertest = require("supertest");
const request = supertest(app);

describe("register handler", () => {
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
      .send({ username: "adminTest2", password: "password", passwordConfirmation: "password" });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ response: "Successful registration" });
  });
});
