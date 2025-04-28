/// <reference types="cypress" />

describe('Customer Management Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
    
    // Navigate to customers page
    cy.visit('/customers');
  });

  it('should display customers page', () => {
    cy.contains('Customers').should('be.visible');
    cy.get('table').should('exist');
  });

  it('should navigate to add customer page', () => {
    cy.contains('Add Customer').click();
    cy.url().should('include', '/customers/new');
    cy.contains('Add New Customer').should('be.visible');
  });

  it('should create a new customer', () => {
    // Navigate to add customer page
    cy.contains('Add Customer').click();
    
    // Fill out the form
    const uniqueEmail = `customer${Date.now()}@example.com`;
    cy.get('input[name="name"]').type('New Test Customer');
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="phone"]').type('555-123-4567');
    cy.get('input[name="company"]').type('Test Company');
    cy.get('select[name="status"]').select('active');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to customers list
    cy.url().should('include', '/customers');
    
    // New customer should be in the list
    cy.contains('New Test Customer').should('be.visible');
    cy.contains(uniqueEmail).should('be.visible');
  });

  it('should view customer details', () => {
    // Click on the first customer in the list
    cy.get('table tbody tr').first().click();
    
    // Should navigate to customer details page
    cy.url().should('include', '/customers/');
    
    // Customer details should be displayed
    cy.contains('Customer Details').should('be.visible');
    cy.contains('Contact Information').should('be.visible');
  });

  it('should edit customer information', () => {
    // Click on the first customer in the list
    cy.get('table tbody tr').first().click();
    
    // Click edit button
    cy.contains('Edit').click();
    
    // Update customer information
    cy.get('input[name="company"]').clear().type('Updated Company Name');
    
    // Save changes
    cy.get('button:contains("Save")').click();
    
    // Should show success message
    cy.contains('Customer updated successfully').should('be.visible');
    
    // Updated information should be displayed
    cy.contains('Updated Company Name').should('be.visible');
  });

  it('should delete a customer', () => {
    // Get the name of the first customer for later verification
    let customerName;
    cy.get('table tbody tr').first().find('td').eq(0).invoke('text').then((text) => {
      customerName = text;
    });
    
    // Click on the first customer in the list
    cy.get('table tbody tr').first().click();
    
    // Click delete button
    cy.contains('Delete').click();
    
    // Confirm deletion in the modal
    cy.get('button:contains("Confirm")').click();
    
    // Should redirect back to customers list
    cy.url().should('include', '/customers');
    
    // Deleted customer should not be in the list
    cy.contains(customerName).should('not.exist');
  });
});
