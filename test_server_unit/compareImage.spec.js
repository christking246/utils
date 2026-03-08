const { describe, expect, test } = require("@jest/globals");
const { compareImage } = require("../services/CompareImage");
const { loadImage } = require("../utils");

describe("Compare image", () => {
    test("should return failure result if img1 not provided", async () => {
        const img1 = undefined;
        const img2 = loadImage("./test_server_unit/compare_img2.png");

        const { success, code, msg } = await compareImage(img1, img2);

        expect(success).toBe(false);
        expect(code).toBe(400);
        expect(msg).toBe("Image 1 not provided");
    });

    test("should return failure result if img2 not provided", async () => {
        const img1 = loadImage("./test_server_unit/compare_img1.png");
        const img2 = null;

        const { success, code, msg } = await compareImage(img1, img2);

        expect(success).toBe(false);
        expect(code).toBe(400);
        expect(msg).toBe("Image 2 not provided");
    });

    test("should return success result when no threshold provided", async () => {
        const img1 = loadImage("./test_server_unit/compare_img1.png");
        const img2 = loadImage("./test_server_unit/compare_img2.png");

        const { success, code, threshold, percent, imageDiff } = await compareImage(img1, img2);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(threshold).toBe(0.25);
        expect(imageDiff).toMatch(/^data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAACgAAAAUFCAYAAADb0ZqCAAF.+FTkSuQmCC$/);
        expect(percent).toBeGreaterThan(0);
    });

    test("should return success result when all params provided", async () => {
        const img1 = loadImage("./test_server_unit/compare_img1.png");
        const img2 = loadImage("./test_server_unit/compare_img2.png");

        const { success, code, threshold, percent, imageDiff } = await compareImage(img1, img2, 0.3);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(threshold).toBe(0.3);
        expect(imageDiff).toMatch(/^data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAACgAAAAUFCAYAAADb0ZqCAAF.+FTkSuQmCC$/);
        expect(percent).toBeGreaterThan(0);
    });

    test("should return 0 percent if image is identical", async () => {
        const img1 = loadImage("./test_server_unit/compare_img1.png");

        const { success, code, threshold, percent } = await compareImage(img1, img1, "0.1");

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(threshold).toBe(0.1);
        expect(percent).toEqual(0);
    });

    test("should return success when base64 string contains mime metadata", async () => {
        const img1 = "data:image/png;base64," + loadImage("./test_server_unit/compare_img1.png");

        const { success, code, threshold, percent } = await compareImage(img1, img1, "0.1");

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(threshold).toBe(0.1);
        expect(percent).toEqual(0);
    });

    test("should return success result when images are different sizes", async () => {
        const img1 = loadImage("./test_server_unit/compare_img1.png");
        const img2 = loadImage("./test_server_unit/compare_img_cropped.png");

        const { success, code, threshold, percent, imageDiff } = await compareImage(img1, img2, 0.3);

        expect(success).toBe(true);
        expect(code).toBe(200);
        expect(threshold).toBe(0.3);
        expect(imageDiff).toMatch(/^data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAB\/AAAAO6CAYAAACIRc.+AAAAAElFTkSuQmCC$/);
        expect(percent).toBeGreaterThan(0);
    });
});