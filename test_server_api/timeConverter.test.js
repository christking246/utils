const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("time converter", () => {
    describe("convertTime", () => {
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
            ["NaN input", NaN, "No time provided"], // fun fact - NaN will stringify to null
        ])("should return bad request when %s", async (description, input, expectedMsg) => {
            const response = await superTestRequest.post("/api/time/convert").send({ time: input });

            expect(response.status).toBe(400);
            expect(response.body.msg).toContain(expectedMsg);
        });
    });

    describe("translateDuration", () => {
        test("should return bad request when value is not provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/time/translate").send({ unit: "minute" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toContain("No value provided");
        });

        test("should return bad request when unit is not provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/time/translate").send({ value: 1 });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toContain("No unit provided");
        });

        test("should return bad request when value nor unit is provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/time/translate").send();

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toContain("No value provided");
        });

        test("should return ok when all parameters are provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/time/translate").send({ value: 1, unit: "minute" });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("seconds");
            expect(response.body).toHaveProperty("minutes");
            expect(response.body).toHaveProperty("hours");
            expect(response.body).toHaveProperty("days");
        });
    });
});