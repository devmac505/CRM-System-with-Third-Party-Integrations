/// <reference types="cypress" />

describe('Authentication Tests', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.contains('Sign in to your account').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should display registration page', () => {
    cy.visit('/register');
    cy.contains('Create a new account').should('be.visible');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error for invalid login', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Check for error message
    // Note: This test will fail until the backend is properly set up
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should register a new user', () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    cy.visit('/register');
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after successful registration
    // Note: This test will fail until the backend is properly set up
    cy.url().should('include', '/dashboard');
  });

  it('should login successfully and redirect to dashboard', () => {
    // This test assumes a user exists in the database
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after successful login
    // Note: This test will fail until the backend is properly set up
    cy.url().should('include', '/dashboard');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    
    // Click on user menu and logout
    cy.get('button:contains("Test User")').click();
    cy.contains('Logout').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
  });
});
