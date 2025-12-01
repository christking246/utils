// @ts-check
import { test, expect } from '@playwright/test';

import { pageSetup } from './setup.js';

test.describe.only('SVG Optimizer Tool', () => {
    test('should display SVG optimizer interface', async ({ page }) => {
        await pageSetup({ page });

        // Navigate to SVG Optimizer tool
        await page.click('[data-tool="svg-optimizer"]');

        // Wait for the tool to be visible
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        // Check if all main elements are present
        await expect(page.locator('h2:has-text("SVG Optimizer")')).toBeVisible();
        await expect(page.locator('#svg-input')).toBeVisible();
        await expect(page.locator('#svg-output')).toBeVisible();
        await expect(page.locator('#optimize-svg-btn')).toBeVisible();
        await expect(page.locator('#clear-svg-btn')).toBeVisible();
        await expect(page.locator('label[for="svg-file-input"]:has-text("Click to upload SVG file")')).toBeVisible();
    });

    test('should show error for empty input', async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="svg-optimizer"]');
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        // Click optimize button without entering any SVG
        await page.click('#optimize-svg-btn');

        // Should show error notification
        await expect(page.locator('#notification-container .bg-red-600:has-text("Please enter SVG content to optimize")')).toBeVisible();
    });

    test('should show error for invalid SVG', async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="svg-optimizer"]');
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        // Enter invalid SVG content
        await page.fill('#svg-input', 'This is not SVG content');
        await page.click('#optimize-svg-btn');

        // Should show error notification
        await expect(page.locator('#notification-container .bg-red-600:has-text("Please enter valid SVG content")')).toBeVisible();
    });

    test('should optimize valid SVG successfully', async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="svg-optimizer"]');
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <!-- This is a comment that should be removed -->
            <rect x="10" y="10" width="80" height="80" fill="blue" />
            <!-- Another comment -->
        </svg>`;

        // Enter valid SVG content
        await page.fill('#svg-input', testSvg);
        await page.click('#optimize-svg-btn');

        // Wait for optimization to complete
        await page.waitForSelector('#optimization-stats:not(.hidden)', { timeout: 5000 });

        // Check if success notification is shown
        await expect(page.locator('#notification-container .bg-green-600:has-text("SVG optimized successfully")')).toBeVisible();

        // Check if optimization was successful
        const outputValue = await page.inputValue('#svg-output');
        expect(outputValue).toBeTruthy();
        expect(outputValue.length).toBeLessThan(testSvg.length);

        // Check if stats are displayed
        await expect(page.locator('#optimization-stats')).toBeVisible();
        await expect(page.locator('#original-size')).toBeVisible();
        await expect(page.locator('#optimized-size')).toBeVisible();
        await expect(page.locator('#saved-size')).toBeVisible();
        await expect(page.locator('#compression-ratio')).toBeVisible();

        // Check if buttons are enabled
        await expect(page.locator('#copy-svg-btn')).toBeEnabled();
        await expect(page.locator('#download-svg-btn')).toBeEnabled();

    });

    test('should clear inputs and outputs', async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="svg-optimizer"]');
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        const testSvg = '<svg><rect width="50" height="50"/></svg>';

        // Enter some content
        await page.fill('#svg-input', testSvg);

        // Click clear button
        await page.click('#clear-svg-btn');

        // Check if inputs are cleared
        const inputValue = await page.inputValue('#svg-input');
        const outputValue = await page.inputValue('#svg-output');
        expect(inputValue).toBe('');
        expect(outputValue).toBe('');

        // Check if stats are hidden
        await expect(page.locator('#optimization-stats')).toBeHidden();

        // Check if buttons are disabled
        await expect(page.locator('#copy-svg-btn')).toBeDisabled();
        await expect(page.locator('#download-svg-btn')).toBeDisabled();
    });

    test('should handle file upload', async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="svg-optimizer"]');
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        // Create a simple SVG file content
        const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="red"/></svg>';

        // Set up file input
        const fileInput = page.locator('#svg-file-input');

        // Create a file-like object
        await fileInput.setInputFiles({
            name: 'test.svg',
            mimeType: 'image/svg+xml',
            buffer: Buffer.from(svgContent)
        });

        // Check if file content is loaded into textarea
        const inputValue = await page.inputValue('#svg-input');
        expect(inputValue).toBe(svgContent);

        // Check if success notification is shown
        await expect(page.locator('#notification-container .bg-green-600:has-text("SVG file loaded successfully")')).toBeVisible();
    });

    test('should show previews after optimization', async ({ page }) => {
        await pageSetup({ page });
        await page.click('[data-tool="svg-optimizer"]');
        await expect(page.locator('#svg-optimizer-tool')).toBeVisible();

        const testSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="green"/></svg>';

        // Enter and optimize SVG
        await page.fill('#svg-input', testSvg);
        await page.click('#optimize-svg-btn');

        // Wait for optimization
        await page.waitForSelector('#optimization-stats:not(.hidden)', { timeout: 5000 });

        // Check if previews are updated
        const originalPreview = page.locator('#original-svg-preview');
        const optimizedPreview = page.locator('#optimized-svg-preview');

        await expect(originalPreview.locator('svg')).toBeVisible();
        await expect(optimizedPreview.locator('svg')).toBeVisible();
    });
});
