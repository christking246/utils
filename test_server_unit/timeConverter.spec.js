const { describe, expect, test } = require("@jest/globals");

const { convertTime, translateDuration } = require("../services/TimeConverter");

describe("time converter", () => {
    describe("convertTime", () => {

        // Test cases for no input/invalid input
        test.each([
            ["time is null", null , "No time provided"],
            ["time is undefined", undefined, "No time provided"],
            ["invalid date string", "invalid date string", "Invalid date string"],
            ["empty string", "", "Time must be a valid number or string"],
            ["boolean input", true, "Time must be a valid number or string"],
            ["object input", {}, "Time must be a valid number or string"],
            ["array input", [], "Time must be a valid number or string"],
            ["NaN input", NaN, "Time must be a valid number or string"],
        ])("should return error when %s", (description, input, expectedMsg) => {
            const result = convertTime({ time: input });

            expect(result.success).toBe(false);
            expect(result.msg).toBe(expectedMsg);
        });

        // Test cases for Unix timestamp
        test.each([
            [
                "Unix timestamp in seconds",
                1609459200, // January 1, 2021 00:00:00 UTC
                "2021-01-01T00:00:00.000Z",
                "Fri, 01 Jan 2021 00:00:00 GMT",
                1609459200000
            ],
            [
                "Unix timestamp in milliseconds",
                1609459200000, // January 1, 2021 00:00:00 UTC
                "2021-01-01T00:00:00.000Z",
                "Fri, 01 Jan 2021 00:00:00 GMT",
                1609459200000
            ],
            [
                "Unix timestamp in seconds",
                "1609459200", // January 1, 2021 00:00:00 UTC
                "2021-01-01T00:00:00.000Z",
                "Fri, 01 Jan 2021 00:00:00 GMT",
                1609459200000
            ],
            [
                "Unix timestamp in milliseconds",
                "1609459200000", // January 1, 2021 00:00:00 UTC
                "2021-01-01T00:00:00.000Z",
                "Fri, 01 Jan 2021 00:00:00 GMT",
                1609459200000
            ]
        ])("should convert %s", (description, input, expectedIso, expectedUtc, expectedTimestamp) => {
            const result = convertTime({ time: input });

            expect(result.success).toBe(true);
            expect(result.iso).toBe(expectedIso);
            expect(result.utc).toBe(expectedUtc);
            expect(result.timestamp).toBe(expectedTimestamp);
        });

        // Test cases for string dates
        test.each([
            [ "ISO string date", "2021-01-01T00:00:00.000Z", "2021-01-01T00:00:00.000Z", "Fri, 01 Jan 2021 00:00:00 GMT", 1609459200000 ],
            [ "ISO string date without Z", "2021-01-01T00:00:00.000", "2021-01-01T00:00:00.000Z", "Fri, 01 Jan 2021 00:00:00 GMT", 1609459200000 ],
            [ "RFC 2822 date string", "Fri, 01 Jan 2021 00:00:00 GMT", "2021-01-01T00:00:00.000Z", "Fri, 01 Jan 2021 00:00:00 GMT", 1609459200000 ],
            [ "date string with slashes", "2024/03/28 12:00:00", "2024-03-28T12:00:00.000Z", "Thu, 28 Mar 2024 12:00:00 GMT", 1711627200000 ],
            [ "date string with dashes", "2024-03-28 12:00:00", "2024-03-28T12:00:00.000Z", "Thu, 28 Mar 2024 12:00:00 GMT", 1711627200000 ],
            [ "human readable date string", "January 1, 2021", "2021-01-01T00:00:00.000Z", "Fri, 01 Jan 2021 00:00:00 GMT", 1609459200000 ]
        ])("should convert %s", (description, input, expectedIso, expectedUtc, expectedTimestamp) => {
            const result = convertTime({ time: input });

            expect(result.success).toBe(true);
            expect(result.iso).toBe(expectedIso);
            expect(result.utc).toBe(expectedUtc);
            expect(result.timestamp).toBe(expectedTimestamp);
        });

        // Test cases for edge cases
        test.each([
            [ "Unix epoch (0)", 0, "1970-01-01T00:00:00.000Z", "Thu, 01 Jan 1970 00:00:00 GMT", 0 ],
            [ "very large timestamps", 4102444800000, "2100-01-01T00:00:00.000Z", "Fri, 01 Jan 2100 00:00:00 GMT", 4102444800000 ]
        ])("should handle %s", (description, input, expectedIso, expectedUtc, expectedTimestamp) => {
            const result = convertTime({ time: input });

            expect(result.success).toBe(true);
            expect(result.iso).toBe(expectedIso);
            expect(result.utc).toBe(expectedUtc);
            expect(result.timestamp).toBe(expectedTimestamp);
        });
    });

    describe("translateDuration", () => {
        // Test cases for no input/invalid input
        test.each([
            ["value is null", null, "second", "No value provided"],
            ["value is undefined", undefined, "second", "No value provided"],
            ["unit is null", 1, null, "No unit provided"],
            ["unit is undefined", 1, undefined, "No unit provided"],
            ["invalid unit", 1, "invalid unit", "Invalid unit provided"],
            ["empty string", 1, "", "Unit must be a string"],
            ["invalid unit", 1, "invalid unit", "Invalid unit provided"],
        ])("should return error when %s", (description, value, unit, expectedMsg) => {
            const result = translateDuration({ value: value, unit: unit });
            expect(result.success).toBe(false);
            expect(result.msg).toBe(expectedMsg);
        });

        // Test cases for valid input
        test.each([
            [ "1 minute", 1, "minute", 60 ],
            [ "2 hours", 2, "hour", 7200 ],
            [ "1 day", 1, "day", 86400 ],
            [ "90 seconds", 90, "second", 90 ],
            [ "1.5 minutes", 1.5, "minute", 90 ]
        ])("should convert %s", (description, value, unit, expectedSeconds) => {
            const result = translateDuration({ value: value, unit: unit });

            expect(result.success).toBe(true);
            expect(result.seconds).toBe(expectedSeconds);
            expect(result.minutes).toBe(expectedSeconds / 60);
            expect(result.hours).toBe(expectedSeconds / 3600);
            expect(result.days).toBe(expectedSeconds / 86400);
        });
    });
});