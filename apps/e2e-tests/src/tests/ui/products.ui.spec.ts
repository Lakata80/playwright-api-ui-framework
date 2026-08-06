import { test, expect } from '../../fixtures';
import { isSiteBlocked, SITE_SKIP_REASON } from '../../fixtures/waf-check';
import { ProductListPage } from '../../pages/ProductListPage';

test.describe('Products UI', () => {
  test.beforeAll(async () => {
    test.skip(await isSiteBlocked(), SITE_SKIP_REASON);
  });
  test('products page loads and shows products @smoke', async ({ authenticatedPage }) => {
    const listPage = new ProductListPage(authenticatedPage);
    await listPage.navigate('/products');

    const count = await listPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('search returns non-empty results', async ({ authenticatedPage }) => {
    const listPage = new ProductListPage(authenticatedPage);
    await listPage.navigate('/products');
    await listPage.searchFor('dress');

    const count = await listPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('first product card has a non-empty name and price', async ({ authenticatedPage }) => {
    const listPage = new ProductListPage(authenticatedPage);
    await listPage.navigate('/products');

    const card = listPage.getCard(0);
    const name = await card.getName();
    const price = await card.getPrice();

    expect(name.length).toBeGreaterThan(0);
    expect(price.length).toBeGreaterThan(0);
  });
});
