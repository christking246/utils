const { describe, expect, test } = require("@jest/globals");
const { getDominantColors } = require("../services/Colors");
const { loadImage } = require("../utils");

describe("getDominantColors", () => {
    test.each([null, undefined])("should return failure result if image not provided", async (img) => {
        const numColors = 5;

        const { success, code, msg } = await getDominantColors(img, numColors);

        expect(success).toBe(false);
        expect(code).toBe(400);
        expect(msg).toBe("Image not provided");
    });

    test("should default to 5 colors if num colors not provided", async () => {
        const img = loadImage("./test_server_unit/dominant_img.png");

        const { success, code, colors } = await getDominantColors(img);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(colors).toBeDefined();
        expect(colors.length).toBe(5);
    });

    test("should succeed even when the image data contains mime metadata", async () => {
        const img = "data:image/png;base64," + loadImage("./test_server_unit/dominant_img.png");

        const { success, code, colors } = await getDominantColors(img);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(colors).toBeDefined();
        expect(colors.length).toBe(5);
    });

    test("should return the 5 dominant colors", async () => {
        const img = loadImage("./test_server_unit/dominant_img.png");

        const { success, code, colors } = await getDominantColors(img);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(colors).toBeDefined();
        expect(colors.length).toBe(5);
        expect(colors[0]).toEqual([34, 173, 75]);
        expect(colors[1]).toEqual([254, 241, 0]);
        expect(colors[2]).toEqual([161, 72, 162]);
        expect(colors[3]).toEqual([235, 28, 36]);
        expect(colors[4]).toEqual([0, 161, 231]);
    });

    test("should return 4 dominant colors", async () => {
        const img = loadImage("./test_server_unit/dominant_img.png");

        const { success, code, colors } = await getDominantColors(img, 4);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(colors).toBeDefined();
        expect(colors.length).toBe(4);
        console.log(colors);
        expect(colors[0]).toEqual([21, 169, 133]);
        expect(colors[1]).toEqual([161, 72, 162]);
        expect(colors[2]).toEqual([254, 241, 0]);
        expect(colors[3]).toEqual([234, 28, 36]);
    });
});