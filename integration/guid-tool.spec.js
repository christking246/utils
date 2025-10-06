// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("GUID Generator Tool", () => {
    test("test default behavior", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');

        // Wait for the GUID generator tool to be visible
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Verify default value in the count input is 5
        await expect(page.locator('#guid-count')).toHaveValue('5');

        // Click Generate GUIDs button
        await page.click('button:has-text("Generate GUIDs")');

        // Wait for the results to be visible
        await expect(page.locator('#guid-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#guid-error')).toBeHidden();

        // Verify that 5 GUIDs were generated (default count)
        await expect(page.locator('#guid-count-result')).toContainText('5');

        // Verify that the GUID list contains 5 items
        const guidItems = page.locator('#guid-list > div');
        await expect(guidItems).toHaveCount(5);
    });

    test("test with custom count", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Set custom count to 3
        await page.fill('#guid-count', '3');

        // Click Generate GUIDs button
        await page.click('button:has-text("Generate GUIDs")');

        // Wait for the results to be visible
        await expect(page.locator('#guid-results')).toBeVisible();

        // Verify that 3 GUIDs were generated
        await expect(page.locator('#guid-count-result')).toContainText('3');

        // Verify that the GUID list contains 3 items
        const guidItems = page.locator('#guid-list > div');
        await expect(guidItems).toHaveCount(3);
    });

    test("test with maximum count", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Set count to maximum (100)
        await page.fill('#guid-count', '100');

        // Click Generate GUIDs button
        await page.click('button:has-text("Generate GUIDs")');

        // Wait for the results to be visible
        await expect(page.locator('#guid-results')).toBeVisible();

        // Verify that 100 GUIDs were generated
        await expect(page.locator('#guid-count-result')).toContainText('100');

        // Verify that the GUID list contains 100 items
        const guidItems = page.locator('#guid-list > div');
        await expect(guidItems).toHaveCount(100);

        // Verify the scrollable container is present for large lists
        await expect(page.locator('#guid-list')).toHaveClass(/overflow-y-auto/);
    });

    test("test validation errors", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Test with invalid count (0)
        await page.fill('#guid-count', '0');
        await page.click('button:has-text("Generate GUIDs")');

        await expect(page.locator('#guid-error')).toBeVisible();
        await expect(page.locator('#guid-error-message')).toContainText('Please enter a valid number between 1 and 100');
        await expect(page.locator('#guid-results')).toBeHidden();

        // Test with count too high (101)
        await page.fill('#guid-count', '101');
        await page.click('button:has-text("Generate GUIDs")');

        await expect(page.locator('#guid-error')).toBeVisible();
        await expect(page.locator('#guid-error-message')).toContainText('Please enter a valid number between 1 and 100');
        await expect(page.locator('#guid-results')).toBeHidden();

        // Test with empty input
        await page.fill('#guid-count', '');
        await page.click('button:has-text("Generate GUIDs")');

        await expect(page.locator('#guid-error')).toBeVisible();
        await expect(page.locator('#guid-error-message')).toContainText('Please enter a valid number between 1 and 100');
        await expect(page.locator('#guid-results')).toBeHidden();

        // Test with negative number
        await page.fill('#guid-count', '-5');
        await page.click('button:has-text("Generate GUIDs")');

        await expect(page.locator('#guid-error')).toBeVisible();
        await expect(page.locator('#guid-error-message')).toContainText('Please enter a valid number between 1 and 100');
        await expect(page.locator('#guid-results')).toBeHidden();
    });

    test("test clear functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Generate some GUIDs first
        await page.fill('#guid-count', '3');
        await page.click('button:has-text("Generate GUIDs")');

        // Wait for results to be visible
        await expect(page.locator('#guid-results')).toBeVisible();
        await expect(page.locator('#guid-count-result')).toContainText('3');

        // Click Clear button
        const clearButton = page.locator("#clear-guid");
        await clearButton.click();

        // Verify results are hidden
        await expect(page.locator('#guid-results')).toBeHidden();

        // Verify error is hidden
        await expect(page.locator('#guid-error')).toBeHidden();

        // Verify count input is reset to default
        await expect(page.locator('#guid-count')).toHaveValue('5');
    });

    test("test copy functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Generate 2 GUIDs
        await page.fill('#guid-count', '2');
        await page.click('button:has-text("Generate GUIDs")');

        await expect(page.locator('#guid-results')).toBeVisible();

        // Verify that each GUID has a copy button
        const guidItems = page.locator('#guid-list > div');
        await expect(guidItems).toHaveCount(2);

        for (let i = 0; i < 2; i++) {
            await expect(guidItems.nth(i).locator('button:has-text("Copy")')).toBeVisible();
        }

        // Test clicking the first copy button (we can't test actual clipboard in Playwright easily,
        // but we can verify the button exists and is clickable)
        await guidItems.nth(0).locator('button:has-text("Copy")').click();

        // The copy action should not cause any visible errors
        await expect(page.locator('#guid-error')).toBeHidden();
    });

    test("test copy all GUIDs functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Generate 3 GUIDs
        await page.fill('#guid-count', '3');
        await page.click('button:has-text("Generate GUIDs")');

        await expect(page.locator('#guid-results')).toBeVisible();

        // Verify "Copy All" button is present
        await expect(page.locator('button:has-text("Copy All")')).toBeVisible();

        // Click "Copy All" button
        await page.click('button:has-text("Copy All")');

        // The copy action should not cause any visible errors
        await expect(page.locator('#guid-error')).toBeHidden();
    });

    test("test UI elements and labels", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the GUID Generator tool
        await page.click('[data-tool="guid-generator"]');
        await expect(page.locator('#guid-generator-tool')).toBeVisible();

        // Verify the tool description is displayed
        await expect(page.locator('#guid-generator-tool')).toContainText('Generate unique identifiers (GUIDs/UUIDs)');

        // Verify helper text is displayed
        await expect(page.locator('#guid-generator-tool')).toContainText('Generate between 1 and 100 GUIDs at once');

        // Verify all UI elements are present
        await expect(page.locator('h2:has-text("GUID Generator")')).toBeVisible();
        await expect(page.locator('label[for="guid-count"]')).toContainText('Number of GUIDs to Generate');
        await expect(page.locator('#guid-count')).toBeVisible();
        await expect(page.locator('button:has-text("Generate GUIDs")')).toBeVisible();
        const clearButton = page.locator("#clear-guid");
        await clearButton.click();

        // Verify input constraints
        await expect(page.locator('#guid-count')).toHaveAttribute('min', '1');
        await expect(page.locator('#guid-count')).toHaveAttribute('max', '100');
        await expect(page.locator('#guid-count')).toHaveAttribute('type', 'number');

        // Generate GUIDs to check result UI elements
        await page.click('button:has-text("Generate GUIDs")');
        await expect(page.locator('#guid-results')).toBeVisible();

        // Verify result section elements
        await expect(page.locator('text=Generated GUIDs')).toBeVisible();
        await expect(page.locator('#guid-count-result')).toBeVisible();
        await expect(page.locator('#guid-list')).toBeVisible();
        await expect(page.locator('button:has-text("Copy All")')).toBeVisible();

        // Verify GUID item structure
        const firstGuidItem = page.locator('#guid-list > div').first();
        await expect(firstGuidItem.locator('.font-mono')).toBeVisible(); // GUID text
        await expect(firstGuidItem.locator('text=GUID 1')).toBeVisible(); // GUID label
        await expect(firstGuidItem.locator('button:has-text("Copy")')).toBeVisible(); // Copy button
    });
});

