// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("Time Converter Tool", () => {
    test("test time converter with current timestamp", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Time Converter tool
        await page.click('[data-tool="time-converter"]');

        // Wait for the time converter tool to be visible
        await expect(page.locator('#time-converter-tool')).toBeVisible();

        // Verify the tool description is displayed
        await expect(page.locator('#time-converter-tool')).toContainText('Convert between Unix timestamps, ISO format, and UTC strings');

        // Click "Use Current Time" button
        await page.click('button:has-text("Use Current Time")');

        // Verify that the input field is populated with a timestamp
        const inputValue = await page.locator('#time-input').inputValue();
        expect(inputValue).not.toBe('');
        expect(inputValue).toMatch(/^\d{13}$/); // Should be a 13-digit timestamp (milliseconds)

        // Click the Convert Time button
        await page.click('button:has-text("Convert Time")');

        // Wait for the results to be visible
        await expect(page.locator('#time-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#time-error')).toBeHidden();

        // Verify all result fields are populated (not showing default "-")
        const timestampText = await page.locator('#timestamp-result').textContent();
        const isoText = await page.locator('#iso-result').textContent();
        const utcText = await page.locator('#utc-result').textContent();
        const localText = await page.locator('#local-result').textContent();
        const relativeText = await page.locator('#relative-result').textContent();
        const daysSinceText = await page.locator('#days-since-result').textContent();

        expect(timestampText).not.toBe('-');
        expect(isoText).not.toBe('-');
        expect(utcText).not.toBe('-');
        expect(localText).not.toBe('-');
        expect(relativeText).not.toBe('-');
        expect(daysSinceText).not.toBe('-');

        // Verify the relative time shows "just now" for current time
        expect(relativeText).toContain('just now');

        // Verify the days since shows "Today" for current time
        expect(daysSinceText).toBe('Today');

        // Verify ISO format structure (should be ISO 8601)
        expect(isoText).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

        // Verify UTC string format
        expect(utcText).toMatch(/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
    });

    test("test time converter with specific timestamp", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Time Converter tool
        await page.click('[data-tool="time-converter"]');

        // Wait for the time converter tool to be visible
        await expect(page.locator('#time-converter-tool')).toBeVisible();

        // Enter a specific timestamp (January 1, 2021 00:00:00 UTC = 1609459200000)
        await page.fill('#time-input', '1609459200000');

        // Click the Convert Time button
        await page.click('button:has-text("Convert Time")');

        // Wait for the results to be visible
        await expect(page.locator('#time-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#time-error')).toBeHidden();

        // Verify specific expected values
        await expect(page.locator('#timestamp-result')).toContainText('1609459200000');
        await expect(page.locator('#iso-result')).toContainText('2021-01-01T00:00:00.000Z');
        await expect(page.locator('#utc-result')).toContainText('Fri, 01 Jan 2021 00:00:00 GMT');

        // Verify relative time shows it was in the past
        const relativeText = await page.locator('#relative-result').textContent();
        expect(relativeText).toContain('ago');

        // Verify days since shows the correct number (should be many days ago)
        const daysSinceText = await page.locator('#days-since-result').textContent();
        expect(daysSinceText).toMatch(/\d+ days ago/); // Should show "X days ago"
    });

    test("test time converter error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Time Converter tool
        await page.click('[data-tool="time-converter"]');

        // Wait for the time converter tool to be visible
        await expect(page.locator('#time-converter-tool')).toBeVisible();

        // Test empty input validation
        await page.click('button:has-text("Convert Time")');
        await expect(page.locator('#time-error')).toBeVisible();
        await expect(page.locator('#time-error-message')).toContainText('Please enter a time value');

        // Test invalid date string
        await page.fill('#time-input', 'invalid date string');
        await page.click('button:has-text("Convert Time")');

        // Wait for error to be displayed
        await expect(page.locator('#time-error')).toBeVisible();
        await expect(page.locator('#time-error-message')).toContainText('An error occurred trying parse the provided date');

        // Verify results are hidden when there's an error
        await expect(page.locator('#time-results')).toBeHidden();
    });

    test("test time converter clear functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Time Converter tool
        await page.click('[data-tool="time-converter"]');

        // Wait for the time converter tool to be visible
        await expect(page.locator('#time-converter-tool')).toBeVisible();

        // Fill input with some data
        await page.fill('#time-input', '1609459200000');

        // Click the Convert Time button to show results
        await page.click('button:has-text("Convert Time")');

        // Wait for the results to be visible
        await expect(page.locator('#time-results')).toBeVisible();

        // Click the Clear button
        await page.click('button:has-text("Clear")');

        // Verify input is cleared
        await expect(page.locator('#time-input')).toHaveValue('');

        // Verify results are hidden
        await expect(page.locator('#time-results')).toBeHidden();
        await expect(page.locator('#time-error')).toBeHidden();
    });

    test("test time converter relative time formats", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Time Converter tool
        await page.click('[data-tool="time-converter"]');

        // Wait for the time converter tool to be visible
        await expect(page.locator('#time-converter-tool')).toBeVisible();

        // Test with a timestamp from 1 hour ago
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        await page.fill('#time-input', oneHourAgo.toString());

        // Click the Convert Time button
        await page.click('button:has-text("Convert Time")');

        // Wait for the results to be visible
        await expect(page.locator('#time-results')).toBeVisible();

        // Verify relative time shows "1 hour ago"
        const relativeText = await page.locator('#relative-result').textContent();
        expect(relativeText).toMatch(/1 hour ago/);

        // Test with a timestamp from 1 hour ago
        const oneHourAhead = Date.now() + (60 * 61 * 1000);
        await page.fill('#time-input', String(oneHourAhead));

        // Click the Convert Time button
        await page.click('button:has-text("Convert Time")');

        // Wait for the results to be visible
        await expect(page.locator('#time-results')).toBeVisible();

        // Verify relative time shows "in 1 hour"
        expect(await page.locator('#relative-result').textContent()).toMatch(/in 1 hour/);
    });

    test("test time converter days since functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Time Converter tool
        await page.click('[data-tool="time-converter"]');
        await expect(page.locator('#time-converter-tool')).toBeVisible();

        // Test 1: Current time should show "Today"
        await page.click('button:has-text("Use Current Time")');
        await page.click('button:has-text("Convert Time")');
        await expect(page.locator('#time-results')).toBeVisible();

        const daysSinceToday = await page.locator('#days-since-result').textContent();
        expect(daysSinceToday).toBe('Today');

        // Test 2: Yesterday (24 hours ago)
        const yesterday = Date.now() - (24 * 60 * 60 * 1000);
        await page.fill('#time-input', yesterday.toString());
        await page.click('button:has-text("Convert Time")');
        await expect(page.locator('#time-results')).toBeVisible();

        const daysSinceYesterday = await page.locator('#days-since-result').textContent();
        expect(daysSinceYesterday).toBe('1 day ago');

        // Test 3: Multiple days ago (January 1, 2021 = 1609459200000)
        await page.fill('#time-input', '1609459200000');
        await page.click('button:has-text("Convert Time")');
        await expect(page.locator('#time-results')).toBeVisible();

        const daysSinceOld = await page.locator('#days-since-result').textContent();
        expect(daysSinceOld).toMatch(/\d+ days ago/);

        // Test 4: Future date (tomorrow)
        const tomorrow = Date.now() + (24 * 60 * 60 * 1000);
        await page.fill('#time-input', tomorrow.toString());
        await page.click('button:has-text("Convert Time")');
        await expect(page.locator('#time-results')).toBeVisible();

        const daysSinceFuture = await page.locator('#days-since-result').textContent();
        expect(daysSinceFuture).toMatch(/\d+ days? in the future/);
    });
});