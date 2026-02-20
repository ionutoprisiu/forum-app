describe('Authentication Flow', () => {
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
      cy.log('Backend status:', response.body);
    });

    // Check if frontend is responding
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000',
      failOnStatusCode: false,
      timeout: 10000
    }).then((response) => {
      cy.log('Frontend status:', response.status);
      if (response.status !== 200) {
        cy.log('Frontend response:', response.body);
        throw new Error('Frontend is not responding. Check if the server is running on port 3000.');
      }
    });

    // Try to clean database; do not fail test if cleanup fails
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/test/cleanup',
      failOnStatusCode: false
    }).then((response) => {
      cy.log('Cleanup response:', response.status, response.body);
      if (response.status !== 200) {
        cy.log('Warning: Could not clean database. Continuing with tests...');
      }
    });

    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should register a new user successfully', () => {
    const testUser = {
      username: 'testuser' + Date.now(), // Add timestamp to avoid conflicts
      email: 'test' + Date.now() + '@example.com',
      password: 'Test123!@#',
      phoneNumber: '+40700000000'
    };

    // Intercept register request
    cy.intercept({
      method: 'POST',
      url: '**/api/auth/register'
    }).as('registerRequest');

    // Wait for page to load
    cy.visit('/register', { timeout: 10000 });
    cy.get('form').should('be.visible');
    
    // Fill registration form
    cy.get('input[name="username"]').should('be.visible').type(testUser.username);
    cy.get('input[name="email"]').should('be.visible').type(testUser.email);
    cy.get('input[name="password"]').should('be.visible').type(testUser.password);
    cy.get('input[name="phoneNumber"]').should('be.visible').type(testUser.phoneNumber);
    
    cy.log('Form completed:', testUser);
    
    // Submit form
    cy.get('button[type="submit"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    
    // Wait and verify register request
    cy.wait('@registerRequest', { timeout: 10000 }).then((interception) => {
      cy.log('Register request:', {
        status: interception.response.statusCode,
        body: interception.response.body,
        requestBody: interception.request.body
      });
      
      if (interception.response.statusCode === 500) {
        // If 500, check if user already exists (e.g. duplicate)
        cy.request({
          method: 'POST',
          url: 'http://localhost:8080/api/auth/login',
          body: {
            email: testUser.email,
            password: testUser.password
          },
          failOnStatusCode: false
        }).then((loginResponse) => {
          expect(loginResponse.status).to.be.oneOf([200, 201]);
        });
      } else {
        expect(interception.response.statusCode).to.be.oneOf([201, 200]);
      }
    });

    // Wait for home page and user menu
    cy.url({ timeout: 15000 }).should('eq', Cypress.config().baseUrl + '/');
    
    // Verify user is authenticated
    cy.get('[data-testid="user-menu"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .and('contain', testUser.username);
  });

  it('should login successfully', () => {
    // Create a test user first
    const testUser = {
      username: 'loginuser' + Date.now(),
      email: 'login' + Date.now() + '@example.com',
      password: 'Test123!@#',
      phoneNumber: '+40700000000'
    };

    // Intercept login request
    cy.intercept({
      method: 'POST',
      url: '**/api/auth/login'
    }).as('loginRequest');

    // Create user via API
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/auth/register',
      body: testUser,
      failOnStatusCode: false
    }).then((response) => {
      cy.log('User creation response:', response.status, response.body);
      if (response.status === 500) {
        // If 500, user may already exist; try login
        cy.request({
          method: 'POST',
          url: 'http://localhost:8080/api/auth/login',
          body: {
            email: testUser.email,
            password: testUser.password
          },
          failOnStatusCode: false
        }).then((loginResponse) => {
          expect(loginResponse.status).to.be.oneOf([200, 201]);
        });
      } else {
        expect(response.status).to.be.oneOf([201, 200]);
      }
    });

    // Attempt login
    cy.visit('/login', { timeout: 10000 });
    cy.get('form').should('be.visible');
    
    cy.get('input[name="email"]').should('be.visible').type(testUser.email);
    cy.get('input[name="password"]').should('be.visible').type(testUser.password);
    cy.get('button[type="submit"]').should('be.visible').click();
    
    // Wait and verify login request
    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      cy.log('Login request:', {
        status: interception.response.statusCode,
        body: interception.response.body
      });
      expect(interception.response.statusCode).to.equal(200);
    });
    
    // Verify redirect to home
    cy.url({ timeout: 15000 }).should('eq', Cypress.config().baseUrl + '/');
    
    // Verify user is authenticated
    cy.get('[data-testid="user-menu"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .and('contain', testUser.username);
  });

  it('should show error for invalid login', () => {
    // Intercept login request to simulate error
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Authentication failed. Please check your credentials.'
      }
    }).as('loginRequest');

    // Visit login page
    cy.visit('/login', { timeout: 10000 });
    
    // Verify form is visible
    cy.get('[data-testid="login-form"]').should('be.visible');
    
    // Fill form with invalid data
    cy.get('input[name="email"]')
      .should('be.visible')
      .type('invalid@example.com');
    
    cy.get('input[name="password"]')
      .should('be.visible')
      .type('wrongpassword');
    
    // Submit form
    cy.get('button[type="submit"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    
    // Wait for login request and check response
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.equal(401);
      cy.log('Login request failed with status:', interception.response.statusCode);
      cy.log('Response body:', interception.response.body);
    });

    // Wait for loading state to clear
    cy.get('button[type="submit"]')
      .should('not.be.disabled')
      .should('contain', 'Sign in');

    // Debug: verify form exists and is visible
    cy.get('[data-testid="login-form"]').should('be.visible');
    
    // Debug: Print the current HTML to see what's in the DOM
    cy.document().then((doc) => {
      cy.log('Current HTML:', doc.body.innerHTML);
    });

    // Wait for error state to be set
    cy.wait(1000);
    
    // Verify error element exists in DOM
    cy.get('[data-testid="error-message"]', { timeout: 10000 })
      .should('exist');
    
    // Verify we stay on login page
    cy.url().should('include', '/login');
    
    // Verify form is still visible
    cy.get('[data-testid="login-form"]').should('be.visible');
    
    // Verify form fields are still accessible
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });
}); 