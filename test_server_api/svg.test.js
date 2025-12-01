const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("svg", () => {
    test("should return bad request when svg string provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/svg/optimize").send();

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("No valid svg string provided");
    });

    test("should return success when svg optimization successful", async () => {
        // Act
        const response = await superTestRequest.post("/api/svg/optimize").send({
            svgString: '<svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>'
        });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.optimizedSvg).toContain('<svg');
        expect(response.body.removedCharCount).toBeGreaterThan(0);
    });
});