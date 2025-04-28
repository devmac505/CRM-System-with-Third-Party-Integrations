/// <reference types="cypress" />

describe('Lead Management Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
    
    // Navigate to leads page
    cy.visit('/leads');
  });

  it('should display leads page', () => {
    cy.contains('Leads').should('be.visible');
    cy.get('table').should('exist');
  });

  it('should navigate to add lead page', () => {
    cy.contains('Add Lead').click();
    cy.url().should('include', '/leads/new');
    cy.contains('Create New Lead').should('be.visible');
  });

  it('should create a new lead', () => {
    // Navigate to add lead page
    cy.contains('Add Lead').click();
    
    // Fill out the form
    cy.get('select[name="customer"]').select(1); // Select first customer
    cy.get('select[name="source"]').select('website');
    cy.get('select[name="status"]').select('new');
    cy.get('input[name="score"]').type('50');
    cy.get('input[name="value"]').type('1000');
    cy.get('input[name="expectedClosingDate"]').type('2023-12-31');
    cy.get('textarea[name="notes"]').type('This is a test lead created by Cypress');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to leads list
    cy.url().should('include', '/leads');
    
    // New lead should be in the list
    cy.contains('new').should('be.visible');
    cy.contains('$1,000').should('be.visible');
  });

  it('should view lead details', () => {
    // Click on the first lead in the list
    cy.get('table tbody tr').first().click();
    
    // Should navigate to lead details page
    cy.url().should('include', '/leads/');
    
    // Lead details should be displayed
    cy.contains('Lead Details').should('be.visible');
    cy.contains('Lead Information').should('be.visible');
    cy.contains('Interactions').should('be.visible');
  });

  it('should add an interaction to a lead', () => {
    // Click on the first lead in the list
    cy.get('table tbody tr').first().click();
    
    // Click add interaction button
    cy.contains('Add Interaction').click();
    
    // Fill out the interaction form
    cy.get('select[name="type"]').select('call');
    cy.get('textarea[name="notes"]').type('Test call with the customer');
    cy.get('input[name="outcome"]').type('Positive response');
    
    // Submit the form
    cy.get('button:contains("Save")').click();
    
    // Should show success message
    cy.contains('Interaction added successfully').should('be.visible');
    
    // New interaction should be in the list
    cy.contains('Test call with the customer').should('be.visible');
    cy.contains('Positive response').should('be.visible');
  });

  it('should update lead status', () => {
    // Click on the first lead in the list
    cy.get('table tbody tr').first().click();
    
    // Click edit button
    cy.contains('Edit').click();
    
    // Update lead status
    cy.get('select[name="status"]').select('qualified');
    
    // Save changes
    cy.get('button:contains("Save")').click();
    
    // Should show success message
    cy.contains('Lead updated successfully').should('be.visible');
    
    // Updated status should be displayed
    cy.contains('qualified').should('be.visible');
  });

  it('should view sales pipeline', () => {
    // Navigate to sales pipeline
    cy.contains('Sales Pipeline').click();
    
    // Should navigate to pipeline page
    cy.url().should('include', '/leads/pipeline');
    
    // Pipeline should be displayed
    cy.contains('Sales Pipeline').should('be.visible');
    
    // Pipeline stages should be visible
    cy.contains('New').should('be.visible');
    cy.contains('Contacted').should('be.visible');
    cy.contains('Qualified').should('be.visible');
    cy.contains('Proposal').should('be.visible');
    cy.contains('Negotiation').should('be.visible');
    cy.contains('Closed Won').should('be.visible');
    cy.contains('Closed Lost').should('be.visible');
  });
});
