// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("CRON Parser Tool", () => {
    test("test basic functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the CRON Parser tool
        await page.click('[data-tool="cron-parser"]');

        // Wait for the CRON parser tool to be visible
        await expect(page.locator('#cron-parser-tool')).toBeVisible();

        // Enter a basic CRON expression
        await page.fill('#cron-input', '0 9 * * MON-FRI');

        // Click Parse Expression button
        await page.click('button:has-text("Parse Expression")');

        // Wait for the results to be visible
        await expect(page.locator('#cron-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#cron-error')).toBeHidden();

        // Verify the description is populated
        await expect(page.locator('#cron-description')).not.toBeEmpty();

        // Verify the expression breakdown is displayed
        await expect(page.locator('#cron-minute')).toContainText('0');
        await expect(page.locator('#cron-hour')).toContainText('9');
        await expect(page.locator('#cron-day')).toContainText('*');
        await expect(page.locator('#cron-month')).toContainText('*');
        await expect(page.locator('#cron-dow')).toContainText('MON-FRI');
        await expect(page.locator('#cron-second')).toContainText('-'); // No seconds specified
    });

    test("test with seconds", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the CRON Parser tool
        await page.click('[data-tool="cron-parser"]');
        await expect(page.locator('#cron-parser-tool')).toBeVisible();

        // Enter a 6-field CRON expression (with seconds)
        await page.fill('#cron-input', '30 0 9 * * MON-FRI');

        // Click Parse Expression button
        await page.click('button:has-text("Parse Expression")');

        // Wait for the results to be visible
        await expect(page.locator('#cron-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#cron-error')).toBeHidden();

        // Verify the expression breakdown includes seconds
        await expect(page.locator('#cron-second')).toContainText('30');
        await expect(page.locator('#cron-minute')).toContainText('0');
        await expect(page.locator('#cron-hour')).toContainText('9');
        await expect(page.locator('#cron-day')).toContainText('*');
        await expect(page.locator('#cron-month')).toContainText('*');
        await expect(page.locator('#cron-dow')).toContainText('MON-FRI');
    });

    test("test common examples", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the CRON Parser tool
        await page.click('[data-tool="cron-parser"]');
        await expect(page.locator('#cron-parser-tool')).toBeVisible();

        // Test each example button
        const examples = [
            { expression: '0 9 * * MON-FRI', description: 'weekday morning', id: "weekday-morning-example" },
            { expression: '0 0 1 * *', description: 'monthly', id: "monthly-example" },
            { expression: '*/15 * * * *', description: 'every 15 minutes', id: "every-15-minutes-example" },
            { expression: '0 0 0 * * 0', description: 'weekly', id: "weekly-example" }
        ];

        for (const example of examples) {
            // Click the "Use" button for this example
            const useButton = page.locator("#" + example.id);
            await useButton.click();

            // Verify the input field is populated
            await expect(page.locator('#cron-input')).toHaveValue(example.expression);

            // Wait for results to be visible (the example should auto-parse)
            await expect(page.locator('#cron-results')).toBeVisible();

            // Verify no errors
            await expect(page.locator('#cron-error')).toBeHidden();

            // Verify description is not empty
            await expect(page.locator('#cron-description')).not.toBeEmpty();
        }
    });

    test("test error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the CRON Parser tool
        await page.click('[data-tool="cron-parser"]');
        await expect(page.locator('#cron-parser-tool')).toBeVisible();

        // Test empty input validation
        await page.click('button:has-text("Parse Expression")');
        await expect(page.locator('#cron-error')).toBeVisible();
        await expect(page.locator('#cron-error-message')).toContainText('Please enter a CRON expression');
        await expect(page.locator('#cron-results')).toBeHidden();

        // Test invalid CRON expression
        await page.fill('#cron-input', 'invalid cron expression');
        await page.click('button:has-text("Parse Expression")');

        // Wait for error to be displayed
        await expect(page.locator('#cron-error')).toBeVisible();
        await expect(page.locator('#cron-error-message')).not.toBeEmpty();
        await expect(page.locator('#cron-results')).toBeHidden();

        // Test invalid field values
        await page.fill('#cron-input', '60 25 32 13 8');
        await page.click('button:has-text("Parse Expression")');

        await expect(page.locator('#cron-error')).toBeVisible();
        await expect(page.locator('#cron-results')).toBeHidden();
    });

    test("test clear functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the CRON Parser tool
        await page.click('[data-tool="cron-parser"]');
        await expect(page.locator('#cron-parser-tool')).toBeVisible();

        // Enter and parse a CRON expression first
        await page.fill('#cron-input', '0 12 * * *');
        await page.click('button:has-text("Parse Expression")');

        // Wait for results to be visible
        await expect(page.locator('#cron-results')).toBeVisible();

        // Click Clear button
        const clearButton = page.locator("#clear-cron");
        await clearButton.click();

        // Verify input is cleared
        await expect(page.locator('#cron-input')).toHaveValue('');

        // Verify results are hidden
        await expect(page.locator('#cron-results')).toBeHidden();

        // Verify error is hidden
        await expect(page.locator('#cron-error')).toBeHidden();
    });

    test("test UI elements and layout", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the CRON Parser tool
        await page.click('[data-tool="cron-parser"]');
        await expect(page.locator('#cron-parser-tool')).toBeVisible();

        // Verify the tool description is displayed
        await expect(page.locator('#cron-parser-tool')).toContainText('Parse and describe CRON expressions in human-readable format');

        // Verify input field and helper text
        await expect(page.locator('#cron-input')).toBeVisible();
        await expect(page.locator('#cron-parser-tool')).toContainText('Format: minute hour day month day-of-week');

        // Verify common examples section is visible
        await expect(page.locator('#cron-parser-tool')).toContainText('Common Examples');

        // Verify all UI elements are present
        await expect(page.locator('h2:has-text("CRON Parser")')).toBeVisible();
        await expect(page.locator('label[for="cron-input"]')).toContainText('CRON Expression');
        await expect(page.locator('#cron-input')).toBeVisible();
        await expect(page.locator('button:has-text("Parse Expression")')).toBeVisible();
        const clearButton = page.locator("#clear-cron");
        await expect(clearButton).toBeVisible();

        // Verify input field attributes
        await expect(page.locator('#cron-input')).toHaveAttribute('placeholder', 'Enter CRON expression (e.g., 0 15 * * 1-5)');

        // Verify common examples section
        await expect(page.locator('h3:has-text("Common Examples")')).toBeVisible();

        // Verify example expressions are displayed
        await expect(page.locator('code:has-text("0 9 * * MON-FRI")')).toBeVisible();
        await expect(page.locator('code:has-text("0 0 1 * *")')).toBeVisible();
        await expect(page.locator('code:has-text("*/15 * * * *")')).toBeVisible();
        await expect(page.locator('code:has-text("0 0 0 * * 0")')).toBeVisible();

        // Parse an expression to check result UI elements
        await page.fill('#cron-input', '0 12 * * *');
        await page.click('button:has-text("Parse Expression")');
        await expect(page.locator('#cron-results')).toBeVisible();

        // Verify result section elements
        await expect(page.locator('#cron-description')).toBeVisible();
        await expect(page.locator('button:has-text("Copy Description")')).toBeVisible();

        // Verify expression breakdown section
        await expect(page.locator('text=Expression Breakdown')).toBeVisible();

        // Verify breakdown field values
        await expect(page.locator('#cron-second')).toBeVisible();
        await expect(page.locator('#cron-minute')).toBeVisible();
        await expect(page.locator('#cron-hour')).toBeVisible();
        await expect(page.locator('#cron-day')).toBeVisible();
        await expect(page.locator('#cron-month')).toBeVisible();
        await expect(page.locator('#cron-dow')).toBeVisible();
    });
});