const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("time converter", () => {
    test.each([
        1609459200, 1609459200000, "2021-01-01T00:00:00.000Z", "2021-01-01T00:00:00.000",
        "Fri, 01 Jan 2021 00:00:00 GMT", "2024/03/28 12:00:00", "2024-03-28 12:00:00", "January 1, 2021"
    ])("should return success response and correct fields", async (input) => {
        // Act
        const response = await superTestRequest.post("/api/time/convert").send({ time: input });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("iso");
        expect(response.body).toHaveProperty("utc");
        expect(response.body).toHaveProperty("timestamp");

    });

    // Test cases for no input/invalid input
    test.each([
        ["time is null", null , "No time provided"],
        ["time is undefined", undefined, "No time provided"],
        ["invalid date string", "invalid date string", "Invalid date string"],
        ["empty string", "", "Time must be a valid number or string"],
        ["boolean input", true, "Time must be a valid number or string"],
        ["object input", {}, "Time must be a valid number or string"],
        ["array input", [], "Time must be a valid number or string"],
        ["NaN input", NaN, "Time must be a valid number or string"],
    ])("should return bad request when %s", async (description, input, expectedMsg) => {
        const response = await superTestRequest.post("/api/time/convert").send({ time: input });

        expect(response.status).toBe(400);
        expect(result.msg).toBe(expectedMsg);
    });
});