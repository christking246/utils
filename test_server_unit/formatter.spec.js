const { describe, expect, test } = require("@jest/globals");

const { formatMarkdownTable } = require("../services/Formatter");

describe("Formatter", () => {
    describe("formatMarkdownTable", () => {
        test("should format a basic markdown table with proper alignment", () => {
            const input = `| Name | Age | City |\n|-----|-----|----------|\n| John | 25 | New York |\n| Jane Smith | 30 | Los Angeles |\n| Bob | 35 | Chicago |`;
            const expectedOutput = "| Name       | Age | City        |\n|------------|-----|-------------|\n| John       | 25  | New York    |\n| Jane Smith | 30  | Los Angeles |\n| Bob        | 35  | Chicago     |";

            const result = formatMarkdownTable(input);

            expect(result.success).toBe(true);
            expect(result.table).toBe(expectedOutput);
        });

        test("should format a basic markdown table with table separator having spacing, with proper alignment", () => {
            const input = `| Name | Age | City |\n| --- | --- | -------- |\n| John | 25 | New York |\n| Jane Smith | 30 | Los Angeles |\n| Bob | 35 | Chicago |`;
            const expectedOutput = "| Name       | Age | City        |\n|------------|-----|-------------|\n| John       | 25  | New York    |\n| Jane Smith | 30  | Los Angeles |\n| Bob        | 35  | Chicago     |";

            const result = formatMarkdownTable(input);

            expect(result.success).toBe(true);
            expect(result.table).toBe(expectedOutput);
        });

        test("should format a markdown table with more than 1 separator row", () => {
            const input = `| Name | Age | City |\n| --- | --- | -------- |\n| John | 25 | New York |\n| Jane Smith | 30 | Los Angeles |\n| --- | --- | -------- |\n| Bob | 35 | Chicago |`;
            const expectedOutput = "| Name       | Age | City        |\n|------------|-----|-------------|\n| John       | 25  | New York    |\n| Jane Smith | 30  | Los Angeles |\n|------------|-----|-------------|\n| Bob        | 35  | Chicago     |";

            const result = formatMarkdownTable(input);

            expect(result.success).toBe(true);
            expect(result.table).toBe(expectedOutput);
        });

        test("should format a markdown table with empty cells", () => {
            const input = `| Name | Age | City |\n| --- | --- | -------- |\n| John | 25 | New York |\n| Jane Smith | | Los Angeles |\n| Bob | 35 | Chicago |`;
            const expectedOutput = "| Name       | Age | City        |\n|------------|-----|-------------|\n| John       | 25  | New York    |\n| Jane Smith |     | Los Angeles |\n| Bob        | 35  | Chicago     |";

            const result = formatMarkdownTable(input);

            expect(result.success).toBe(true);
            expect(result.table).toBe(expectedOutput);
        });

        test("should format a markdown table with missing cells", () => {
            const input = `| Name | Age | City |\n| --- | --- | -------- |\n| John | 25 | New York |\n| Jane Smith | | Los Angeles |\n| Bob | 35 |`;
            const expectedOutput = "| Name       | Age | City        |\n|------------|-----|-------------|\n| John       | 25  | New York    |\n| Jane Smith |     | Los Angeles |\n| Bob        | 35  |";

            const result = formatMarkdownTable(input);

            expect(result.success).toBe(true);
            expect(result.table).toBe(expectedOutput);
        });

        test.each([
            {
                input: "",
                expectedMsg: "Input must be a non-empty string"
            },
            {
                input: null,
                expectedMsg: "Input must be a non-empty string"
            },
            {
                input: "This is not a table",
                expectedMsg: "Input must contain at least a header and a separator row"
            },
            {
                input: "This | is | not | a | table",
                expectedMsg: "Input must contain at least a header and a separator row"
            }
        ])("should return an error for input that is not a table: %s", ({ input, expectedMsg}) => {
            const result = formatMarkdownTable(input);

            expect(result.success).toBe(false);
            expect(result.msg).toBe(expectedMsg);
        });
    });
});