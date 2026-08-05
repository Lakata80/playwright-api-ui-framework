// Pages
export { BasePage } from './pages/BasePage';

// Components
export { BaseComponent } from './components/BaseComponent';
export { Dialog } from './components/Dialog';
export type { DialogLocators } from './components/Dialog';
export { DataTable } from './components/DataTable';
export type { DataTableLocators } from './components/DataTable';
export { NavigationMenu } from './components/NavigationMenu';
export { Form } from './components/Form';

// Fixtures
export { baseTest, ConsoleMonitor } from './fixtures/BaseFixtures';
export type {
  Page,
  Locator,
  BrowserContext,
  UiCoreInternalFixtures,
} from './fixtures/BaseFixtures';
