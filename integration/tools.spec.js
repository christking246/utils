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

test.describe("JWT Decoder Tool", () => {
    test("test JWT decoder happy path", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JWT Decoder tool
        await page.click('[data-tool="jwt-decoder"]');

        // Wait for the JWT decoder tool to be visible
        await expect(page.locator('#jwt-decoder-tool')).toBeVisible();

        // Verify the security warning is displayed
        await expect(page.locator('#jwt-decoder-tool')).toContainText('Security Notice');
        await expect(page.locator('#jwt-decoder-tool')).toContainText('Token signatures are not verified');

        // Use a valid JWT token for testing
        const validJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
            "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

        // Enter the JWT token in the input field
        await page.fill('#jwt-input', validJWT);

        // Click the Decode JWT button
        await page.click('#decode-jwt');

        // Wait for the results to be visible
        await expect(page.locator('#jwt-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#jwt-error')).toBeHidden();

        // Verify the header section is displayed with expected content
        await expect(page.locator('#jwt-header')).toBeVisible();
        const headerContent = await page.locator('#jwt-header').inputValue();
        const headerObj = JSON.parse(headerContent);
        expect(headerObj.alg).toBe('HS256');
        expect(headerObj.typ).toBe('JWT');

        // Verify the payload section is displayed with expected content
        await expect(page.locator('#jwt-payload')).toBeVisible();
        const payloadContent = await page.locator('#jwt-payload').inputValue();
        const payloadObj = JSON.parse(payloadContent);
        expect(payloadObj.sub).toBe('1234567890');
        expect(payloadObj.name).toBe('John Doe');
        expect(payloadObj.iat).toBe(1516239022);

        // Verify the token info cards
        await expect(page.locator('#jwt-algorithm')).toContainText('HS256');

        // Verify issued at timestamp (should be converted to readable format)
        const issuedAtText = await page.locator('#jwt-issued').textContent();
        expect(issuedAtText).not.toBe('-');
        expect(issuedAtText).toContain('2018'); // The iat timestamp 1516239022 is from 2018

        // For this test token, there's no exp claim, so expires should show '-'
        await expect(page.locator('#jwt-expires')).toContainText('-');
    });

    test("test JWT decoder error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JWT Decoder tool
        await page.click('[data-tool="jwt-decoder"]');

        // Wait for the JWT decoder tool to be visible
        await expect(page.locator('#jwt-decoder-tool')).toBeVisible();

        // Test empty input validation
        await page.click('#decode-jwt');
        await expect(page.locator('#jwt-error')).toBeVisible();
        await expect(page.locator('#jwt-error-message')).toContainText('Please enter a JWT token');

        // Test invalid JWT token
        await page.fill('#jwt-input', 'invalid.jwt.token');
        await page.click('#decode-jwt');

        // Wait for error to be displayed
        await expect(page.locator('#jwt-error')).toBeVisible();
        await expect(page.locator('#jwt-error-message')).toContainText('An error occurred trying decode the provided token');

        // Verify results are hidden when there's an error
        await expect(page.locator('#jwt-results')).toBeHidden();
    });

    test("test JWT decoder with expired token", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JWT Decoder tool
        await page.click('[data-tool="jwt-decoder"]');

        // Wait for the JWT decoder tool to be visible
        await expect(page.locator('#jwt-decoder-tool')).toBeVisible();

        // Use a JWT token with an expired exp claim (exp: 1516239022 is from 2018, definitely expired)
        // This token has both iat and exp claims, with exp being in the past
        const expiredJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9." +
            "4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KE";

        // Enter the expired JWT token in the input field
        await page.fill('#jwt-input', expiredJWT);

        // Click the Decode JWT button
        await page.click('#decode-jwt');

        // Wait for the results to be visible
        await expect(page.locator('#jwt-results')).toBeVisible();

        // Verify that the error div is hidden (token is valid, just expired)
        await expect(page.locator('#jwt-error')).toBeHidden();

        // Verify the header section is displayed with expected content
        await expect(page.locator('#jwt-header')).toBeVisible();
        const headerContent = await page.locator('#jwt-header').inputValue();
        const headerObj = JSON.parse(headerContent);
        expect(headerObj.alg).toBe('HS256');
        expect(headerObj.typ).toBe('JWT');

        // Verify the payload section is displayed with expected content
        await expect(page.locator('#jwt-payload')).toBeVisible();
        const payloadContent = await page.locator('#jwt-payload').inputValue();
        const payloadObj = JSON.parse(payloadContent);
        expect(payloadObj.sub).toBe('1234567890');
        expect(payloadObj.name).toBe('John Doe');
        expect(payloadObj.iat).toBe(1516239022);
        expect(payloadObj.exp).toBe(1516239022); // Same as iat for this test

        // Verify the token info cards
        await expect(page.locator('#jwt-algorithm')).toContainText('HS256');

        // Verify issued at timestamp (should be converted to readable format)
        const issuedAtText = await page.locator('#jwt-issued').textContent();
        expect(issuedAtText).not.toBe('-');
        expect(issuedAtText).toContain('2018');

        // Verify expires at timestamp shows the expired status
        const expiresAtText = await page.locator('#jwt-expires').textContent();
        expect(expiresAtText).not.toBe('-');
        expect(expiresAtText).toContain('2018'); // Should show the date
        expect(expiresAtText).toContain('(Expired)'); // Should show expired status

        // Verify the expires element has the red color class for expired tokens
        await expect(page.locator('#jwt-expires')).toHaveClass(/text-red-400/);
    });

    test("test JWT decoder with future expiry token", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JWT Decoder tool
        await page.click('[data-tool="jwt-decoder"]');

        // Wait for the JWT decoder tool to be visible
        await expect(page.locator('#jwt-decoder-tool')).toBeVisible();

        // Use a JWT token with a future exp claim (far in the future: year 2040)
        // exp: 2208988800 = January 1, 2040
        const validJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjIyMDg5ODg4MDB9." +
            "dvBnOl4m6UhNRhBJ5eh_2yaj2sxrjyzf6HmA8xRoM9U";

        // Enter the valid JWT token in the input field
        await page.fill('#jwt-input', validJWT);

        // Click the Decode JWT button
        await page.click('#decode-jwt');

        // Wait for the results to be visible
        await expect(page.locator('#jwt-results')).toBeVisible();

        // Verify that the error div is hidden (valid token)
        await expect(page.locator('#jwt-error')).toBeHidden();

        // Verify the payload has the expected exp claim
        const payloadContent = await page.locator('#jwt-payload').inputValue();
        const payloadObj = JSON.parse(payloadContent);
        expect(payloadObj.exp).toBe(2208988800); // Future timestamp

        // Verify expires at timestamp shows without expired status
        const expiresAtText = await page.locator('#jwt-expires').textContent();
        expect(expiresAtText).not.toBe('-');
        expect(expiresAtText).toContain('2039'); // Should show the future date (timezone converted)
        expect(expiresAtText).not.toContain('(Expired)'); // Should NOT show expired status

        // Verify the expires element has the green color class for valid tokens
        await expect(page.locator('#jwt-expires')).toHaveClass(/text-green-400/);
    });
});