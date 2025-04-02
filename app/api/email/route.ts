// @ts-nocheck
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // Use direct SSL
  auth: {
    user: process.env.EMAIL_USER || 'alexkalama03@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'mtgi qeyv mkun abzu'
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  debug: true, // Show debug output
  logger: true // Log information to the console
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP Verification Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

export async function POST(request: Request) {
  try {
    const { bookingId, emailType } = await request.json();
    
    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 });
    }
    
    // Fetch the booking with room and package details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        rooms:room_id (*),
        packages:package_id (*)
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }
    
    // Generate email HTML based on type
    let emailHtml = '';
    let subject = '';
    
    if (emailType === 'confirmation') {
      emailHtml = generateBookingConfirmationHTML(booking);
      subject = `Booking Confirmation - LA SAFARI HOTEL #${booking.id.substring(0, 8)}`;
    } else if (emailType === 'receipt') {
      emailHtml = generatePaymentReceiptHTML(booking);
      subject = `Payment Receipt - LA SAFARI HOTEL #${booking.id.substring(0, 8)}`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid email type' }, { status: 400 });
    }
    
    // Actually send the email
    try {
      console.log(`[Email Service] Attempting to send ${emailType} email to ${booking.guest_email}`);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'LA SAFARI HOTEL <alexkalama03@gmail.com>',
        to: booking.guest_email,
        subject: subject,
        html: emailHtml
      };
      
      console.log("Mail options:", mailOptions);
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log(`[Email Service] Email sent successfully: ${info.messageId}`);
      console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      
      return NextResponse.json({
        success: true,
        message: `${emailType} email sent to ${booking.guest_email}`,
        messageId: info.messageId
      });
    } catch (emailError: any) {
      console.error('[Email Service] Error sending email:', emailError);
      console.error('[Email Service] Error details:', emailError.stack);
      
      return NextResponse.json({ 
        success: false, 
        error: `Failed to send email: ${emailError.message}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Email Service] Error processing email request:', error);
    console.error('[Email Service] Error stack:', error.stack);
    
    return NextResponse.json({ 
      success: false, 
      error: `Failed to process email request: ${error.message}` 
    }, { status: 500 });
  }
}

function generateBookingConfirmationHTML(booking: any): string {
  const { rooms, packages } = booking;
  const room = rooms || { name: 'Selected Room' };
  const selectedPackage = packages || null;
  
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  
  const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  
  // Calculate the number of nights
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
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
        .hotel-name {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #7b5800;
          text-transform: uppercase;
          letter-spacing: 1px;
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
          object-fit: cover;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="hotel-name">LA SAFARI HOTEL</div>
          <p>Your Coastal Paradise</p>
        </div>
        
        <div class="content">
          <h2>Hello ${booking.guest_name},</h2>
          <p>Your reservation at LA SAFARI HOTEL has been confirmed. Please find your booking details below:</p>
          
          <div class="confirmation-code">
            Confirmation #: ${booking.id.substring(0, 8).toUpperCase()}
          </div>
          
          <img src="${rooms?.image_url || 'https://baharihotel.com/images/rooms/default-room.jpg'}" alt="${room.name}" class="room-image" />
          
          <div class="booking-info">
            <h3>${room.name}</h3>
            
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
              <span>${nights}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span>${booking.adults} adults, ${booking.children} children</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room rate:</span>
              <span>KES ${room.price?.toLocaleString() || 'N/A'} per night</span>
            </div>
            
            ${selectedPackage ? `
            <div class="detail-row">
              <span class="detail-label">Package:</span>
              <span>${selectedPackage.name}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Package rate:</span>
              <span>KES ${selectedPackage.price_addon?.toLocaleString() || 'N/A'} per night</span>
            </div>
            ` : ''}
            
            <div class="total-row">
              <span>Total:</span>
              <span>KES ${booking.total_price.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span style="color: ${booking.payment_status === 'paid' ? 'green' : 'orange'}; font-weight: bold;">
                ${booking.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>
          
          ${booking.special_requests ? `
          <div class="message">
            <strong>Special Requests:</strong><br>
            ${booking.special_requests}
          </div>
          ` : ''}
          
          <p><strong>Contact Information:</strong><br>
            Email: ${booking.guest_email}<br>
            Phone: ${booking.guest_phone || 'Not provided'}
          </p>
          
          <p>If you need to modify or cancel your reservation, please contact us as soon as possible.</p>
          
          <a href="https://baharihotel.com/manage-booking/${booking.id}" class="button">Manage Booking</a>
        </div>
        
        <div class="footer">
          <p><strong>LA SAFARI HOTEL</strong><br>
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

function generatePaymentReceiptHTML(booking: any): string {
  const { rooms, packages } = booking;
  const room = rooms || { name: 'Selected Room' };
  const selectedPackage = packages || null;
  
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  
  const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const receiptDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Calculate the number of nights
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate a receipt number
  const receiptNumber = `RCT-${Date.now().toString().substring(0, 8)}`;
  
  // Determine payment method (default to M-Pesa if not specified)
  const paymentMethod = booking.payment_method || 'M-Pesa';
  
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
        .hotel-name {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #7b5800;
          text-transform: uppercase;
          letter-spacing: 1px;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="hotel-name">LA SAFARI HOTEL</div>
          <p>Your Coastal Paradise</p>
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
          
          ${booking.payment_status === 'paid' ? '<div class="paid-stamp">PAID</div>' : ''}
          
          <div class="receipt-info">
            <div class="detail-row">
              <span class="detail-label">Guest:</span>
              <span>${booking.guest_name}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span>${booking.id.substring(0, 8).toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room:</span>
              <span>${room.name}</span>
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
              <span>${nights}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Room rate:</span>
              <span>KES ${room.price?.toLocaleString() || 'N/A'} × ${nights} nights = KES ${((room.price || 0) * nights).toLocaleString()}</span>
            </div>
            
            ${selectedPackage ? `
            <div class="detail-row">
              <span class="detail-label">Package:</span>
              <span>${selectedPackage.name}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Package rate:</span>
              <span>KES ${selectedPackage.price_addon?.toLocaleString() || 'N/A'} × ${nights} nights = KES ${((selectedPackage.price_addon || 0) * nights).toLocaleString()}</span>
            </div>
            ` : ''}
            
            <div class="total-row">
              <span>Total Amount:</span>
              <span>KES ${booking.total_price.toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span>${paymentMethod}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span style="color: ${booking.payment_status === 'paid' ? 'green' : 'orange'}; font-weight: bold;">
                ${booking.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>
          
          <p>Thank you for choosing LA SAFARI HOTEL. We look forward to welcoming you!</p>
          
          <p><strong>Note:</strong> This is an electronic receipt. No physical copy will be sent.</p>
        </div>
        
        <div class="footer">
          <p><strong>LA SAFARI HOTEL</strong><br>
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
