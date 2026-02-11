import { expect, test } from '@playwright/test';

const ORIGIN = process.env.PREVIEW_ORIGIN ?? 'http://127.0.0.1:4173';
const BASE_PATH = '/academic_dashboard';

test('hash routing supports deep navigation and reload', async ({ page }) => {
    await page.goto(`${ORIGIN}${BASE_PATH}/`);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Schedule' }).click();
    await expect(page).toHaveURL(`${ORIGIN}${BASE_PATH}/#/schedule`);
    await expect(page.getByRole('heading', { name: 'System Schedule' })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(`${ORIGIN}${BASE_PATH}/#/schedule`);
    await expect(page.getByRole('heading', { name: 'System Schedule' })).toBeVisible();
});

test('entrypoint responds 200 and no source files are requested in production', async ({ page }) => {
    const sourceRequests: string[] = [];
    const failedRequests: string[] = [];
    const pageErrors: string[] = [];

    page.on('request', request => {
        const path = new URL(request.url()).pathname;
        if (path.includes('/src/')) {
            sourceRequests.push(request.url());
        }
    });

    page.on('requestfailed', request => {
        const failure = request.failure();
        failedRequests.push(`${request.method()} ${request.url()} :: ${failure?.errorText ?? 'unknown error'}`);
    });

    page.on('pageerror', error => {
        pageErrors.push(String(error));
    });

    const response = await page.goto(`${ORIGIN}${BASE_PATH}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');

    expect(sourceRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
});

test('built html resolves base assets without unresolved placeholders', async ({ request }) => {
    const response = await request.get(`${ORIGIN}${BASE_PATH}/`);
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(html).toContain('/academic_dashboard/assets/');
    expect(html).not.toContain('%BASE_URL%');
});
