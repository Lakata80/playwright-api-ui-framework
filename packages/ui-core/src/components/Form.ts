import { BaseComponent } from './BaseComponent';

/**
 * Generic form component scoped to a root Locator.
 *
 * Field interactions prefer accessible selectors (label, placeholder) over CSS classes.
 * For non-standard form markup, subclass and override the field-finding methods.
 *
 * All methods are scoped to this.root — no leakage to sibling forms on the page.
 */
export class Form extends BaseComponent {
  /** Fill a field by its visible label text. */
  async fillByLabel(label: string | RegExp, value: string): Promise<void> {
    await this.root.getByLabel(label).fill(value);
  }

  /** Fill a field by its placeholder text — useful when labels are absent. */
  async fillByPlaceholder(placeholder: string | RegExp, value: string): Promise<void> {
    await this.root.getByPlaceholder(placeholder).fill(value);
  }

  /** Select a <select> option by value or label text. */
  async selectByLabel(label: string | RegExp, optionValue: string): Promise<void> {
    await this.root.getByLabel(label).selectOption(optionValue);
  }

  /** Check or uncheck a checkbox by its associated label. */
  async setCheckboxByLabel(label: string | RegExp, checked: boolean): Promise<void> {
    await this.root.getByLabel(label).setChecked(checked);
  }

  async submit(): Promise<void> {
    await this.root.locator('button[type="submit"], input[type="submit"]').click();
  }

  async isSubmitEnabled(): Promise<boolean> {
    const btn = this.root.locator('button[type="submit"], input[type="submit"]');
    return !(await btn.isDisabled());
  }

  /**
   * Reads a validation error for a field.
   *
   * Resolution order:
   *   1. aria-describedby pointer on the field element (accessible pattern)
   *   2. [role="alert"], .error-message, or .invalid-feedback within the field's parent
   *
   * Returns an empty string when no visible error is found.
   */
  async getFieldError(label: string | RegExp): Promise<string> {
    const field = this.root.getByLabel(label);
    const describedBy = await field.getAttribute('aria-describedby');
    if (describedBy) {
      const text = await this.root.locator(`#${describedBy}`).textContent();
      return (text ?? '').trim();
    }
    const wrapper = field.locator('..');
    const errorEl = wrapper.locator('[role="alert"], .error-message, .invalid-feedback');
    if (await errorEl.isVisible()) {
      const text = await errorEl.textContent();
      return (text ?? '').trim();
    }
    return '';
  }
}
