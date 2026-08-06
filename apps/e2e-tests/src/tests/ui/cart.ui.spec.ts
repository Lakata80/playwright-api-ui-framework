import { test, expect } from '../../fixtures';
import { ProductListPage } from '../../pages/ProductListPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { CartPage } from '../../pages/CartPage';
import { AddToCartModal } from '../../components/AddToCartModal';

test.describe('Cart UI', () => {
  // Each test uses authenticatedPage which shares the server-side session (same worker
  // credentials). Clearing the cart before each test prevents cross-test pollution.
  test.beforeEach(async ({ authenticatedPage }) => {
    const cartPage = new CartPage(authenticatedPage);
    await cartPage.navigate('/view_cart');
    await cartPage.clearAll();
  });

  test('adding a product from the list shows it in the cart @smoke', async ({
    authenticatedPage,
  }) => {
    const listPage = new ProductListPage(authenticatedPage);
    await listPage.navigate('/products');
    const productName = await listPage.getCard(0).getName();

    await listPage.getCard(0).addToCart();
    const modal = new AddToCartModal(authenticatedPage.locator('#cartModal'));
    await modal.waitForVisible();
    await modal.viewCart();

    const cartPage = new CartPage(authenticatedPage);
    await cartPage.waitForLoad();

    expect(await cartPage.getItemCount()).toBe(1);
    expect(await cartPage.getItemName(0)).toBe(productName);
  });

  test('adding from product detail with quantity 2 reflects in cart', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/product_details/1');
    const detailPage = new ProductDetailPage(authenticatedPage);
    await detailPage.waitForLoad();

    const productName = await detailPage.getProductName();
    await detailPage.setQuantity(2);
    await detailPage.addToCart();

    const modal = new AddToCartModal(authenticatedPage.locator('#cartModal'));
    await modal.waitForVisible();
    await modal.viewCart();

    const cartPage = new CartPage(authenticatedPage);
    await cartPage.waitForLoad();

    expect(await cartPage.getItemName(0)).toBe(productName);
    expect(await cartPage.getItemQuantity(0)).toBe(2);
  });

  test('removing an item from cart reduces item count by one', async ({ authenticatedPage }) => {
    const listPage = new ProductListPage(authenticatedPage);
    await listPage.navigate('/products');

    // Add two distinct products so removing one still leaves a non-empty cart.
    await listPage.getCard(0).addToCart();
    const modal1 = new AddToCartModal(authenticatedPage.locator('#cartModal'));
    await modal1.waitForVisible();
    await modal1.continueShopping();

    await listPage.getCard(1).addToCart();
    const modal2 = new AddToCartModal(authenticatedPage.locator('#cartModal'));
    await modal2.waitForVisible();
    await modal2.viewCart();

    const cartPage = new CartPage(authenticatedPage);
    await cartPage.waitForLoad();
    expect(await cartPage.getItemCount()).toBe(2);

    await cartPage.removeItem(0);
    await cartPage.waitForItemCount(1);
  });
});
