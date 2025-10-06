// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test("test generate hashes", async ({ page }) => {
    await pageSetup({ page });

    // Navigate to the Hash Generator tool (at this point this is the default tool so this may be redundant)
    await page.click('[data-tool="hash-generator"]');

    // Wait for the hash generator tool to be visible (see note above)
    await expect(page.locator('#hash-generator-tool')).toBeVisible();

    // Enter test text in the input box
    await page.fill('#hash-input', "Hello, World!");

    // Click the Generate Hashes button
    await page.click('#generate-hashes');

    // Wait for the hash results to be visible
    await expect(page.locator('#hash-results')).toBeVisible();

    // Verify that all hash result fields are populated with expected values
    const expectedHashes = {
        'MD5': '65a8e27d8879283831b664bd8b7f0ad4',
        'SHA1': '0a0a9f2a6772942557ab5355d76af442f8f65e01',
        'SHA256': 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
        'SHA512': '374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6cc69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387'
    };

    await expect(page.locator('#md5-result')).toHaveValue(expectedHashes.MD5);
    await expect(page.locator('#sha1-result')).toHaveValue(expectedHashes.SHA1);
    await expect(page.locator('#sha256-result')).toHaveValue(expectedHashes.SHA256);
    await expect(page.locator('#sha512-result')).toHaveValue(expectedHashes.SHA512);
});