import { Settings } from '../actions';

describe('Initialize surveys page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Settings page exists', () => {
    Settings.checkSettingsPage();
  });
});
