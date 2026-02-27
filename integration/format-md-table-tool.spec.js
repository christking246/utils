// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("Markdown Table Formatter Tool", () => {
    test("markdown table formatting with basic table", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the Markdown Table Formatter tool
        await page.click('[data-tool="markdown-table-formatter"]');

        // Verify the tool description is displayed
        await expect(page.locator('#markdown-table-formatter-tool')).toContainText('Format and align markdown tables with proper spacing and consistent column widths');

        // Enter test markdown table
        const inputTable = `| Name | Age | City |
| --- | --- | --- |
| John | 25 | New York |
| Jane Smith | 30 | Los Angeles |
| Bob | 35 | Chicago |`;

        await page.fill('#md-table-input', inputTable);
        await page.click('button:has-text("Format Table")');
        await expect(page.locator('#md-table-results')).toBeVisible();

        // Verify the formatted output
        const formattedOutput = await page.locator('#md-table-output').inputValue();
        expect(formattedOutput).toContain('| Name       |');
        expect(formattedOutput).toContain('| Jane Smith |');
        expect(formattedOutput).toContain('| Los Angeles |');

        // Verify success message is shown
        await expect(page.locator('#md-table-success')).toBeVisible();
        await expect(page.locator('#md-table-success')).toContainText('Table Formatted Successfully');

        // Verify no error is shown
        await expect(page.locator('#md-table-error')).toBeHidden();
    });

    test("markdown table formatting with uneven content lengths", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');;

        // Test with varying content lengths
        const inputTable = `| Product | Category | Price | Description |
| --- | --- | --- | --- |
| Wireless Headphones | Electronics | $89.99 | High-quality noise-cancelling headphones |
| Mug | Kitchen | $12.50 | Coffee mug |
| Smartphone Case | Electronics | $19.99 | Protective case for smartphones |`;

        await page.fill('#md-table-input', inputTable);
        await page.click('button:has-text("Format Table")');
        await expect(page.locator('#md-table-results')).toBeVisible();

        const formattedOutput = await page.locator('#md-table-output').inputValue();

        // Verify proper alignment - longest content should determine column width
        expect(formattedOutput).toContain('| Wireless Headphones |');
        expect(formattedOutput).toContain('| High-quality noise-cancelling headphones |');
    });

    test("markdown table formatting with empty cells", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');

        const inputTable = `| Name | Middle | Last |
| --- | --- | --- |
| John | J | Doe |
| Jane |  | Smith |
| Bob | Robert | Johnson |`;

        await page.fill('#md-table-input', inputTable);
        await page.click('button:has-text("Format Table")');
        await expect(page.locator('#md-table-results')).toBeVisible();

        const formattedOutput = await page.locator('#md-table-output').inputValue();
        expect(formattedOutput).toContain('| Jane |');
        expect(formattedOutput).toContain('| Smith   |');

        await expect(page.locator('#md-table-success')).toBeVisible();
        await expect(page.locator('#md-table-error')).toBeHidden();
    });

    test("markdown table formatting with multiple separator rows", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');

        const inputTable = `| Group | Item | Value |
| --- | --- | --- |
| A | Item1 | 100 |
| --- | --- | --- |
| B | Item2 | 200 |`;

        await page.fill('#md-table-input', inputTable);
        await page.click('button:has-text("Format Table")');
        await expect(page.locator('#md-table-results')).toBeVisible();

        const formattedOutput = await page.locator('#md-table-output').inputValue();

        // Should contain multiple separator rows with proper dashes
        const separatorCount = (formattedOutput.match(/\|---/g) || []).length;
        expect(separatorCount).toBeGreaterThan(1);

        await expect(page.locator('#md-table-success')).toBeVisible();
    });

    test("load example functionality", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');

        // Click Load Example button
        await page.click('button:has-text("Load Example")');

        // Verify example data is loaded
        const inputValue = await page.locator('#md-table-input').inputValue();
        expect(inputValue).toContain('| Product | Category | Price | Stock | Rating |');
        expect(inputValue).toContain('| Wireless Headphones | Electronics | $89.99 | 45 | 4.5 |');
        expect(inputValue).toContain('| Coffee Mug | Kitchen | $12.50 | 120 | 4.2 |');

        // Format the example table
        await page.click('button:has-text("Format Table")');
        const formattedOutput = await page.locator('#md-table-output').inputValue();

        await expect(page.locator('#md-table-results')).toBeVisible();
        expect(formattedOutput).toContain('| Wireless Headphones |');
        expect(formattedOutput).toContain('| Electronics |');
    });

    test("clear functionality", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');

        // Load example and format it
        await page.click('button:has-text("Load Example")');
        await page.click('button:has-text("Format Table")');
        await expect(page.locator('#md-table-results')).toBeVisible();

        // Verify fields are populated
        expect(await page.locator('#md-table-input').inputValue()).not.toBe('');
        expect(await page.locator('#md-table-output').inputValue()).not.toBe('');

        // Click Clear button
        await page.click('#clear-md-table-btn');

        // Verify all fields are cleared
        expect(await page.locator('#md-table-input').inputValue()).toBe('');
        expect(await page.locator('#md-table-output').inputValue()).toBe('');

        // Verify results and messages are hidden
        await expect(page.locator('#md-table-results')).toBeHidden();
        await expect(page.locator('#md-table-error')).toBeHidden();
        await expect(page.locator('#md-table-success')).toBeHidden();
    });

    test("error handling for empty input", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');

        // Try to format without input
        await page.click('button:has-text("Format Table")');

        // Verify error is shown
        await expect(page.locator('#md-table-error')).toBeVisible();
        await expect(page.locator('#md-table-error-message')).toContainText('Please enter a markdown table to format');

        // Verify results are not shown
        await expect(page.locator('#md-table-results')).toBeHidden();
        await expect(page.locator('#md-table-success')).toBeHidden();
    });

    test("error handling for non-table text", async ({ page }) => {
        await pageSetup({ page });

        await page.click('[data-tool="markdown-table-formatter"]');
        await expect(page.locator('#markdown-table-formatter-tool')).toBeVisible();

        // Enter non-table text
        await page.fill('#md-table-input', 'This is just some regular text, not a table at all.');
        await page.click('button:has-text("Format Table")');

        // Verify error is shown
        await expect(page.locator('#md-table-error')).toBeVisible();
        await expect(page.locator('#md-table-error-message')).toContainText('Input must contain at least a header and a separator row');

        await expect(page.locator('#md-table-results')).toBeHidden();
        await expect(page.locator('#md-table-success')).toBeHidden();
    });
});