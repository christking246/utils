const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

const { loadImage } = require("../utils");

jest.setTimeout(60000); // not sure why the comparison takes so long in the tests

describe("Compare Image", () => {
    test("should return bad request when img1 not provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/image/diff").send({
            img2: loadImage("./test_server_unit/compare_img2.png")
        });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("Image 1 not provided");
    });

    test("should return bad request when img2 not provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/image/diff").send({
            img1: loadImage("./test_server_unit/compare_img1.png")
        });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("Image 2 not provided");
    });

    test("should return ok when img1 amd img2 provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/image/diff").send({
            img1: loadImage("./test_server_unit/compare_img1.png"),
            img2: loadImage("./test_server_unit/compare_img2.png")
        });

        // Assert
        expect(response.status).toBe(200);
    });

    test("should return ok when parameters provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/image/diff").send({
            img1: loadImage("./test_server_unit/compare_img1.png"),
            img2: loadImage("./test_server_unit/compare_img2.png"),
            threshold: 0.4
        });

        // Assert
        expect(response.status).toBe(200);
    });
});