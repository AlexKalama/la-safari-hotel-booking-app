// Email service utility
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// Configure email transporter
// In production, you should use environment variables for these settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
});

export interface BookingSummaryEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  roomImage: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  adults: number;
  children: number;
  roomPrice: number;
  packageName?: string;
  packagePrice?: number;
  totalPrice: number;
  specialRequests?: string;
  paymentStatus: string;
}

export async function sendBookingConfirmationEmail(data: BookingSummaryEmailData): Promise<boolean> {
  try {
    const emailContent = generateBookingConfirmationEmailHTML(data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'LA SAFARI HOTEL <reservations@baharihotel.com>',
      to: data.guestEmail,
      subject: `Booking Confirmation - LA SAFARI HOTEL #${data.bookingId.substring(0, 8)}`,
      html: emailContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendPaymentReceiptEmail(data: BookingSummaryEmailData): Promise<boolean> {
  try {
    const emailContent = generatePaymentReceiptEmailHTML(data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'LA SAFARI HOTEL <payments@baharihotel.com>',
      to: data.guestEmail,
      subject: `Payment Receipt - LA SAFARI HOTEL #${data.bookingId.substring(0, 8)}`,
      html: emailContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Receipt email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return false;
  }
}

function generateBookingConfirmationEmailHTML(data: BookingSummaryEmailData): string {
  const formattedCheckIn = format(new Date(data.checkInDate), 'EEEE, MMMM d, yyyy');
  const formattedCheckOut = format(new Date(data.checkOutDate), 'EEEE, MMMM d, yyyy');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        /* Base styles */
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
        .logo {
          width: 120px;
          height: auto;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px;
        }
        .booking-info {
          background-color: #f9f5ea;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .room-image {
          width: 100%;
          height: auto;
          border-radius: 6px;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          border-top: 2px solid #ddd;
          padding-top: 15px;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888;
        }
        .button {
          display: inline-block;
          background-color: #ce9623;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin-top: 15px;
          font-weight: 600;
        }
        .button:hover {
          background-color: #bb8415;
        }
        .confirmation-code {
          font-family: monospace;
          font-size: 20px;
          letter-spacing: 2px;
          text-align: center;
          background-color: #f3f3f3;
          padding: 10px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .message {
          font-style: italic;
          color: #666;
          margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmation</h1>
          <p>Thank you for choosing LA SAFARI HOTEL</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.guestName},</h2>
          <p>Your reservation at LA SAFARI HOTEL has been confirmed. Please find your booking details below:</p>
          
          <div class="confirmation-code">
            Confirmation #: ${data.bookingId.substring(0, 8).toUpperCase()}
          </div>
          
          <img src="${data.roomImage || 'https://via.placeholder.com/600x300'}" alt="${data.roomName}" class="room-image" />
          
          <div class="booking-info">
            <h3>${data.roomName}</h3>
            
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span>${formattedCheckIn}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span>${formattedCheckOut}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Nights:</span>
              <span>${data.nights}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span>${data.adults} adults, ${data.children} children</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room rate:</span>
              <span>KES ${data.roomPrice.toLocaleString()} per night</span>
            </div>
            
            ${data.packageName ? `
            <div class="detail-row">
              <span class="detail-label">Package:</span>
              <span>${data.packageName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Package rate:</span>
              <span>KES ${data.packagePrice?.toLocaleString()} per night</span>
            </div>
            ` : ''}
            
            <div class="total-row">
              <span>Total:</span>
              <span>KES ${data.totalPrice.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span style="color: ${data.paymentStatus === 'paid' ? 'green' : 'orange'}; font-weight: bold;">
                ${data.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>
          
          ${data.specialRequests ? `
          <div class="message">
            <strong>Special Requests:</strong><br>
            ${data.specialRequests}
          </div>
          ` : ''}
          
          <p><strong>Contact Information:</strong><br>
            Email: ${data.guestEmail}<br>
            Phone: ${data.guestPhone}
          </p>
          
          <p>If you need to modify or cancel your reservation, please contact us as soon as possible.</p>
          
          <a href="https://baharihotel.com/manage-booking/${data.bookingId}" class="button">Manage Booking</a>
        </div>
        
        <div class="footer">
          <p>LA SAFARI HOTEL<br>
          Beach Road, Malindi, Kenya<br>
          +254 123 456 789<br>
          info@baharihotel.com</p>
          
          <p>&copy; ${new Date().getFullYear()} LA SAFARI HOTEL. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentReceiptEmailHTML(data: BookingSummaryEmailData): string {
  const formattedCheckIn = format(new Date(data.checkInDate), 'EEEE, MMMM d, yyyy');
  const formattedCheckOut = format(new Date(data.checkOutDate), 'EEEE, MMMM d, yyyy');
  const receiptDate = format(new Date(), 'MMMM d, yyyy');
  const receiptNumber = `RCT-${Date.now().toString().substring(0, 8)}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
      <style>
        /* Base styles */
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
        .content {
          padding: 30px;
        }
        .receipt-info {
          background-color: #f9f5ea;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          border-top: 2px solid #ddd;
          padding-top: 15px;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888;
        }
        .receipt-number {
          font-family: monospace;
          font-size: 18px;
          letter-spacing: 1px;
          text-align: center;
          background-color: #f3f3f3;
          padding: 10px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .paid-stamp {
          color: green;
          font-size: 24px;
          font-weight: bold;
          border: 3px solid green;
          border-radius: 8px;
          padding: 5px 15px;
          transform: rotate(-15deg);
          position: absolute;
          right: 40px;
          top: 140px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
          .paid-stamp {
            right: 20px;
            top: 120px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>LA SAFARI HOTEL</p>
        </div>
        
        <div class="content">
          <div class="receipt-header">
            <div>
              <h2>Receipt</h2>
              <p>Date: ${receiptDate}</p>
            </div>
            <div>
              <div class="receipt-number">
                ${receiptNumber}
              </div>
            </div>
          </div>
          
          ${data.paymentStatus === 'paid' ? '<div class="paid-stamp">PAID</div>' : ''}
          
          <div class="receipt-info">
            <div class="detail-row">
              <span class="detail-label">Guest:</span>
              <span>${data.guestName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span>${data.bookingId.substring(0, 8).toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room:</span>
              <span>${data.roomName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span>${formattedCheckIn}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span>${formattedCheckOut}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Nights:</span>
              <span>${data.nights}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room rate:</span>
              <span>KES ${data.roomPrice.toLocaleString()} × ${data.nights} nights = KES ${(data.roomPrice * data.nights).toLocaleString()}</span>
            </div>
            
            ${data.packageName ? `
            <div class="detail-row">
              <span class="detail-label">Package:</span>
              <span>${data.packageName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Package rate:</span>
              <span>KES ${data.packagePrice?.toLocaleString()} × ${data.nights} nights = KES ${((data.packagePrice || 0) * data.nights).toLocaleString()}</span>
            </div>
            ` : ''}
            
            <div class="total-row">
              <span>Total Amount:</span>
              <span>KES ${data.totalPrice.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span>Credit Card</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span style="color: ${data.paymentStatus === 'paid' ? 'green' : 'orange'}; font-weight: bold;">
                ${data.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>
          
          <p>Thank you for choosing LA SAFARI HOTEL. We look forward to welcoming you!</p>
          
          <p><strong>Note:</strong> This is an electronic receipt. No physical copy will be sent.</p>
        </div>
        
        <div class="footer">
          <p>LA SAFARI HOTEL<br>
          Beach Road, Malindi, Kenya<br>
          +254 123 456 789<br>
          info@baharihotel.com</p>
          
          <p>&copy; ${new Date().getFullYear()} LA SAFARI HOTEL. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
