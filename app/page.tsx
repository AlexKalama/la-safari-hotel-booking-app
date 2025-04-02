"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      {/* Hero Section with Beach Image Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Beach Image Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/images/beach-paradise.jpg"
            alt="Beach Paradise"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay to darken the image and improve text readability */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white shadow-text">LA SAFARI HOTEL</h1>
          <h2 className="text-xl md:text-3xl font-medium mb-8 shadow-text">Where Luxury Meets Adventure</h2>
          <p className="max-w-lg mx-auto text-gray-200 mb-10 shadow-text">
            Welcome to LA SAFARI HOTEL! Located in the beautiful coastal city of Mombasa, Kenya, 
            we offer a unique blend of comfort and serenity. Immerse yourself in the vibrant culture, 
            stunning landscapes, and warm hospitality that make us a perfect getaway.
          </p>
          <Link href="/reservations">
            <Button size="lg" className="bg-yellow-700 hover:bg-yellow-800 text-lg px-8 py-6">
              Book Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-yellow-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-yellow-900 mb-10 text-center">
            Our Amenities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Restaurant & Bar",
                description: "Enjoy fine dining and refreshing beverages in our elegant restaurant and bar.",
                image: "/images/Restaurant.jpg",
              },
              {
                title: "Spa",
                description: "Indulge in a soothing retreat at our spa, offering a range of rejuvenating treatments.",
                image: "/images/spa.jpg",
              },
              {
                title: "Event Spaces",
                description: "Make lasting memories in our large versatile event spaces, perfect for any occasion.",
                image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
              },
              {
                title: "Pools",
                description: "Experience tranquility in our captivating pools, ideal for a rejuvenating swim.",
                image: "/images/pools.jpg",
              },
              {
                title: "Accommodations",
                description: "Unwind in our plush accommodations, thoughtfully designed for your comfort and relaxation.",
                image: "/images/rooms.jpg",
              },
              {
                title: "Recreation & Activities",
                description: "Engage in a variety of fun-filled recreational activities, designed for your entertainment and leisure.",
                image: "/images/recreation.jpg",
              },
            ].map((amenity, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <Image
                    src={amenity.image}
                    alt={amenity.title}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{amenity.title}</CardTitle>
                  <CardDescription>{amenity.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-2/3">
              <h2 className="text-4xl font-bold mb-6">How can we help you?</h2>
              <p className="text-gray-400 mb-8 md:mb-0 md:pr-8">
                For any inquiries or assistance, please don't hesitate to reach out to us. We're here to help!
              </p>
            </div>
            <div>
              <Link href="/reservations">
                <Button size="lg" className="bg-yellow-700 hover:bg-yellow-600">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}