// @ts-check
import { defineConfig, devices } from "@playwright/test";

import { baseUrl } from "./setup.js";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: ".",
    testMatch: '*.spec.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI, // TODO: set this var when setting up CI tests
    workers: 4,
    timeout: 15 * 1000, // 15 seconds, maximum time for each test (the expect() assertions)
    reporter: 'html',
    use: {
        ignoreHTTPSErrors: true,
        actionTimeout: 5 * 1000,
        baseURL: baseUrl,
        video: !!process.env.CI ? "off" : "on",
        trace: 'on'
    },

    /* Configure projects for major browsers */
    // TODO: configure for mobile vs desktop
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],

    webServer: [
        {
            name: 'server',
            command: 'npm run test:integration',
            url: "http://localhost:5000",
            reuseExistingServer: !process.env.CI,
            cwd: "../"
        }
    ]
});