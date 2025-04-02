// @ts-nocheck
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define amenity types
const amenities = [
  {
    name: "Infinity Pool",
    description: "Immerse yourself in our breathtaking infinity pool overlooking the pristine beaches of the Indian Ocean. The perfect place to unwind and soak in the coastal beauty.",
    image: "/images/amenities/infinity-pool.jpg",
    imageFallback: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
    icon: "🏊‍♂️"
  },
  {
    name: "Spa & Wellness",
    description: "Rejuvenate your body and mind in our world-class spa offering traditional and modern treatments inspired by African healing traditions.",
    image: "/images/amenities/spa.jpg",
    imageFallback: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    icon: "💆‍♀️"
  },
  {
    name: "Fine Dining",
    description: "Experience exquisite culinary journeys at our signature restaurants, offering a fusion of local flavors and international cuisine prepared by world-renowned chefs.",
    image: "/images/amenities/restaurant.jpg",
    imageFallback: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    icon: "🍽️"
  },
  {
    name: "Private Beach",
    description: "Enjoy exclusive access to our pristine private beach with personalized service, luxury cabanas, and water sports facilities.",
    image: "/images/amenities/beach.jpg",
    imageFallback: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    icon: "🏖️"
  },
  // {
  //   name: "Event Spaces",
  //   description: "Host unforgettable gatherings in our sophisticated event venues with stunning views, state-of-the-art technology, and impeccable service.",
  //   image: "/images/amenities/event-space.jpg",
  //   imageFallback: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
  //   icon: "🎉"
  // },
  {
    name: "Fitness Center",
    description: "Maintain your fitness routine in our state-of-the-art gym featuring the latest equipment and personal training services available upon request.",
    image: "/images/amenities/fitness.jpg",
    imageFallback: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    icon: "💪"
  },
  {
    name: "Business Center",
    description: "Stay connected and productive in our fully-equipped business center with high-speed internet, meeting rooms, and secretarial services.",
    image: "/images/amenities/business.jpg",
    imageFallback: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
    icon: "💼"
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

export default function AmenitiesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
          alt="Luxury Hotel Amenities"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
          >
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-700 bg-clip-text text-transparent">
              Exceptional Amenities
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl text-xl text-gray-200"
          >
            Discover the pinnacle of luxury and comfort with our world-class facilities
          </motion.p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-yellow-800">Experience Unparalleled Luxury</h2>
          <p className="text-gray-600">
            At LA SAFARI HOTEL, we pride ourselves on offering an unmatched selection of amenities designed to elevate your stay to new heights of comfort and luxury. Every detail has been meticulously crafted to ensure your experience with us is nothing short of extraordinary.
          </p>
        </div>
        <div className="border-t border-b border-yellow-200 py-8 grid grid-cols-3 md:grid-cols-6 gap-6 text-center">
          {['Complimentary WiFi', 'Room Service', '24/7 Concierge', 'Airport Transfers', 'Childcare', 'Valet Parking'].map((service, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-yellow-700 font-medium text-sm">{service}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Amenities Grid */}
      <div className="bg-gray-50 py-2">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {amenities.map((amenity, index) => {
              const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.1
              });

              return (
                <motion.div
                  key={amenity.name}
                  ref={ref}
                  variants={itemVariants}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={amenity.imageFallback}
                      alt={amenity.name}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <h3 className="text-white text-2xl font-bold p-6">
                        <span className="mr-2">{amenity.icon}</span>
                        {amenity.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">{amenity.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>



      {/* Event Spaces Feature Section */}
      <div className="bg-white py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-yellow-800">Exceptional Event Venues</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              From intimate gatherings to grand celebrations, our versatile event spaces provide the perfect backdrop for your special occasions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-xl overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                alt="Ballroom"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-bold mb-2">Grand Ballroom</h3>
                <p className="text-white/90 mb-4">Perfect for weddings and galas with capacity for up to 300 guests</p>
                <button className="bg-yellow-700 text-white px-4 py-2 rounded-md w-max hover:bg-yellow-800 transition-colors">
                  Explore Venue
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative h-[190px] rounded-xl overflow-hidden shadow-lg"
              >
                <Image
                  src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Conference Room"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-lg font-bold mb-1">Executive Boardroom</h3>
                  <p className="text-white/90 text-sm">State-of-the-art facilities for up to 20 participants</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative h-[190px] rounded-xl overflow-hidden shadow-lg"
              >
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Beachfront Venue"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-lg font-bold mb-1">Beachfront Terrace</h3>
                  <p className="text-white/90 text-sm">Breathtaking ocean views for memorable celebrations</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-white border-2 border-yellow-700 text-yellow-800 rounded-md font-medium hover:bg-yellow-50 transition-colors">
              View All Event Spaces
            </button>
          </div>
        </div>
      </div>


      {/* Call to Action */}
      <div className="bg-yellow-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Book Your Luxury Experience Today</h2>
          <p className="max-w-2xl mx-auto mb-8 text-yellow-100">
            Indulge in the epitome of luxury and comfort. Reserve your stay now and experience our world-class amenities firsthand.
          </p>
          <Link href="/reservations">
            <Button className="px-8 py-3 bg-white text-yellow-800 rounded-lg font-semibold hover:bg-yellow-100 transition-colors shadow-lg">
              Book Your Stay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
