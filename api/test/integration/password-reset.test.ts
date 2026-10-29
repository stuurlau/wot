import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";

import "./setup.js";
import type { FastifyInstance } from "fastify";
import { createTestApp, createTestUser, deleteTestUser, type TestUser } from "./helpers.js";
import { pool } from "../../src/db/client.js";
import { mailer, type Mail } from "../../src/lib/mailer.js";

describe("password reset by email code", () => {
  let app: FastifyInstance;
  let testUser: TestUser;
  const sent: Mail[] = [];

  before(async () => {
    mock.method(mailer, "send", async (mail: Mail) => {
      sent.push(mail);
    });
    app = await createTestApp();
    testUser = await createTestUser(app);
  });

  after(async () => {
    mock.restoreAll();
    await deleteTestUser(testUser.userId);
    await app.close();
    await pool.end();
  });

  const post = (url: string, payload: object) =>
    app.inject({ method: "POST", url: `/api/auth${url}`, payload });

  it("mails a code that resets the password", async () => {
    const req = await post("/email-otp/request-password-reset", { email: testUser.email });
    assert.equal(req.statusCode, 200, req.body);
    const mail = sent.at(-1);
    assert.equal(mail?.to, testUser.email);
    const otp = mail!.subject.match(/^\d{6}/)?.[0];
    assert.ok(otp, mail!.subject);

    const wrong = await post("/email-otp/reset-password", {
      email: testUser.email,
      otp: otp === "000000" ? "111111" : "000000",
      password: "new_password_456!",
    });
    assert.equal(wrong.statusCode, 400, wrong.body);

    const reset = await post("/email-otp/reset-password", {
      email: testUser.email,
      otp,
      password: "new_password_456!",
    });
    assert.equal(reset.statusCode, 200, reset.body);

    const oldLogin = await post("/sign-in/email", { email: testUser.email, password: "test_password_123!" });
    assert.equal(oldLogin.statusCode, 401, oldLogin.body);
    const newLogin = await post("/sign-in/email", { email: testUser.email, password: "new_password_456!" });
    assert.equal(newLogin.statusCode, 200, newLogin.body);
  });

  it("does not reveal or create accounts for unknown emails", async () => {
    const before = sent.length;
    const req = await post("/email-otp/request-password-reset", { email: "nobody-here@wot.test" });
    assert.equal(req.statusCode, 200, req.body);
    assert.equal(sent.length, before);
  });
});
