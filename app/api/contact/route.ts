import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Create transporter with the same email config used for booking confirmations
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Configure email data
    const mailData = {
      from: `${name} <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER, // Send to hotel's email address
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #f3c05e;
      color: #7b5800;
      padding: 20px;
      text-align: center;
    }
    .hotel-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #7b5800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
    }
    .contact-info {
      background-color: #f9f5ea;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .detail-row {
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .message-box {
      background-color: #f3f3f3;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="hotel-name">LA SAFARI HOTEL</div>
      <p>New Contact Form Submission</p>
    </div>
    
    <div class="content">
      <h2>Contact Details</h2>
      
      <div class="contact-info">
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span>${name}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span>${email}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span>${phone || 'Not provided'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Subject:</span>
          <span>${subject}</span>
        </div>
      </div>
      
      <h3>Message:</h3>
      <div class="message-box">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>LA SAFARI HOTEL</strong><br>
      Beach Road, Malindi, Kenya<br>
      +254 123 456 789<br>
      info@lasafarihotel.com</p>
      
      <p>&copy; ${new Date().getFullYear()} LA SAFARI HOTEL. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailData);
    console.log('Contact form email sent:', info.messageId);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
