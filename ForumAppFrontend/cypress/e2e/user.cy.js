describe('User Interactions', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!@#',
    phoneNumber: '+40700000000'
  };

  beforeEach(() => {
    // Check if backend is responding
    cy.request({
      method: 'GET',
      url: 'http://localhost:8080/api/test/status',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error('Backend is not responding. Check if the server is running.');
      }
    });

    // Check if frontend is responding
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000',
      failOnStatusCode: false,
      timeout: 10000
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error('Frontend is not responding. Check if the server is running on port 3000.');
      }
    });

    // Try to clean database
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/test/cleanup',
      failOnStatusCode: false
    });

    // Create test user
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/auth/register',
      body: testUser,
      failOnStatusCode: false
    });

    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow user to add a question', () => {
    // Login ca utilizator
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.wait(1000); // Wait for page to load

    // Go to new question page
    cy.visit('/ask');
    cy.wait(1000); // Wait for page to load

    // Fill question form
    cy.get('input[name="title"]').should('be.visible').type('Test Question');
    cy.get('textarea').should('be.visible').type('Test content');
    cy.get('button.btn-primary').should('be.visible').click();
  });

  it('should allow user to add a response to a question', () => {
    // Login ca utilizator
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.wait(1000); // Wait for page to load

    // Go to an existing question
    cy.visit('/');
    cy.wait(1000); // Wait for page to load
    cy.get('.question-card').first().click();

    // Add an answer
    cy.get('textarea').should('be.visible').type('Test response');
    cy.get('button.btn-primary').should('be.visible').click();
  });
}); 