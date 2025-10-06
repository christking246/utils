const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("Serializers", () => {
    describe("json to yml", () => {
        test.each([ null, undefined ])("should return bad request for no json provided", async (input) => {
            // Act
            const response = await superTestRequest.post("/api/serialize/json/yml").send({ json: input });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("No json provided")
        });

        test("should return Ok for successful json to yml conversion", async () => {
            // Act
            const response = await superTestRequest.post("/api/serialize/json/yml").send({ json: { key: "value" } });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.ymlString).toEqual("key: value\n");
        });
    });

    describe("yml to json", () => {
        test.each([ null, undefined ])("should return bad request for no yml string provided", async (input) => {
            // Act
            const response = await superTestRequest.post("/api/serialize/yml/json").send({ yml: input });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("No yml provided")
        });

        test("should return Ok for successful yml to json conversion", async () => {
            // Act
            const response = await superTestRequest.post("/api/serialize/yml/json").send({ yml: 'key: value\n' });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.json).toEqual({ key: "value" });
        });
    });
});