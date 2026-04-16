export async function sendBrevoEmail(apiKey, toEmail, subject, htmlContent) {
  if (!apiKey) {
    console.warn('Brevo API key is missing. Email will not be sent safely.');
    return false;
  }

  const url = 'https://api.brevo.com/v3/smtp/email';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'SafeSan Admin',
          email: 'sachinakash2911@gmail.com'
        },
        to: [
          {
            email: toEmail
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send email via Brevo:', await response.text());
      return false;
    }
    
    console.log(`Email successfully sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error executing Brevo HTTP request:', error);
    return false;
  }
}
