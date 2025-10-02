export const baseUrl = "http://localhost:5000"; // dynamically plug into what was setup in the env?

export const pageSetup = async ({ page, pathname="", refererPath=undefined }) => {
    const referer = refererPath ? new URL(refererPath, baseUrl).href : undefined;
    await page.goto(pathname, { referer });

    await Promise.all([
        page.waitForLoadState("networkidle"),
        page.waitForLoadState("domcontentloaded"),
    ])
};