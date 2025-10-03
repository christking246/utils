const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

const { isDefined } = require("../utils");

describe("jwt decoder", () => {
    test("should return payload and header for a given valid jwt token", async () => {
        // Act
        const response = await superTestRequest.post("/api/jwt/decode").send({
            token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZTE0MDU5NWRmMDQ0ZTc4NjhkOWVkNWVkN2NiMjc0IiwidHlwIjoiSldUIiwiZW52IjoicHJvZHVjdGlvbiJ9." +
            "eyJzdWIiOiI0YmUxODcwNC02MDZlLTQyZWYtOWUxYy0xZjcwMTEyNGNiN2EiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJUb21IYW5rcy0xNDcxIiwibmFtZSI6IlRvbSBIY" +
            "W5rcyIsImVtYWlsIjoiIiwidGlkIjoiOTE4ODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkIiwidGh1bWJuYWlsIjoiIiwicGljdHVyZSI6IiIsImxvY2FsZSI6I" +
            "mVuLXVzIiwic2hhcmluZ19pZCI6IjcwRTE3QTg0NTkwQzREQjgiLCJncm91cHMiOiIiLCJ2ZXIiOiIxLjAiLCJpbnN0cnVjdG9yIjoiVHJ1ZSIsIm9pZCI6IjAwMDAwMDAwLT" +
            "AwMDAtMDAwMC1iNDk0LTY3YTBkMDJlMzYwMiIsImNyZWRfaWQiOiIwMDAzN0ZGRTM5REM3NTgxIiwiY3JlZF91cG4iOiJ3d2x0ZXN0MTVAb3V0bG9vay5jb20iLCJjcmVkX3R" +
            "5cGUiOiJNU0EiLCJpZF90b2tlbl9lbWFpbCI6Ind3bHRlc3QxNUBvdXRsb29rLmNvbSIsImFjY2VwdGVkX3ByaXZhY3lfbm90aWNlIjoiMjAyNC0wNy0wNVQxOToyMzoyMS4w" +
            "MDU3MzU1KzAwOjAwIiwibmJmIjoxNzI0MjY5NzUwLCJleHAiOjE3MjQ4NzQ4NTAsImlzcyI6Imh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tIiwiYXVkIjoiZG9jcy5zZXJ2a" +
            "WNlcyJ9.Qmc4lG2Tsd9RHJcSv52wvkAxyEHjND0JZiIFspDDlNp820GjPc1JAheADUlNonCr2dAJXu8Wp-ycDV58_vNEgr8cbi4_dBUE2skXP-qZrG2Vpv1LE57VAkyvYXN0j" +
            "0wmKCVbigoVP8noWiE3KYP_534YWqpjzEP4ZhkC2U_oa3hT7-XB00bGvfK4lDc3spmX2YLqZiCmQf1okrkeJqV88w0XSVoOW4rQU2IclM91hSxwE2LHhaQQZcuTqNwvu86BLs" +
            "e6MbfZ_bdorFFeTCLxKPJdRaau1wCHS0tzI3gKD6bYYEhEOZ0GpxNFCNse_MG2BZfpWZ1y3k5IcL_FvseuhQ"
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