import { Settings, Surveys } from '../../actions';

describe('Initialize surveys page', () => {
  beforeEach(() => {
    cy.login();
    Settings.checkSettingsPage();
  });

  it('Surveys page exists', () => {
    Surveys.checkSurveyPage();
  });
});
