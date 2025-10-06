const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("cron", () => {
    test("should return bad request when no cron expression provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/cron/describe").send();

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("No cron expression provided");
    });

    test("should return success when cron description successful", async () => {
        // Act
        const response = await superTestRequest.post("/api/cron/describe").send({ expression: "*/15 * * * *"});

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.description).toContain("Every 15 minutes, every hour, every day");
    });
});