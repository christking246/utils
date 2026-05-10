// @ts-check
import { test, expect } from "@playwright/test";
import { pageSetup } from "./setup";

test.describe("Duration Translator Tool", () => {
    test("tool interface loads and displays correctly", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        // Title and description
        await expect(page.locator('#duration-translator-tool')).toContainText('Duration Translator');
        await expect(page.locator('#duration-translator-tool')).toContainText('Convert a duration between seconds, minutes, hours, and days');

        // Value input
        await expect(page.locator('#duration-value')).toBeVisible();
        await expect(page.locator('#duration-value')).toHaveValue('0');

        // Unit select with all options
        await expect(page.locator('#duration-unit')).toBeVisible();
        await expect(page.locator('#duration-unit option[value="second"]')).toHaveCount(1);
        await expect(page.locator('#duration-unit option[value="minute"]')).toHaveCount(1);
        await expect(page.locator('#duration-unit option[value="hour"]')).toHaveCount(1);
        await expect(page.locator('#duration-unit option[value="day"]')).toHaveCount(1);

        // Convert button
        await expect(page.locator('#duration-translate-btn')).toBeVisible();
        await expect(page.locator('#duration-translate-btn')).toContainText('Convert');

        // Results hidden by default
        await expect(page.locator('#duration-translate-results')).toBeHidden();
    });

    // These are not the most effective tests, but they should still catch any major issues with the conversion logic.
    test("converts seconds correctly", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        await page.fill('#duration-value', '3600');
        await page.selectOption('#duration-unit', 'second');
        await page.click('#duration-translate-btn');

        await expect(page.locator('#duration-translate-results')).toBeVisible();
        await expect(page.locator('#duration-translate-values')).toContainText('3600');  // seconds
        await expect(page.locator('#duration-translate-values')).toContainText('60');    // minutes
        await expect(page.locator('#duration-translate-values')).toContainText('1');     // hours
    });

    test("converts minutes correctly", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        await page.fill('#duration-value', '60');
        await page.selectOption('#duration-unit', 'minute');
        await page.click('#duration-translate-btn');

        await expect(page.locator('#duration-translate-results')).toBeVisible();
        await expect(page.locator('#duration-translate-values')).toContainText('3600');  // seconds
        await expect(page.locator('#duration-translate-values')).toContainText('60');   // minutes
        await expect(page.locator('#duration-translate-values')).toContainText('1');    // hours
    });

    test("converts hours correctly", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        await page.fill('#duration-value', '24');
        await page.selectOption('#duration-unit', 'hour');
        await page.click('#duration-translate-btn');

        await expect(page.locator('#duration-translate-results')).toBeVisible();
        await expect(page.locator('#duration-translate-values')).toContainText('86400'); // seconds
        await expect(page.locator('#duration-translate-values')).toContainText('1440');  // minutes
        await expect(page.locator('#duration-translate-values')).toContainText('24');    // hours
        await expect(page.locator('#duration-translate-values')).toContainText('1');     // days
    });

    test("converts days correctly", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        await page.fill('#duration-value', '1');
        await page.selectOption('#duration-unit', 'day');
        await page.click('#duration-translate-btn');

        await expect(page.locator('#duration-translate-results')).toBeVisible();
        await expect(page.locator('#duration-translate-values')).toContainText('86400'); // seconds
        await expect(page.locator('#duration-translate-values')).toContainText('1440');  // minutes
        await expect(page.locator('#duration-translate-values')).toContainText('24');    // hours
        await expect(page.locator('#duration-translate-values')).toContainText('1');     // days
    });

    test("results are cleared when value changes", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        await page.fill('#duration-value', '60');
        await page.click('#duration-translate-btn');
        await expect(page.locator('#duration-translate-results')).toBeVisible();

        await page.fill('#duration-value', '120');
        await expect(page.locator('#duration-translate-results')).toBeHidden();
    });

    test("results are cleared when unit changes", async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="duration-translator"]');

        await page.fill('#duration-value', '60');
        await page.click('#duration-translate-btn');
        await expect(page.locator('#duration-translate-results')).toBeVisible();

        await page.selectOption('#duration-unit', 'hour');
        await expect(page.locator('#duration-translate-results')).toBeHidden();
    });
});
