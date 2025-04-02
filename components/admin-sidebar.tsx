"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  BedDoubleIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  SettingsIcon, 
  CalendarIcon, 
  Package2Icon,
  ImageIcon,
  LogOutIcon 
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      name: "Rooms",
      href: "/admin/rooms",
      icon: <BedDoubleIcon className="h-5 w-5" />,
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: <CalendarIcon className="h-5 w-5" />,
    },
    {
      name: "Packages",
      href: "/admin/packages",
      icon: <Package2Icon className="h-5 w-5" />,
    },
    {
      name: "Gallery",
      href: "/admin/gallery",
      icon: <ImageIcon className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];
  
  return (
    <div className="min-h-screen h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-yellow-700">Bahari Admin</h2>
        <p className="text-sm text-gray-500">Hotel Management System</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
              isActive(item.href)
                ? "bg-yellow-50 text-yellow-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className={`${isActive(item.href) ? "text-yellow-700" : "text-gray-500"} mr-3`}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Link 
          href="/admin/logout"
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-gray-500 mr-3">
            <LogOutIcon className="h-5 w-5" />
          </span>
          Logout
        </Link>
      </div>
    </div>
  );
}
