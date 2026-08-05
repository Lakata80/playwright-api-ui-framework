import { BaseComponent } from './BaseComponent';

/**
 * Generic navigation menu component scoped to a root Locator (e.g. <nav>, <header>).
 * Interacts with links via accessible role — no CSS selector coupling.
 *
 * For menus using non-link elements, subclass and override the navigation methods.
 */
export class NavigationMenu extends BaseComponent {
  async clickItem(label: string | RegExp): Promise<void> {
    await this.root.getByRole('link', { name: label }).click();
  }

  /**
   * Checks whether the given nav item has an "active" CSS class.
   * If your app signals active state differently (e.g., aria-current), subclass and override.
   */
  async isItemActive(label: string | RegExp): Promise<boolean> {
    const link = this.root.getByRole('link', { name: label });
    const classAttr = (await link.getAttribute('class')) ?? '';
    return classAttr.includes('active');
  }

  async getItemLabels(): Promise<string[]> {
    const links = this.root.getByRole('link');
    const count = await links.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      const trimmed = (text ?? '').trim();
      if (trimmed) labels.push(trimmed);
    }
    return labels;
  }

  async waitForItem(label: string | RegExp): Promise<void> {
    await this.root.getByRole('link', { name: label }).waitFor({ state: 'visible' });
  }
}
