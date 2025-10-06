// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

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
