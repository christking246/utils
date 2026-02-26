const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../util_server.js");
const superTestRequest = supertest(server);

describe("formatter", () => {
    test("should return bad request when no string provided", async () => {
        // Act
        const response = await superTestRequest.post("/api/formatter/md-table").send();

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("invalid string provided for markdown table");
    });

    test("should return bad request when non md table string provided", async () => {
        // Act
        const response = await superTestRequest
            .post("/api/formatter/md-table")
            .send({ table: "This is not a table" });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.msg).toContain("Input must contain at least a header and a separator row");
    });

    test("should return success when markdown table is formatted successfully", async () => {
        // Act
        const response = await superTestRequest
            .post("/api/formatter/md-table")
            .send({ table: "| Name | Age | City |\n| --- | --- | --- |\n| John | 25 | New York |" });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.table).toContain("| Name | Age | City     |");
    });
});