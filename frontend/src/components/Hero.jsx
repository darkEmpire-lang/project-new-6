import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";

// Handmade product images
const images = [
  assets.n2,
  assets.n1,
]; // Replace with actual handmade product images

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row border border-gray-300 overflow-hidden h-[75vh] bg-[#f8f1e4] w-full">
      {/* Hero left side */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center px-6 sm:px-12">
        <div className="text-center sm:text-left text-[#5a4235]">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <p className="w-10 h-[2px] bg-[#5a4235]"></p>
            <p className="font-medium text-xs md:text-sm uppercase tracking-wide">
              Unique Handmade Creations
            </p>
          </div>
          <h1 className="prata-regular text-3xl sm:text-4xl lg:text-5xl leading-snug font-bold mt-3">
            Crafted with Love & Passion
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Discover one-of-a-kind, artisanal treasures made with care and tradition.
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
            <button className="px-6 py-2 bg-[#5a4235] text-white font-semibold text-sm uppercase rounded-full shadow-md hover:bg-[#6b4e3f] transition duration-300">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Hero right side with image transitions */}
      <div className="w-full sm:w-1/2 relative h-full">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 rounded-xl shadow-lg ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
