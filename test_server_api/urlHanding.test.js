const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("URL Handling", () => {
    describe("URL Encode", () => {
        test("should encode a simple URL successfully", async () => {
            // Arrange
            const testUrl = "https://example.com/path with spaces";

            // Act
            const response = await superTestRequest.post("/api/url/encode").send({ url: testUrl });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("encodedUrl");
            expect(response.body.encodedUrl).toBe("https%3A%2F%2Fexample.com%2Fpath%20with%20spaces");
        });

        test("should encode URLs with special characters", async () => {
            // Arrange
            const testUrl = "https://example.com/search?q=hello world&lang=en&special=@#$%";

            // Act
            const response = await superTestRequest.post("/api/url/encode").send({ url: testUrl });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("encodedUrl");
            expect(response.body.encodedUrl).toBe("https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26special%3D%40%23%24%25");
        });

        test.each([
            ["null", null],
            ["undefined", undefined],
            ["empty string", ""],
            ["number", 123],
            ["object", {}],
            ["array", []],
            ["boolean", true]
        ])("should return bad request when url is invalid: %s", async (description, invalidUrl) => {
            // Act
            const response = await superTestRequest.post("/api/url/encode").send({ url: invalidUrl });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("invalid url string provided");
        });
    });

    describe("URL Decode", () => {
        test("should decode an encoded URL successfully", async () => {
            // Arrange
            const encodedUrl = "https%3A%2F%2Fexample.com%2Fpath%20with%20spaces";

            // Act
            const response = await superTestRequest.post("/api/url/decode").send({ url: encodedUrl });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("decodedUrl");
            expect(response.body.decodedUrl).toBe("https://example.com/path with spaces");
        });

        test("should decode URLs with encoded special characters", async () => {
            // Arrange
            const encodedUrl = "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26special%3D%40%23%24%25";

            // Act
            const response = await superTestRequest.post("/api/url/decode").send({ url: encodedUrl });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("decodedUrl");
            expect(response.body.decodedUrl).toBe("https://example.com/search?q=hello world&lang=en&special=@#$%");
        });

        test.each([
            ["null", null],
            ["undefined", undefined],
            ["empty string", ""],
            ["number", 123],
            ["object", {}],
            ["array", []],
            ["boolean", false]
        ])("should return bad request when url is invalid: %s", async (description, invalidUrl) => {
            // Act
            const response = await superTestRequest.post("/api/url/decode").send({ url: invalidUrl });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("invalid url string provided");
        });
    });

    describe("URL Parse", () => {
        test("should parse a complete URL successfully", async () => {
            // Arrange
            const testUrl = "https://example.com:8080/path/to/resource?param1=value1&param2=value2#section";

            // Act
            const response = await superTestRequest.post("/api/url/parse").send({ url: testUrl });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                protocol: "https:",
                host: "example.com:8080",
                pathname: "/path/to/resource",
                searchParams: {
                    param1: "value1",
                    param2: "value2"
                },
                origin: "https://example.com:8080",
                port: "8080",
                hash: "#section"
            });
        });

        test.each([
            ["null", null],
            ["undefined", undefined],
            ["number", 123],
            ["object", {}],
            ["array", []],
            ["boolean", true]
        ])("should return bad request when url is invalid type: %s", async (description, invalidUrl) => {
            // Act
            const response = await superTestRequest.post("/api/url/parse").send({ url: invalidUrl });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("invalid url string provided");
        });
    });
});