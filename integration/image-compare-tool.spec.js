// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("Image Compare Tool", () => {
    test("image compare tool interface", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Verify the tool description is displayed
        await expect(page.locator('#image-compare-tool')).toContainText('Compare two images to find differences');

        // Verify upload areas are visible
        await expect(page.locator('#drop-zone-1')).toBeVisible();
        await expect(page.locator('#drop-zone-2')).toBeVisible();
        await expect(page.locator('#upload-content-1')).toBeVisible();
        await expect(page.locator('#upload-content-2')).toBeVisible();

        // Verify threshold slider is present
        await expect(page.locator('#threshold-slider')).toBeVisible();
        await expect(page.locator('#threshold-value')).toBeVisible();
        await expect(page.locator('#threshold-value')).toContainText('0.25');

        // Verify resize toggle is present and enabled by default
        await expect(page.locator('#resize-toggle')).toBeVisible();
        await expect(page.locator('#resize-toggle-input')).toBeChecked();

        // Verify compare button is disabled by default
        await expect(page.locator('#compare-btn')).toBeDisabled();
        await expect(page.locator('#compare-btn-text')).toContainText('Upload Both Images to Compare');

        // Verify error and results sections are hidden by default
        await expect(page.locator('#compare-error')).toBeHidden();
        await expect(page.locator('#comparison-results')).toBeHidden();
    });

    test("threshold slider functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Test threshold slider
        const thresholdSlider = page.locator('#threshold-slider');
        const thresholdValue = page.locator('#threshold-value');

        // Verify default value
        await expect(thresholdValue).toContainText('0.25');

        // Change slider to 0.5
        await thresholdSlider.fill('0.5');
        await expect(thresholdValue).toContainText('0.5');

        // Change slider to 0.8
        await thresholdSlider.fill('0.8');
        await expect(thresholdValue).toContainText('0.8');

        // Change slider to 0.1
        await thresholdSlider.fill('0.1');
        await expect(thresholdValue).toContainText('0.1');
    });

    test("single image upload updates button text", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Upload first image
        const fileInput1 = page.locator('#file-input-1');
        await fileInput1.setInputFiles("./base64_test_img.png");

        // Verify first image preview is shown
        await expect(page.locator('#image-preview-1')).toBeVisible();
        await expect(page.locator('#upload-content-1')).toBeHidden();
        await expect(page.locator('#image-1-info')).toContainText('base64_test_img.png');

        // Verify button text updates
        await expect(page.locator('#compare-btn-text')).toContainText('Upload Second Image');
        await expect(page.locator('#compare-btn')).toBeDisabled();

        // Upload second image
        const fileInput2 = page.locator('#file-input-2');
        await fileInput2.setInputFiles("./base64_test_img.png");

        // Verify second image preview is shown
        await expect(page.locator('#image-preview-2')).toBeVisible();
        await expect(page.locator('#upload-content-2')).toBeHidden();
        await expect(page.locator('#image-2-info')).toContainText('base64_test_img.png');

        // Verify button is now enabled
        await expect(page.locator('#compare-btn-text')).toContainText('Compare Images');
        await expect(page.locator('#compare-btn')).toBeEnabled();
    });

    test("clear image functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Upload first image
        const fileInput1 = page.locator('#file-input-1');
        await fileInput1.setInputFiles("./base64_test_img.png");

        // Verify image is uploaded and preview is shown
        await expect(page.locator('#image-preview-1')).toBeVisible();
        await expect(page.locator('#upload-content-1')).toBeHidden();

        // Click remove button
        await page.click('#image-preview-1 button:has-text("Remove")');

        // Verify image is cleared
        await expect(page.locator('#image-preview-1')).toBeHidden();
        await expect(page.locator('#upload-content-1')).toBeVisible();

        // Verify button text resets
        await expect(page.locator('#compare-btn-text')).toContainText('Upload Both Images to Compare');
        await expect(page.locator('#compare-btn')).toBeDisabled();
    });

    test("image comparison with identical images", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Upload same image to both slots
        const fileInput1 = page.locator('#file-input-1');
        const fileInput2 = page.locator('#file-input-2');
        await fileInput1.setInputFiles("./base64_test_img.png");
        await fileInput2.setInputFiles("./base64_test_img.png");

        // Verify both images are uploaded
        await expect(page.locator('#image-preview-1')).toBeVisible();
        await expect(page.locator('#image-preview-2')).toBeVisible();
        await expect(page.locator('#compare-btn')).toBeEnabled();

        const compareButton = page.locator('#compare-btn-text');
        await expect(compareButton).toContainText('Compare Images');

        compareButton.click();

        const diffPercent = page.locator('#difference-percent');
        await expect(diffPercent).toContainText('0.000%');
    });

    test("reset comparison functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Upload images
        const fileInput1 = page.locator('#file-input-1');
        const fileInput2 = page.locator('#file-input-2');
        await fileInput1.setInputFiles("./base64_test_img.png");
        await fileInput2.setInputFiles("./base64_test_img.png");

        // Verify images are uploaded
        await expect(page.locator('#image-preview-1')).toBeVisible();
        await expect(page.locator('#image-preview-2')).toBeVisible();

        // Verify compare button is enabled
        const compareButton = page.locator('#compare-btn-text');
        await expect(compareButton).toContainText('Compare Images');

        await page.locator('#compare-btn').click();
        await page.locator('#reset-button').click();

        // Verify images are cleared
        await expect(page.locator('#image-preview-1')).toBeHidden();
        await expect(page.locator('#image-preview-2')).toBeHidden();
        await expect(page.locator('#upload-content-1')).toBeVisible();
        await expect(page.locator('#upload-content-2')).toBeVisible();

        // Verify resize toggle is reset to enabled
        await expect(page.locator('#resize-toggle-input')).toBeChecked();
    });

    test("resize toggle state in reset functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Image Compare tool
        await page.click('[data-tool="image-compare"]');

        // Upload images
        const fileInput1 = page.locator('#file-input-1');
        const fileInput2 = page.locator('#file-input-2');
        await fileInput1.setInputFiles("./base64_test_img.png");
        await fileInput2.setInputFiles("./base64_test_img.png");

        // Change resize toggle to disabled
        const resizeToggleInput = page.locator('#resize-toggle-input');
        const resizeToggle = page.locator('#resize-toggle');
        await resizeToggle.click();
        await expect(resizeToggleInput).not.toBeChecked();

        // Change threshold slider
        const thresholdSlider = page.locator('#threshold-slider');
        await thresholdSlider.fill('0.8');

        await page.locator('#compare-btn').click();
        await page.locator('#reset-button').click();

        // Verify both resize toggle and threshold are reset to defaults
        await expect(resizeToggleInput).toBeChecked();
        await expect(page.locator('#threshold-value')).toContainText('0.25');
    });
});