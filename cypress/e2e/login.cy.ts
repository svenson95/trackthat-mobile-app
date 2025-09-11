xdescribe('Google Login', () => {
  beforeEach(() => {
    cy.visit('/tabs/overview');
  });

  it('shows Google login popup when clicking login button', () => {
    cy.get('iframe[src*="accounts.google.com"]', { timeout: 10000 }).should('not.exist');

    cy.get('ion-button[data-test="google-login-btn"]').click();

    cy.get('iframe[src*="accounts.google.com"]', { timeout: 10000 }).should('be.visible');
  });
});
