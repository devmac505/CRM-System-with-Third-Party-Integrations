const mailchimp = require('@mailchimp/mailchimp_marketing');

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

// Create a new audience list
exports.createAudience = async (name, company, permission_reminder) => {
  try {
    const response = await mailchimp.lists.createList({
      name,
      contact: {
        company,
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US'
      },
      permission_reminder,
      campaign_defaults: {
        from_name: company,
        from_email: 'marketing@example.com',
        subject: '',
        language: 'en'
      },
      email_type_option: true
    });
    
    return response;
  } catch (error) {
    console.error('Mailchimp create audience error:', error);
    throw new Error(`Mailchimp create audience error: ${error.message}`);
  }
};

// Add members to an audience
exports.addMembers = async (listId, members) => {
  try {
    const response = await mailchimp.lists.batchListMembers(listId, {
      members,
      update_existing: true
    });
    
    return response;
  } catch (error) {
    console.error('Mailchimp add members error:', error);
    throw new Error(`Mailchimp add members error: ${error.message}`);
  }
};

// Create a campaign
exports.createCampaign = async (listId, subject, title, fromName, replyTo) => {
  try {
    const response = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: {
        list_id: listId
      },
      settings: {
        subject_line: subject,
        title,
        from_name: fromName,
        reply_to: replyTo
      }
    });
    
    return response;
  } catch (error) {
    console.error('Mailchimp create campaign error:', error);
    throw new Error(`Mailchimp create campaign error: ${error.message}`);
  }
};

// Set campaign content
exports.setCampaignContent = async (campaignId, html) => {
  try {
    const response = await mailchimp.campaigns.setContent(campaignId, {
      html
    });
    
    return response;
  } catch (error) {
    console.error('Mailchimp set campaign content error:', error);
    throw new Error(`Mailchimp set campaign content error: ${error.message}`);
  }
};

// Send a campaign
exports.sendCampaign = async (campaignId) => {
  try {
    const response = await mailchimp.campaigns.send(campaignId);
    return response;
  } catch (error) {
    console.error('Mailchimp send campaign error:', error);
    throw new Error(`Mailchimp send campaign error: ${error.message}`);
  }
};

// Get campaign report
exports.getCampaignReport = async (campaignId) => {
  try {
    const response = await mailchimp.reports.getCampaignReport(campaignId);
    return response;
  } catch (error) {
    console.error('Mailchimp get campaign report error:', error);
    throw new Error(`Mailchimp get campaign report error: ${error.message}`);
  }
};
