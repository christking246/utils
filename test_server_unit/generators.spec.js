const { describe, expect, test } = require("@jest/globals");

const { generateId } = require("../services/Generators");

describe("Generators", () => {
    describe("generateId", () => {
        test("should generate a unique id in the expected format", () => {
            const format = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

            const id1 = generateId();
            const id2 = generateId();

            expect(id1).toMatch(format);
            expect(id2).toMatch(format);
            expect(id1 !== id2).toBeTruthy();
        });
    })
});