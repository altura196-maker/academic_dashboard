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

test('built html resolves base assets without unresolved placeholders', async ({ request }) => {
    const response = await request.get(`${ORIGIN}${BASE_PATH}/`);
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(html).toContain('/academic_dashboard/assets/');
    expect(html).not.toContain('%BASE_URL%');
});
