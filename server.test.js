const app = require("./server");
const supertest = require("supertest");
const request = supertest(app);
import test from "node:test";

it("gets the test endpoint", async () => {
  const response = await request.get("/test");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("pass!");
});
