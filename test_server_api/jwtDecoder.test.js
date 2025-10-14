const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

const { isDefined } = require("../utils");

describe("jwt decoder", () => {
    test("should return payload and header for a given valid jwt token", async () => {
        // Act
        const response = await superTestRequest.post("/api/jwt/decode").send({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9." +
            "4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KE"
        });

        // Assert
        expect(response.status).toBe(200);
        expect(isDefined(response.body.payload)).toBe(true);
        expect(isDefined(response.body.header)).toBe(true);
    });

    test.each([
        null, undefined, "",
    ])("should return bad request when given token is not valid: %s", async (token) => {
        // Act
        const response = await superTestRequest.post("/api/jwt/decode").send({ token });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("invalid token string provided");
    });

    test("should return internal error when given token is not valid", async () => {
        // Act
        const response = await superTestRequest.post("/api/jwt/decode").send({ token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZTE" });

        // Assert
        expect(response.status).toBe(500);
        expect(response.body.msg).toContain("An error occurred trying decode the provided token");
    });
});