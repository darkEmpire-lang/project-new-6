import React from 'react';
import { assets } from '../assets/assets';  // Assuming assets.about_img is correctly set

const About = () => {
  return (
    <div className="bg-gray-50 py-12 px-6">
      <div className="container mx-auto text-center">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-12">
          <div className="w-full md:w-1/2 mb-6 md:mb-0">
            <img
              src={assets.front1} // Use the imported image
              alt="Handmade Crafts"
              className="w-full md:w-4/5 h-auto rounded-lg shadow-lg transform transition duration-500 hover:scale-105"
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Welcome to Crafted with Love - Handmade Creations
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Discover the beauty of handmade products crafted with love, care, and passion. Each item
              is unique, from personalized gifts to home décor, designed to bring warmth and character to
              your home.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Shop Now
            </button>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Our Story</h2>
          <p className="text-lg text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
            At Crafted with Love, we believe in the artistry and authenticity of handmade creations.
            Our journey began with a deep appreciation for the craft of handmaking – each product tells a
            story, embodies creativity, and carries the spirit of the maker. We are passionate about
            supporting artisans and offering you one-of-a-kind products that are both functional and beautiful.
          </p>
        </div>

        {/* Our Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Our Values</h2>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="text-center w-full md:w-1/3 max-w-xs">
              <i className="fas fa-handshake text-green-600 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Authenticity</h3>
              <p className="text-gray-600">
                Each piece is created with passion and care, ensuring it’s as unique as the person who owns it.
              </p>
            </div>
            <div className="text-center w-full md:w-1/3 max-w-xs">
              <i className="fas fa-palette text-green-600 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Creativity</h3>
              <p className="text-gray-600">
                We believe in the power of creativity, offering products that reflect imagination, beauty, and skill.
              </p>
            </div>
            <div className="text-center w-full md:w-1/3 max-w-xs">
              <i className="fas fa-heart text-green-600 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Passion</h3>
              <p className="text-gray-600">
                Passion drives us to create products that bring joy, comfort, and style into your everyday life.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-12 bg-gray-800">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Join the Crafted with Love Community!
          </h2>
          <p className="text-lg text-white text-center mb-6">
            Stay updated on the latest handcrafted creations, exclusive discounts, and more! Subscribe to our newsletter
            and become part of our growing family.
          </p>
          <div className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-l-lg border-2 border-gray-300 w-1/3"
            />
            <button className="bg-white text-black px-6 py-3 rounded-r-lg hover:bg-gray-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;