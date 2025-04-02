"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardPage from "./dashboard-page";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex-1 space-y-4">
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <DashboardPage />
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
              <p className="text-muted-foreground">
                Manage your hotel room inventory
              </p>
            </div>
            <Link href="/admin/rooms" passHref>
              <Button>Go to Rooms Management</Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
              <p className="text-muted-foreground">
                Manage reservations and guest bookings
              </p>
            </div>
            <Link href="/admin/bookings" passHref>
              <Button>Go to Bookings Management</Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="packages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Packages</h2>
              <p className="text-muted-foreground">
                Manage special offers and packages
              </p>
            </div>
            <Link href="/admin/packages" passHref>
              <Button>Go to Packages Management</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
