describe('App', () => {
  it('should load the application', () => {
    cy.visit('/');

    cy.get('app-root').should('exist');
  });
});
