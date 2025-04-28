/// <reference types="cypress" />

describe('Campaign Management Tests', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.login('admin@example.com', 'password123');
    
    // Navigate to campaigns page
    cy.visit('/campaigns');
  });

  it('should display campaigns page', () => {
    cy.contains('Campaigns').should('be.visible');
    cy.get('table').should('exist');
  });

  it('should navigate to create campaign page', () => {
    cy.contains('Create Campaign').click();
    cy.url().should('include', '/campaigns/new');
    cy.contains('Create New Campaign').should('be.visible');
  });

  it('should create a new email campaign', () => {
    // Navigate to create campaign page
    cy.contains('Create Campaign').click();
    
    // Fill out the form
    const campaignName = `Test Campaign ${Date.now()}`;
    cy.get('input[name="name"]').type(campaignName);
    cy.get('textarea[name="description"]').type('This is a test email campaign created by Cypress');
    cy.get('select[name="type"]').select('email');
    
    // Select audience (customers)
    cy.get('[data-testid="audience-selector"]').click();
    cy.get('[data-testid="audience-item"]').first().click();
    cy.get('[data-testid="audience-item"]').eq(1).click();
    cy.get('body').click(); // Close the dropdown
    
    // Fill email content
    cy.get('input[name="subject"]').type('Test Email Subject');
    cy.get('[data-testid="email-editor"]').type('This is the content of the test email campaign.');
    
    // Schedule the campaign
    cy.get('input[name="scheduledDate"]').type('2023-12-31T10:00');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to campaigns list
    cy.url().should('include', '/campaigns');
    
    // New campaign should be in the list
    cy.contains(campaignName).should('be.visible');
    cy.contains('email').should('be.visible');
    cy.contains('draft').should('be.visible');
  });

  it('should view campaign details', () => {
    // Click on the first campaign in the list
    cy.get('table tbody tr').first().click();
    
    // Should navigate to campaign details page
    cy.url().should('include', '/campaigns/');
    
    // Campaign details should be displayed
    cy.contains('Campaign Details').should('be.visible');
    cy.contains('Campaign Information').should('be.visible');
    cy.contains('Audience').should('be.visible');
    cy.contains('Content').should('be.visible');
  });

  it('should edit a campaign', () => {
    // Click on the first campaign in the list
    cy.get('table tbody tr').first().click();
    
    // Click edit button
    cy.contains('Edit').click();
    
    // Update campaign description
    cy.get('textarea[name="description"]').clear().type('Updated campaign description');
    
    // Save changes
    cy.get('button:contains("Save")').click();
    
    // Should show success message
    cy.contains('Campaign updated successfully').should('be.visible');
    
    // Updated description should be displayed
    cy.contains('Updated campaign description').should('be.visible');
  });

  it('should send a campaign', () => {
    // Click on the first campaign in the list
    cy.get('table tbody tr').first().click();
    
    // Click send button
    cy.contains('Send Campaign').click();
    
    // Confirm sending
    cy.get('button:contains("Confirm")').click();
    
    // Should show success message
    cy.contains('Campaign sent successfully').should('be.visible');
    
    // Campaign status should be updated
    cy.contains('active').should('be.visible');
  });

  it('should view campaign metrics', () => {
    // Click on the first campaign in the list
    cy.get('table tbody tr').first().click();
    
    // Click metrics tab
    cy.contains('Metrics').click();
    
    // Metrics should be displayed
    cy.contains('Campaign Metrics').should('be.visible');
    cy.contains('Sent').should('be.visible');
    cy.contains('Delivered').should('be.visible');
    cy.contains('Opened').should('be.visible');
    cy.contains('Clicked').should('be.visible');
  });
});
