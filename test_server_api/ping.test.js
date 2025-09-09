const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("ping", () => {
    test("ping", async () => {
        // Act
        const response = await superTestRequest.get("/api/ping");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.msg).toEqual("Pong");
    });
});