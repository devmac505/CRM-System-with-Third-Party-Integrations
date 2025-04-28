/// <reference types="cypress" />

describe('Order Management Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
    
    // Navigate to orders page
    cy.visit('/orders');
  });

  it('should display orders page', () => {
    cy.contains('Orders').should('be.visible');
    cy.get('table').should('exist');
  });

  it('should navigate to create order page', () => {
    cy.contains('Create Order').click();
    cy.url().should('include', '/orders/new');
    cy.contains('Create New Order').should('be.visible');
  });

  it('should create a new order', () => {
    // Navigate to create order page
    cy.contains('Create Order').click();
    
    // Fill out the form
    cy.get('select[name="customer"]').select(1); // Select first customer
    
    // Add product
    cy.get('input[name="productName"]').type('Test Product');
    cy.get('textarea[name="productDescription"]').type('This is a test product');
    cy.get('input[name="productPrice"]').type('100');
    cy.get('input[name="productQuantity"]').type('2');
    cy.get('button:contains("Add Product")').click();
    
    // Total amount should be calculated automatically
    cy.get('input[name="totalAmount"]').should('have.value', '200');
    
    // Select payment method
    cy.get('select[name="paymentMethod"]').select('credit_card');
    
    // Add notes
    cy.get('textarea[name="notes"]').type('This is a test order created by Cypress');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to orders list
    cy.url().should('include', '/orders');
    
    // New order should be in the list
    cy.contains('Test Product').should('be.visible');
    cy.contains('$200.00').should('be.visible');
    cy.contains('pending').should('be.visible');
  });

  it('should view order details', () => {
    // Click on the first order in the list
    cy.get('table tbody tr').first().click();
    
    // Should navigate to order details page
    cy.url().should('include', '/orders/');
    
    // Order details should be displayed
    cy.contains('Order Details').should('be.visible');
    cy.contains('Products').should('be.visible');
    cy.contains('Payment Information').should('be.visible');
  });

  it('should process payment for an order', () => {
    // Click on the first order in the list
    cy.get('table tbody tr').first().click();
    
    // Click process payment button
    cy.contains('Process Payment').click();
    
    // Fill out payment form (this will depend on your Stripe integration)
    // For testing purposes, we'll just simulate a successful payment
    cy.get('input[name="cardNumber"]').type('4242424242424242');
    cy.get('input[name="cardExpiry"]').type('1225');
    cy.get('input[name="cardCvc"]').type('123');
    
    // Submit payment
    cy.get('button:contains("Pay Now")').click();
    
    // Should show success message
    cy.contains('Payment processed successfully').should('be.visible');
    
    // Order status should be updated
    cy.contains('paid').should('be.visible');
  });

  it('should update order status', () => {
    // Click on the first order in the list
    cy.get('table tbody tr').first().click();
    
    // Click edit button
    cy.contains('Edit').click();
    
    // Update order status
    cy.get('select[name="status"]').select('processing');
    
    // Save changes
    cy.get('button:contains("Save")').click();
    
    // Should show success message
    cy.contains('Order updated successfully').should('be.visible');
    
    // Updated status should be displayed
    cy.contains('processing').should('be.visible');
  });
});
