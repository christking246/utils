// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

// TODO: split this file

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

        expect(timestampText).not.toBe('-');
        expect(isoText).not.toBe('-');
        expect(utcText).not.toBe('-');
        expect(localText).not.toBe('-');
        expect(relativeText).not.toBe('-');

        // Verify the relative time shows "just now" for current time
        expect(relativeText).toContain('just now');

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
});

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