// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("Base64 Encoder Tool", () => {
    test("base64 text encoding", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');

        // Wait for the tool to be visible
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Verify the tool description is displayed
        await expect(page.locator('#base64-encoder-tool')).toContainText('Encode and decode text and images to/from Base64 format');

        // Verify Text tab is active by default
        await expect(page.locator('#text-tab')).toHaveClass(/text-sky-400/);
        await expect(page.locator('#text-base64')).toBeVisible();

        // Enter test text
        const testText = "Hello, World! This is a test string...";
        await page.fill('#text-input', testText);

        // Click Encode to Base64 button
        await page.click('button:has-text("Encode to Base64")');

        // Verify the output contains the expected Base64
        const encodedOutput = await page.locator('#base64-output').inputValue();
        expect(encodedOutput).toBe("SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgdGVzdCBzdHJpbmcuLi4=");

        // Verify no error is shown
        await expect(page.locator('#text-base64-error')).toBeHidden();
    });

    test("base64 text decoding", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Test decoding
        const testText = "Hello, World! This is a test string...";
        const encodedText = "SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgdGVzdCBzdHJpbmcuLi4=";

        await page.fill('#text-input', encodedText);

        // Click Decode from Base64 button
        await page.click('button:has-text("Decode from Base64")');

        // Verify the output contains the expected decoded text
        const decodedOutput = await page.locator('#base64-output').inputValue();
        expect(decodedOutput).toBe(testText);

        // Verify no error is shown
        await expect(page.locator('#text-base64-error')).toBeHidden();
    });

    test("base64 tab switching", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Verify Text tab is active by default
        await expect(page.locator('#text-tab')).toHaveClass(/text-sky-400/);
        await expect(page.locator('#text-base64')).toBeVisible();
        await expect(page.locator('#image-base64')).toBeHidden();

        // Click Image tab
        await page.click('#image-tab');

        // Verify Image tab is now active
        await expect(page.locator('#image-tab')).toHaveClass(/text-sky-400/);
        await expect(page.locator('#image-base64')).toBeVisible();
        await expect(page.locator('#text-base64')).toBeHidden();

        // Switch back to Text tab
        await page.click('#text-tab');

        // Verify Text tab is active again
        await expect(page.locator('#text-tab')).toHaveClass(/text-sky-400/);
        await expect(page.locator('#text-base64')).toBeVisible();
        await expect(page.locator('#image-base64')).toBeHidden();
    });

    test("base64 text clear functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Fill in test data and encode to populate the output field
        await page.fill('#text-input', 'Test data to be cleared');
        await page.locator('#text-base64').locator('button:has-text("Encode to Base64")').click();

        // Verify output field is populated
        const outputValue = await page.locator('#base64-output').inputValue();
        expect(outputValue).not.toBe('');

        // Click Clear button
        await page.locator('#text-base64').locator('button:has-text("Clear")').click();

        // Verify both fields are cleared
        expect(await page.locator('#text-input').inputValue()).toBe('');
        expect(await page.locator('#base64-output').inputValue()).toBe('');

        // Verify error is hidden
        await expect(page.locator('#text-base64-error')).toBeHidden();
    });

    test("base64 text encoding error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Try to encode empty text
        await page.fill('#text-input', '');
        await page.click('button:has-text("Encode to Base64")');

        // Verify error is shown
        await expect(page.locator('#text-base64-error')).toBeVisible();
        await expect(page.locator('#text-base64-error-message')).toContainText('Please enter some text to encode');
    });

    test("base64 text decoding error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Try to decode invalid Base64
        await page.fill('#text-input', 'Invalid@Base64!!!');
        await page.click('button:has-text("Decode from Base64")');

        // Verify error is shown
        await expect(page.locator('#text-base64-error')).toBeVisible();
        await expect(page.locator('#text-base64-error-message')).toContainText('Invalid Base64 format or failed to decode');
    });

    test("base64 unicode text handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Test with Unicode characters
        const unicodeText = "Hello 世界! Café ñoño 🌟🎉";
        await page.fill('#text-input', unicodeText);

        // Encode
        await page.click('button:has-text("Encode to Base64")');
        const encodedOutput = await page.locator('#base64-output').inputValue();
        expect(encodedOutput).toBe("SGVsbG8g5LiW55WMISBDYWbDqSDDsW/DsW8g8J+Mn/Cfjok=");

        // Clear and decode back
        await page.fill('#text-input', encodedOutput);
        await page.click('button:has-text("Decode from Base64")');

        // Verify the decoded text matches original
        const decodedOutput = await page.locator('#base64-output').inputValue();
        expect(decodedOutput).toBe(unicodeText);
    });

    test("base64 image tab interface", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Switch to Image tab
        await page.click('#image-tab');
        await expect(page.locator('#image-base64')).toBeVisible();

        // Verify image interface elements are present
        await expect(page.locator('#image-input')).toBeVisible();
        await expect(page.locator('#image-base64-input')).toBeVisible();
        await expect(page.locator('#image-base64').locator('button:has-text("Encode to Base64")')).toBeVisible();
        await expect(page.locator('#image-base64').locator('button:has-text("Decode from Base64")')).toBeVisible();
        await expect(page.locator('#image-base64').locator('button:has-text("Clear")')).toBeVisible();

        // Verify preview and decoded image displays are hidden initially
        await expect(page.locator('#image-preview')).toBeHidden();
        await expect(page.locator('#decoded-image-display')).toBeHidden();
    });

    test("base64 image clear functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool and switch to Image tab
        await page.click('[data-tool="base64-encoder"]');
        await page.click('#image-tab');
        await expect(page.locator('#image-base64')).toBeVisible();

        // Fill in some test data
        await page.fill('#image-base64-input', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');

        // Click Clear button in image section
        await page.locator('#image-base64').locator('button:has-text("Clear")').click();

        // Verify field is cleared
        expect(await page.locator('#image-base64-input').inputValue()).toBe('');

        // Verify error is hidden
        await expect(page.locator('#image-base64-error')).toBeHidden();
    });

    test("base64 image decoding error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool and switch to Image tab
        await page.click('[data-tool="base64-encoder"]');
        await page.click('#image-tab');
        await expect(page.locator('#image-base64')).toBeVisible();

        // Try to decode invalid Base64 image data
        await page.fill('#image-base64-input', 'Invalid@Image@Base64!!!');
        await page.locator('#image-base64').locator('button:has-text("Decode from Base64")').click();

        // Verify error is shown
        await expect(page.locator('#image-base64-error')).toBeVisible();
        await expect(page.locator('#image-base64-error-message')).toContainText('Failed to decode image');
    });

    test("encode image to base64", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Switch to Image tab
        await page.click('#image-tab');
        await expect(page.locator('#image-base64')).toBeVisible();

        const imageInput = page.locator('#image-input');
        await imageInput.setInputFiles("./base64_test_img.png");
        await expect(page.locator('#image-preview')).toBeVisible();

        // Click Encode to Base64 button
        await page.locator('#image-base64').locator('button:has-text("Encode to Base64")').click();

        // Starts with the expected base64 header
        await expect(page.locator('#image-base64-input'))
            .toHaveValue(/^iVBORw0KGgoAAAANSUhEUgAACc0AAAUbCAYAAAD2rhp5AAAgAElEQVR4XuzdeaBkRX0v8BoQ2WYYh22YkUUGBtkVWTQRAUlQ4ooYVOIeQSQq6AsakhBZx/);

        // Verify no error is shown
        await expect(page.locator('#image-base64-error')).toBeHidden();
    });

    test("decode image from base64", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Base64 Encoder tool
        await page.click('[data-tool="base64-encoder"]');
        await expect(page.locator('#base64-encoder-tool')).toBeVisible();

        // Switch to Image tab
        await page.click('#image-tab');
        await expect(page.locator('#image-base64')).toBeVisible();

        // Use a valid small PNG image base64 string for testing
        const validImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

        // Enter the Base64 string in the input field
        await page.fill('#image-base64-input', validImageBase64);

        // Click Decode from Base64 button
        await page.locator('#image-base64').locator('button:has-text("Decode from Base64")').click();

        // Wait for the decoded image display to be visible
        await expect(page.locator('#decoded-image-display')).toBeVisible();

        // Verify the decoded image has the correct src attribute (data URL with base64)
        const imgSrc = await page.locator('#decoded-image-display img').getAttribute('src');
        expect(imgSrc).toBeDefined();
        expect(imgSrc).toMatch(/^data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8\/5\+hHgAHggJ\/PchI7wAAAABJRU5ErkJggg==$/);

        // Verify no error is shown
        await expect(page.locator('#image-base64-error')).toBeHidden();
    });
});