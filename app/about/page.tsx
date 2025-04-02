"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const milestones = [
  {
    year: "2010",
    title: "Our Beginning",
    description: "La Safari Hotel opened its doors, bringing luxury hospitality to Mombasa's coastline.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    year: "2015",
    title: "Major Expansion",
    description: "Added new wings and modern amenities to enhance guest experience.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    year: "2018",
    title: "Award Recognition",
    description: "Received multiple awards for excellence in hospitality and service.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    year: "2020",
    title: "Sustainability Initiative",
    description: "Launched eco-friendly programs and sustainable practices.",
    image: "/Images/rooms.jpg"
  },
  {
    year: "2023",
    title: "Digital Transformation",
    description: "Implemented state-of-the-art booking and management systems.",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80"
  }
];

const executives = [
  {
    name: "Alex Kalama",
    title: "Chief Executive Officer",
    description: "With over 15 years of experience in luxury hospitality, Alex leads La Safari Hotel with a vision for innovation and excellence.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    name: "Linah Mamito",
    title: "Chief Operations Officer",
    description: "Linah brings her expertise in operational excellence and guest satisfaction to ensure the highest standards of service.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80"
  },
  {
    name: "David Mwangi",
    title: "Chief Financial Officer",
    description: "A seasoned financial expert ensuring sustainable growth and strategic investments for the hotel's future.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    name: "Sarah Omondi",
    title: "Director of Guest Experience",
    description: "Dedicated to creating unforgettable moments and ensuring every guest feels special during their stay.",
    image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  }
];

const values = [
  {
    title: "Excellence",
    description: "We are committed to delivering exceptional service and experiences that exceed our guests' expectations.",
    icon: "⭐"
  },
  {
    title: "Sustainability",
    description: "We prioritize environmental responsibility and sustainable practices in all aspects of our operations.",
    icon: "🌱"
  },
  {
    title: "Community",
    description: "We believe in supporting and enriching our local community through meaningful partnerships and engagement.",
    icon: "🤝"
  }
];

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

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
          alt="La Safari Hotel"
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
              Our Story
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl text-xl text-gray-200"
          >
            Experience the perfect blend of luxury and coastal charm at La Safari Hotel
          </motion.p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-yellow-800">Our Purpose</h2>
          <p className="text-gray-600 mb-8">
            At La Safari Hotel, we're driven by a commitment to excellence and a passion for creating unforgettable experiences.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-2xl font-bold mb-4 text-yellow-700">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide exceptional hospitality experiences that celebrate the rich
                coastal culture of Mombasa while ensuring sustainable practices and
                community engagement.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-2xl font-bold mb-4 text-yellow-700">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading luxury hotel destination on the Kenyan coast,
                recognized for our commitment to excellence, innovation in hospitality,
                and dedication to environmental stewardship.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-yellow-800">Our Journey</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              From our humble beginnings to becoming a leading luxury destination, every milestone shapes our commitment to excellence.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-yellow-200" />

            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex items-center justify-between mb-8 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <span className="text-yellow-600 font-bold text-lg">{milestone.year}</span>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 rounded-full border-4 border-yellow-200 bg-yellow-600" />
                </div>
                <div className={`w-5/12 ${index % 2 === 0 ? "pl-8" : "pr-8"}`}>
                  <div className="relative h-32 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={milestone.image}
                      alt={milestone.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Team */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-yellow-800">Our Leadership</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Meet the visionary leaders who guide La Safari Hotel towards excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {executives.map((executive, index) => (
              <motion.div
                key={executive.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative h-80 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={executive.image}
                    alt={executive.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold">{executive.name}</h3>
                    <p className="text-yellow-400 font-medium">{executive.title}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{executive.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-yellow-800">Our Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our core values guide every decision we make and every service we provide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <span className="text-4xl mb-4 block">{value.icon}</span>
                <h3 className="text-xl font-bold mb-4 text-yellow-700">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
