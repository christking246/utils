// @ts-check
import { test, expect } from "@playwright/test";
import { pageSetup } from "./setup";

test.describe("Extract Dominant Colors Tool", () => {
    test("tool interface loads and displays correctly", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="dominant-colors"]');

        // Tool description
        await expect(page.locator('#dominant-colors-tool')).toContainText('Dominant Color Extractor');

        // Upload area
        await expect(page.locator('#dominant-colors-drop-zone')).toBeVisible();
        await expect(page.locator('#dominant-colors-upload-content')).toBeVisible();

        // Extract button
        await expect(page.locator('#extract-dominant-colors-btn')).toBeDisabled();
        await expect(page.locator('#extract-dominant-colors-btn')).toContainText('Extract Dominant Colors');

        // Results section hidden
        await expect(page.locator('#dominant-colors-results')).toBeHidden();
    });

    test("image upload enables extract button", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="dominant-colors"]');

        // Upload image
        const fileInput = page.locator('#dominant-colors-file');
        await fileInput.setInputFiles("./base64_test_img.png");

        // Preview and info
        await expect(page.locator('#dominant-colors-image-preview')).toBeVisible();
        await expect(page.locator('#dominant-colors-upload-content')).toBeHidden();
        await expect(page.locator('#dominant-colors-image-info')).toContainText('base64_test_img.png');

        // Button enabled
        await expect(page.locator('#extract-dominant-colors-btn')).toBeEnabled();
        await expect(page.locator('#extract-dominant-colors-btn')).toContainText('Extract Dominant Colors');
    });

    test("extract colors from uploaded image", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="dominant-colors"]');

        // Upload image
        const fileInput = page.locator('#dominant-colors-file');
        await fileInput.setInputFiles("./base64_test_img.png");
        await expect(page.locator('#extract-dominant-colors-btn')).toBeEnabled();
        await page.locator('#extract-dominant-colors-btn').click();

        // Wait for results
        await expect(page.locator('#dominant-colors-results')).toBeVisible();
        await expect(page.locator('#dominant-colors-swatches')).toBeVisible();
        await expect(page.locator('#dominant-colors-values')).toBeVisible();
        await expect(page.locator('#dominant-colors-swatches > div')).toHaveCount(5);
    });

    test("clear image resets tool", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="dominant-colors"]');

        const fileInput = page.locator('#dominant-colors-file');
        await fileInput.setInputFiles("./base64_test_img.png");
        await expect(page.locator('#dominant-colors-image-preview')).toBeVisible();

        await page.click('#dominant-colors-image-preview button:has-text("Remove")');
        await expect(page.locator('#dominant-colors-image-preview')).toBeHidden();
        await expect(page.locator('#dominant-colors-upload-content')).toBeVisible();
        await expect(page.locator('#extract-dominant-colors-btn')).toBeDisabled();
        await expect(page.locator('#extract-dominant-colors-btn')).toContainText('Extract Dominant Colors');
    });
});
