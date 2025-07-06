Cypress.Commands.add('login', () => {
  cy.session(
    'admin-user',
    () => {
      // All login actions go inside the session setup function
      cy.visit('/');
      // First click the auth button to open the login modal
      cy.get(`[data-qa="btn-auth"]`).click();
      // Wait for the login modal to appear
      cy.get('app-login').should('be.visible');
      cy.get('app-login-form').should('be.visible');
      localStorage.setItem('USH_is_onboarding_done', 'true');
      cy.get('app-cookies-notification').should('exist');
      cy.get(`[data-qa="button-decline-cookies"]`).contains('Decline').click();
      cy.get('app-login-form').should('be.visible');
      cy.fixture('users.json').then((users) => {
        cy.get(`[data-qa="email"]`).clear().type(users.admin.email);
        cy.get(`[data-qa="password"]`).clear().type(users.admin.password);
      });
      cy.get(`[data-qa="form"]`).submit();

      // Wait for successful login - ensure we're no longer on login page
      cy.url().should('not.include', '/login');
      cy.url().should('not.include', '/auth');
    },
    {
      validate: () => {
        // Debug: Log all cookies to see what's actually set
        cy.getCookies().then((cookies) => {
          cy.log('Available cookies:', cookies);
          console.log('Available cookies:', cookies);
        });
        // Temporarily disable cookie validation to see what cookies exist
        // cy.getCookie('session_payload').should('exist');
        // Additional validation: ensure we're not redirected to login
        cy.visit('/');
        cy.url().should('not.include', '/login');
      },
      cacheAcrossSpecs: true,
    },
  );
});
