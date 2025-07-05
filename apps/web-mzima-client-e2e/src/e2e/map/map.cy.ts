import { Base } from '../actions';

describe('Initialize map page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Visits the initial project page', () => {
    Base.goToPage('/map');
    Base.checkContainElement('page-title', 'Map view');
  });
});
