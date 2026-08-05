import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export interface DataTableLocators {
  readonly row: string;
  readonly cell: string;
  readonly headerCell: string;
}

const DEFAULT_LOCATORS: DataTableLocators = {
  row: 'tbody tr',
  cell: 'td',
  headerCell: 'th',
};

/**
 * Generic HTML table component scoped to a root Locator.
 *
 * All row/cell indexes are 0-based.
 * Assertions live in the test — these methods return data, not boolean pass/fail.
 */
export class DataTable extends BaseComponent {
  private readonly tableLocators: DataTableLocators;

  constructor(root: Locator, locators?: Partial<DataTableLocators>) {
    super(root);
    this.tableLocators = { ...DEFAULT_LOCATORS, ...locators };
  }

  async getRowCount(): Promise<number> {
    return this.root.locator(this.tableLocators.row).count();
  }

  async getHeaderTexts(): Promise<string[]> {
    const headers = this.root.locator(this.tableLocators.headerCell);
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      texts.push((text ?? '').trim());
    }
    return texts;
  }

  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    const row = this.root.locator(this.tableLocators.row).nth(rowIndex);
    const text = await row.locator(this.tableLocators.cell).nth(colIndex).textContent();
    return (text ?? '').trim();
  }

  async getRowTexts(rowIndex: number): Promise<string[]> {
    const row = this.root.locator(this.tableLocators.row).nth(rowIndex);
    const cells = row.locator(this.tableLocators.cell);
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cells.nth(i).textContent();
      texts.push((text ?? '').trim());
    }
    return texts;
  }

  /** Returns a scoped Locator for all rows matching the given text. Use `.first()` for a single row. */
  getRowByText(text: string | RegExp): Locator {
    return this.root.locator(this.tableLocators.row).filter({ hasText: text });
  }

  async clickRow(rowIndex: number): Promise<void> {
    await this.root.locator(this.tableLocators.row).nth(rowIndex).click();
  }

  async waitForRowWithText(text: string | RegExp): Promise<void> {
    await this.getRowByText(text).first().waitFor({ state: 'visible' });
  }
}
