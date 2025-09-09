const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("hash generator", () => {
    test("should return hashes for a given input text", async () => {
        // Act
        const response = await superTestRequest.post("/api/hash").send({ text: "Hello, World!" });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            hashes: {
                SHA1: "0a0a9f2a6772942557ab5355d76af442f8f65e01",
                SHA256: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
                SHA512: "374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6c" +
                        "c69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387",
                MD5: "65a8e27d8879283831b664bd8b7f0ad4"
            }
        });
    });

    test.each([
        null, undefined, 123, {}, [], ""
    ])("should return bad request when given text is not valid: %s", async (payloadText) => {
        // Act
        const response = await superTestRequest.post("/api/hash").send({ text: payloadText });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("invalid string provided");
    });
});