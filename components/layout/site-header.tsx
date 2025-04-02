"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUserRole } from "@/context/user-role";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin, isLoading } = useUserRole();

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-sm bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="hidden sm:flex h-10 w-10 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-800 items-center justify-center">
                <span className="text-white font-bold text-xl">LS</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-700 to-yellow-900">
                  LA SAFARI HOTEL
                </span>
                <p className="text-xs text-gray-500 hidden sm:block">Your Coastal Paradise</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { name: "Home", href: "/" },
              { name: "About Us", href: "/about" },
              { name: "Amenities", href: "/amenities" },
              { name: "Reservations", href: "/reservations" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-yellow-800 transition-colors group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button className="hidden sm:flex p-2 text-gray-500 hover:text-yellow-800 transition-colors">
              <Search size={20} />
            </button>

            {/* Authentication */}
            <SignedIn>
              {isAdmin && !isLoading && (
                <Link href="/admin">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-yellow-700 text-yellow-800 hover:bg-yellow-50 font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border-2 border-yellow-100"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <div className="hidden sm:flex items-center space-x-3">
                <Link href="/sign-in">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-yellow-700 text-yellow-800 hover:bg-yellow-50 font-medium"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-yellow-700 hover:bg-yellow-800 text-white shadow-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-yellow-800 hover:bg-yellow-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {[
              { name: "Home", href: "/" },
              { name: "About Us", href: "/about" },
              { name: "Amenities", href: "/amenities" },
              { name: "Reservations", href: "/reservations" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-800 hover:bg-yellow-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <SignedOut>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                <Link href="/sign-in">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-yellow-700 text-yellow-800 hover:bg-yellow-50"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full bg-yellow-700 hover:bg-yellow-800 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SignedOut>
            {isAdmin && !isLoading && (
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-yellow-700 text-yellow-800 hover:bg-yellow-50"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}