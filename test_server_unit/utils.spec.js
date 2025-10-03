const { describe, expect, test } = require("@jest/globals");

const { makeBool, isDefined, isValidString } = require("../utils");

describe("utils", () => {
    describe("makeBool", () => {
        test("returns true when given a boolean value", () => {
            expect(makeBool(true)).toBe(true);
            expect(makeBool(false)).toBe(false);
        });

        test.each([
            [{}], // Object
            [[]], // Object/Array
            [null], // Null
            [undefined], // undefined
        ])("returns false for non-boolean inputs that are not strings or numbers: '%s'", (input) => {
            expect(makeBool(input)).toBe(false);
        });

        test.each([
            { input: 0, expected: false },
            { input: 1, expected: true },
            { input: 2, expected: true },
        ])("converts numeric values to boolean based on their value '%s'", ({ input, expected }) => {
            expect(makeBool(input)).toBe(expected);
        });

        test.each([
            { input: "true", expected: true },
            { input: "True", expected: true },
            { input: "TRUE", expected: true },
            { input: "1", expected: true },
            { input: "yes", expected: true },
            { input: "Yes", expected: true },
            { input: "YES", expected: true },
            { input: "false", expected: false },
            { input: "l", expected: false },
        ])("converts strings to boolean based on their content: '%s'", ({ input, expected }) => {
            expect(makeBool(input)).toBe(expected);
        });
    });

    describe("isDefined", () => {
        test.each([
            { value: undefined, expected: false },
            { value: null, expected: false },
            { expected: false },
            { value: 0, expected: true },
            { value: 1, expected: true },
            { value: "", expected: true },
            { value: "a", expected: true },
            { value: {}, expected: true },
            { value: [], expected: true },
        ])("returns true if the input is defined and not null (false otherwise): '%s'", ({ value, expected }) => {
            expect(isDefined(value)).toBe(expected);
        });
    });

    describe("isValidString", () => {
        test.each([
            { value: undefined, expected: false },
            { value: null, expected: false },
            { expected: false },
            { value: 0, expected: false },
            { value: "", expected: false },
            { value: " ", expected: false },
            { value: {}, expected: false },
            { value: [], expected: false },
            { value: "a", expected: true },
            { value: "at", expected: true },
            { value: "at most", expected: true },
            { value: " at most ", expected: true },
        ])("returns true if the input is defined and not null and is a string and is not empty or whitespace (false otherwise): '%s'",
            ({ value, expected }) => {
                expect(isValidString(value)).toBe(expected);
        });
    });
});