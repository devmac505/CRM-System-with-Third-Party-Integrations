const Campaign = require('../models/Campaign');
const mailchimp = require('@mailchimp/mailchimp_marketing');

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('audience', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Private
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('audience', 'name email')
      .populate('createdBy', 'name email');
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private
exports.createCampaign = async (req, res) => {
  try {
    // Add current user as creator
    req.body.createdBy = req.user.id;
    
    const campaign = await Campaign.create(req.body);
    
    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
exports.updateCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    await campaign.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Send campaign via Mailchimp
// @route   POST /api/campaigns/:id/send
// @access  Private
exports.sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('audience', 'name email');
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    if (campaign.type !== 'email') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only email campaigns can be sent via Mailchimp' 
      });
    }
    
    // Create audience list in Mailchimp
    const audienceEmails = campaign.audience.map(customer => {
      return {
        email_address: customer.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: customer.name.split(' ')[0],
          LNAME: customer.name.split(' ').slice(1).join(' ')
        }
      };
    });
    
    // Create Mailchimp campaign
    const mailchimpCampaign = await mailchimp.campaigns.create({
      type: 'regular',
      settings: {
        title: campaign.name,
        subject_line: campaign.content.subject,
        from_name: 'Your CRM System',
        reply_to: 'noreply@yourcrm.com',
      },
      content: {
        html: campaign.content.body
      }
    });
    
    // Update campaign with Mailchimp ID
    campaign.mailchimpCampaignId = mailchimpCampaign.id;
    campaign.status = 'active';
    campaign.sentDate = Date.now();
    await campaign.save();
    
    // Send the campaign
    await mailchimp.campaigns.send(mailchimpCampaign.id);
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error sending campaign', 
      error: error.message 
    });
  }
};
