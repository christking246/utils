// @ts-check
import { test, expect } from "@playwright/test";

import { pageSetup } from "./setup";

test.describe("JSON ⇄ YAML Converter Tool", () => {
    test("test JSON to YAML conversion basic functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');

        // Wait for the converter tool to be visible
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Verify both input sections are visible
        await expect(page.locator('h3:has-text("JSON Input")')).toBeVisible();
        await expect(page.locator('h3:has-text("YAML Input")')).toBeVisible();
        await expect(page.locator('#json-input')).toBeVisible();
        await expect(page.locator('#yaml-input')).toBeVisible();

        // Enter a simple JSON object
        const testJson = '{"name": "John Doe", "age": 30, "active": true}';
        await page.fill('#json-input', testJson);

        // Click Convert to YAML button
        await page.click('button:has-text("Convert to YAML →")');

        // Wait for the results to be visible
        await expect(page.locator('#conversion-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#conversion-error')).toBeHidden();

        // Verify the output contains YAML format
        const yamlOutput = await page.locator('#conversion-output').inputValue();
        expect(yamlOutput).toContain('name: John Doe');
        expect(yamlOutput).toContain('age: 30');
        expect(yamlOutput).toContain('active: true');

        // Verify copy button is present
        const copyResultButton = page.locator("#serialize-copy-result");
        await expect(copyResultButton).toBeVisible();
    });

    test("test YAML to JSON conversion basic functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Enter a simple YAML
        const testYaml = `name: Jane Smith
age: 25
skills:
  - JavaScript
  - Python
  - Go
active: true`;
        await page.fill('#yaml-input', testYaml);

        // Click Convert to JSON button
        await page.click('button:has-text("← Convert to JSON")');

        // Wait for the results to be visible
        await expect(page.locator('#conversion-results')).toBeVisible();

        // Verify that the error div is hidden (no errors)
        await expect(page.locator('#conversion-error')).toBeHidden();

        // Verify the output contains proper JSON format
        const jsonOutput = await page.locator('#conversion-output').inputValue();
        const parsedJson = JSON.parse(jsonOutput);
        expect(parsedJson.name).toBe('Jane Smith');
        expect(parsedJson.age).toBe(25);
        expect(parsedJson.skills).toEqual(['JavaScript', 'Python', 'Go']);
        expect(parsedJson.active).toBe(true);

        // Verify it's properly formatted (should have indentation)
        expect(jsonOutput).toContain('    '); // Should have 4-space indentation...See TODO about making indentation configurable
    });

    test("test JSON format button functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Enter minified JSON
        const minifiedJson = '{"name":"Test","nested":{"value":123,"array":[1,2,3]}}';
        await page.fill('#json-input', minifiedJson);

        // Click Format JSON button
        await page.click('button:has-text("Format JSON")');

        // Verify the JSON is now formatted
        const formattedJson = await page.locator('#json-input').inputValue();
        expect(formattedJson).toContain('    '); // Should have indentation...See TODO about making indentation configurable
        expect(formattedJson).toContain('\n'); // Should have line breaks

        // Parse and verify content is unchanged
        const parsed = JSON.parse(formattedJson);
        expect(parsed.name).toBe('Test');
        expect(parsed.nested.value).toBe(123);
        expect(parsed.nested.array).toEqual([1, 2, 3]);

        // Verify no error is shown
        await expect(page.locator('#conversion-error')).toBeHidden();
    });

    test("test JSON conversion error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Test empty input validation
        await page.click('button:has-text("Convert to YAML →")');
        await expect(page.locator('#conversion-error')).toBeVisible();
        await expect(page.locator('#conversion-error-message')).toContainText('Please enter JSON data to convert');
        await expect(page.locator('#conversion-results')).toBeHidden();

        // Test invalid JSON
        await page.fill('#json-input', '{"invalid": json, missing quotes}');
        await page.click('button:has-text("Convert to YAML →")');

        await expect(page.locator('#conversion-error')).toBeVisible();
        await expect(page.locator('#conversion-error-message')).toContainText('Invalid JSON format');
        await expect(page.locator('#conversion-results')).toBeHidden();
    });

    test("test YAML conversion error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Test empty input validation
        await page.click('button:has-text("← Convert to JSON")');
        await expect(page.locator('#conversion-error')).toBeVisible();
        await expect(page.locator('#conversion-error-message')).toContainText('Please enter YAML data to convert');
        await expect(page.locator('#conversion-results')).toBeHidden();

        // Test invalid YAML (inconsistent indentation)
        await page.fill('#yaml-input', `name: Test
  age: 30
 invalid: indentation`);
        await page.click('button:has-text("← Convert to JSON")');

        await expect(page.locator('#conversion-error')).toBeVisible();
        await expect(page.locator('#conversion-results')).toBeHidden();
    });

    test("test format JSON error handling", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Test format button with invalid JSON
        await page.fill('#json-input', '{invalid json}');
        await page.click('button:has-text("Format JSON")');

        // Should show error
        await expect(page.locator('#conversion-error')).toBeVisible();
        await expect(page.locator('#conversion-error-message')).toContainText('Invalid JSON format');
    });

    test("test clear functionality", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Fill in some data and convert to show results
        await page.fill('#json-input', '{"test": "data"}');
        await page.click('button:has-text("Convert to YAML →")');
        await expect(page.locator('#conversion-results')).toBeVisible();

        // Test Clear JSON button
        const clearJsonButton = page.locator("#json-clear");
        await clearJsonButton.click();
        await expect(page.locator('#json-input')).toHaveValue('');
        await expect(page.locator('#conversion-results')).toBeHidden();
        await expect(page.locator('#conversion-error')).toBeHidden();

        // Fill in YAML data
        await page.fill('#yaml-input', 'name: test\nvalue: 123');

        // Test Clear YAML button
        const clearYmlButton = page.locator("#yml-clear");
        await clearYmlButton.click();
        await expect(page.locator('#yaml-input')).toHaveValue('');
        await expect(page.locator('#conversion-error')).toBeHidden();
    });

    // this is kinda unnecessary
    test("test round-trip conversion (JSON → YAML → JSON)", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        const originalJson = {
            "users": [
                {"id": 1, "name": "Alice", "active": true, "score": 95.5},
                {"id": 2, "name": "Bob", "active": false, "score": 87.2}
            ],
            "metadata": {
                "total": 2,
                "created": "2024-01-15T10:30:00Z"
            }
        };

        // Step 1: Convert JSON to YAML
        await page.fill('#json-input', JSON.stringify(originalJson, null, 2));
        await page.click('button:has-text("Convert to YAML →")');
        await expect(page.locator('#conversion-results')).toBeVisible();

        const yamlResult = await page.locator('#conversion-output').inputValue();

        // Step 2: Use the YAML result to convert back to JSON
        await page.fill('#yaml-input', yamlResult);
        await page.click('button:has-text("← Convert to JSON")');
        await expect(page.locator('#conversion-results')).toBeVisible();

        const finalJsonResult = await page.locator('#conversion-output').inputValue();
        const parsedResult = JSON.parse(finalJsonResult);

        // Verify the round-trip conversion preserved the data
        expect(parsedResult.users).toHaveLength(2);
        expect(parsedResult.users[0].name).toBe('Alice');
        expect(parsedResult.users[0].active).toBe(true);
        expect(parsedResult.users[0].score).toBe(95.5);
        expect(parsedResult.users[1].name).toBe('Bob');
        expect(parsedResult.users[1].active).toBe(false);
        expect(parsedResult.metadata.total).toBe(2);
    });

    test("test UI elements and layout", async ({ page }) => {
        await pageSetup({ page });

        // Navigate to the JSON/YAML Converter tool
        await page.click('[data-tool="json-yaml-converter"]');
        await expect(page.locator('#json-yaml-converter-tool')).toBeVisible();

        // Verify main UI elements
        await expect(page.locator('h2:has-text("JSON ⇄ YAML Converter")')).toBeVisible();

        // Verify the tool description is displayed
        await expect(page.locator('#json-yaml-converter-tool')).toContainText('Convert between JSON and YAML formats');

        // Verify JSON section elements
        await expect(page.locator('h3:has-text("JSON Input")')).toBeVisible();
        await expect(page.locator('#json-input')).toBeVisible();
        await expect(page.locator('button:has-text("Format JSON")')).toBeVisible();
        await expect(page.locator('button:has-text("Convert to YAML →")')).toBeVisible();

        // Verify YAML section elements
        await expect(page.locator('h3:has-text("YAML Input")')).toBeVisible();
        await expect(page.locator('#yaml-input')).toBeVisible();
        await expect(page.locator('button:has-text("← Convert to JSON")')).toBeVisible();

        // Verify clear buttons are present
        const clearJsonButton = page.locator("#json-clear");
        const clearYmlButton = page.locator("#yml-clear");
        await expect(clearJsonButton).toBeVisible();
        await expect(clearYmlButton).toBeVisible();

        // Verify placeholders
        await expect(page.locator('#json-input')).toHaveAttribute('placeholder', '{"name": "example", "value": 123}');
        await expect(page.locator('#yaml-input')).toHaveAttribute('placeholder', 'name: example\nvalue: 123');

        // Convert something to show results section
        await page.fill('#json-input', '{"test": true}');
        await page.click('button:has-text("Convert to YAML →")');

        // Verify results section elements
        await expect(page.locator('#conversion-results')).toBeVisible();
        await expect(page.locator('h3:has-text("Conversion Result")')).toBeVisible();
        await expect(page.locator('#conversion-output')).toBeVisible();
        const copyResultButton = page.locator("#serialize-copy-result");
        await expect(copyResultButton).toBeVisible();

        // Verify output textarea is read-only
        await expect(page.locator('#conversion-output')).toHaveAttribute('readonly');
    });
});