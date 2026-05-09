const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

const { loadImage } = require("../utils");

describe("Compare Image", () => {
    test("should return bad request when image not provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/colors/extract").send({ numColors: 1 });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("Image not provided");
    });

    test("should return ok when image provided without num colors", async () => {
        // Act
        const response = await superTestRequest.post("/api/colors/extract").send({
            image: loadImage("./test_server_unit/dominant_img.png")
        });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.colors).toBeDefined();
        expect(response.body.colors.length).toBe(5);
    });

    test("should return ok when all parameters provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/colors/extract").send({
            image: loadImage("./test_server_unit/dominant_img.png"),
            numColors: 4
        });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.colors).toBeDefined();
        expect(response.body.colors.length).toBe(4);
    });
});