const { SendApi, AccountApi, Configuration } = require('hostinger-mail-api-sdk');

const sendEmail = async (options) => {
  try {
    const config = new Configuration({
      accessToken: process.env.HOSTINGER_API_KEY
    });
    
    // First, fetch the account to get the mailbox resource ID
    const accountApi = new AccountApi(config);
    const accountRes = await accountApi.getCurrentAccount();
    
    if (!accountRes.data?.data?.mailboxes?.length) {
      throw new Error('No mailboxes found for this Hostinger API Key');
    }

    // Get the first mailbox's resource ID
    const mailboxResourceId = accountRes.data.data.mailboxes[0].resourceId;

    const sendApi = new SendApi(config);
    
    const requestPayload = {
      to: [options.email],
      subject: options.subject,
      html: options.html,
      text: options.message,
    };

    await sendApi.sendEmail(mailboxResourceId, requestPayload);
    
    console.log(`Email sent successfully to ${options.email} via Hostinger API`);
  } catch (error) {
    console.error('Error sending email via Hostinger SDK:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
