const axios = require('axios');

// Facebook Graph API base URL
const FACEBOOK_API_URL = 'https://graph.facebook.com/v18.0';

// Get Facebook page insights
exports.getPageInsights = async (pageId, accessToken, metrics, period = 'day', limit = 30) => {
  try {
    const response = await axios.get(`${FACEBOOK_API_URL}/${pageId}/insights`, {
      params: {
        access_token: accessToken,
        metric: metrics.join(','),
        period,
        limit
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Facebook page insights error:', error.response?.data || error.message);
    throw new Error(`Facebook page insights error: ${error.message}`);
  }
};

// Get Facebook page posts
exports.getPagePosts = async (pageId, accessToken, limit = 10) => {
  try {
    const response = await axios.get(`${FACEBOOK_API_URL}/${pageId}/posts`, {
      params: {
        access_token: accessToken,
        fields: 'id,message,created_time,permalink_url,attachments,comments.summary(true),reactions.summary(true)',
        limit
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Facebook page posts error:', error.response?.data || error.message);
    throw new Error(`Facebook page posts error: ${error.message}`);
  }
};

// Get post comments
exports.getPostComments = async (postId, accessToken, limit = 50) => {
  try {
    const response = await axios.get(`${FACEBOOK_API_URL}/${postId}/comments`, {
      params: {
        access_token: accessToken,
        fields: 'id,message,created_time,from,attachment,comment_count,like_count',
        limit
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Facebook post comments error:', error.response?.data || error.message);
    throw new Error(`Facebook post comments error: ${error.message}`);
  }
};

// Reply to a comment
exports.replyToComment = async (commentId, accessToken, message) => {
  try {
    const response = await axios.post(`${FACEBOOK_API_URL}/${commentId}/comments`, 
      {
        message
      },
      {
        params: {
          access_token: accessToken
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Facebook reply to comment error:', error.response?.data || error.message);
    throw new Error(`Facebook reply to comment error: ${error.message}`);
  }
};

// Post to a Facebook page
exports.postToPage = async (pageId, accessToken, message, link = null) => {
  try {
    const postData = { message };
    
    if (link) {
      postData.link = link;
    }
    
    const response = await axios.post(`${FACEBOOK_API_URL}/${pageId}/feed`, 
      postData,
      {
        params: {
          access_token: accessToken
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Facebook post to page error:', error.response?.data || error.message);
    throw new Error(`Facebook post to page error: ${error.message}`);
  }
};

// Get Facebook user profile
exports.getUserProfile = async (userId, accessToken) => {
  try {
    const response = await axios.get(`${FACEBOOK_API_URL}/${userId}`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,email,picture'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Facebook user profile error:', error.response?.data || error.message);
    throw new Error(`Facebook user profile error: ${error.message}`);
  }
};
