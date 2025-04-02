"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Error sending contact form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
          alt="Contact LA SAFARI HOTEL"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
          >
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-700 bg-clip-text text-transparent">
              Connect With Us
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl text-xl text-gray-200"
          >
            Your luxury experience begins with a conversation
          </motion.p>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="container mx-auto px-4 py-12 -mt-20 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Reservations",
              icon: "📞",
              details: [
                "+254 123 456 789",
                "reservations@lasafarihotel.com",
                "24/7 Support Available"
              ]
            },
            {
              title: "Physical Address",
              icon: "📍",
              details: [
                "LA SAFARI HOTEL",
                "Beach Road, Malindi",
                "Kenya, East Africa"
              ]
            },
            {
              title: "Business Inquiries",
              icon: "💼",
              details: [
                "+254 987 654 321",
                "business@lasafarihotel.com",
                "Mon-Fri, 9am-5pm EAT"
              ]
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border-t-4 border-yellow-600"
            >
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-xl font-bold mb-3 text-yellow-800">{item.title}</h3>
              <ul className="text-gray-600">
                {item.details.map((detail, i) => (
                  <li key={i} className="mb-2">{detail}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Contact Form and Map Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6 text-yellow-800">Send Us a Message</h2>
            
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">
                  Your message has been received. A member of our team will be in touch with you shortly.
                </p>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "",
                      message: ""
                    });
                  }}
                  className="px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="+254 123 456 789"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject*
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="Reservation Inquiry">Reservation Inquiry</option>
                      <option value="Special Request">Special Request</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Wedding Inquiry">Wedding Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 bg-yellow-700 text-white rounded-md font-medium flex items-center ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:bg-yellow-800"
                    } transition-colors`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Map */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative h-[500px] rounded-lg overflow-hidden shadow-lg"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4127.422268320622!2d39.59065409415366!3d-4.2709867620975235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18404644fa78e335%3A0xbf14ac959d641957!2sSouthern%20Palms%20Beach%20Resort!5e0!3m2!1sen!2ske!4v1743407837107!5m2!1sen!2ske" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs text-center">
                <h3 className="text-xl font-bold mb-2 text-yellow-800">Find Us</h3>
                <p className="text-gray-600 mb-4">
                  Located on the pristine beaches of Diani, LA SAFARI HOTEL offers easy access to both natural beauty and urban conveniences.
                </p>
                <a 
                  href="https://maps.app.goo.gl/GzgKVBQDQwj5qJ6u8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-yellow-700 text-white rounded-md inline-block hover:bg-yellow-800 transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Concierge Section */}
      <div className="bg-gray-50 py-20 mt-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-6 text-yellow-800">Personal Concierge Service</h2>
            <p className="text-lg text-gray-600 mb-8">
              For our most discerning guests, we offer a dedicated personal concierge who can assist with special requests, custom itineraries, and exclusive experiences.
            </p>
            <div className="flex justify-center">
              <a 
                href="tel:+254123456789" 
                className="px-6 py-3 bg-yellow-700 text-white rounded-md font-medium hover:bg-yellow-800 transition-colors inline-flex items-center mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Concierge
              </a>
              <a 
                href="mailto:concierge@lasafarihotel.com" 
                className="px-6 py-3 bg-white text-yellow-800 border border-yellow-700 rounded-md font-medium hover:bg-yellow-50 transition-colors inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Concierge
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-800">Connect With Us</h2>
          <p className="text-gray-600 mb-8">
            Follow us on social media for exclusive offers, behind-the-scenes glimpses, and to join our community of luxury travelers.
          </p>
          <div className="flex justify-center space-x-6">
            {[
              { name: "Facebook", icon: "fab fa-facebook-f" },
              { name: "Instagram", icon: "fab fa-instagram" },
              { name: "Twitter", icon: "fab fa-twitter" },
              { name: "LinkedIn", icon: "fab fa-linkedin-in" }
            ].map((social, index) => (
              <a
                key={index}
                href="#"
                className="w-12 h-12 rounded-full bg-yellow-700 text-white flex items-center justify-center hover:bg-yellow-800 transition-colors"
                aria-label={social.name}
              >
                <i className={social.icon}></i>
                {/* Fallback for icons */}
                <span className="text-sm">{social.name.charAt(0)}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <div className="bg-yellow-700 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-yellow-100 mb-8">
            Subscribe to our newsletter for exclusive offers, special events, and insider tips on making the most of your stay.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 rounded-md flex-grow max-w-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button className="px-6 py-3 bg-white text-yellow-800 rounded-md font-medium hover:bg-yellow-100 transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </form>
          <p className="text-xs text-yellow-200 mt-4">
            By subscribing, you agree to our privacy policy and consent to receive updates from our hotel.
          </p>
        </div>
      </div>
    </div>
  );
}
