import React from 'react';
import { assets } from '../assets/assets';  // Ensure the import for contact image is correct

const Contact = () => {
  return (
    <div className="bg-gradient-to-r from-green-200 to-blue-200 py-12 px-6">
      <div className="container mx-auto text-center">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-12 bg-white shadow-lg rounded-lg p-6">
          <div className="w-full md:w-1/2 mb-6 md:mb-0">
            <img
              src={assets.n2} // Using the imported image for contact section
              alt="Contact Us"
              className="w-4/5 h-auto rounded-lg shadow-lg transform transition duration-500 hover:scale-105 mx-auto"
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch with Us!</h2>
            <p className="text-lg text-gray-600 mb-4">
              We’d love to hear from you! Whether you have a question about our handmade products, need assistance, or simply want to connect, feel free to reach out. We're here to help and share the love of craftsmanship.
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mb-16 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Contact Form</h2>
          <form className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="w-full md:w-1/2">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                rows="5"
                className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-6">Our Contact Information</h2>
          <div className="flex flex-wrap justify-center gap-12 text-white">
            <div className="text-center w-1/3 max-w-xs">
              <i className="fas fa-phone-alt text-green-600 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p>+1 (234) 567-890</p>
            </div>
            <div className="text-center w-1/3 max-w-xs">
              <i className="fas fa-envelope text-green-600 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p>contact@craftedwithlove.com</p>
            </div>
            <div className="text-center w-1/3 max-w-xs">
              <i className="fas fa-map-marker-alt text-green-600 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Address</h3>
              <p>123 Handmade Ave, Craft City, Country</p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-12 rounded-lg bg-green-600">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Stay Connected with Us!</h2>
          <p className="text-lg text-white text-center mb-6">
            Want to stay updated on new handmade collections, promotions, and more? Subscribe to our newsletter and join the Crafted with Love family!
          </p>
          <div className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-l-lg border-2 border-gray-300 w-1/3"
            />
            <button className="bg-white text-black px-6 py-3 rounded-r-lg hover:bg-gray-200 transition duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;