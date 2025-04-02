// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Activity, 
  BedDouble, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Package, 
  Users,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";
import { ResponsiveBar } from '@nivo/bar';

// Types for dashboard data
interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  pendingBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  roomCount: number;
  packageCount: number;
  recentBookings: any[];
  bookingTrend: number; // percentage change
  revenueTrend: number; // percentage change
}

interface ChartData {
  labels: string[];
  data: number[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    roomCount: 0,
    packageCount: 0,
    recentBookings: [],
    bookingTrend: 0,
    revenueTrend: 0
  });
  const [timeframe, setTimeframe] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to generate revenue data for the selected timeframe
  const generateRevenueData = async (timeframe: string) => {
    const now = new Date();
    let startDate = new Date();
    let labels: string[] = [];
    
    switch(timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        labels = Array.from({length: 7}, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        labels = Array.from({length: 30}, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (29 - i));
          return date.getDate().toString();
        });
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        labels = Array.from({length: 12}, (_, i) => {
          const date = new Date(now);
          date.setMonth(now.getMonth() - (11 - i));
          return date.toLocaleDateString('en-US', { month: 'short' });
        });
        break;
    }

    const { data: bookings, error } = await supabaseClient
      .from('bookings')
      .select('created_at, total_price')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())
      .eq('status', 'confirmed');

    if (error) {
      console.error('Error fetching revenue data:', error);
      return { labels, data: labels.map(() => 0) };
    }

    const revenueByDate = new Map();
    labels.forEach((_, index) => {
      const date = new Date(now);
      switch(timeframe) {
        case 'week':
          date.setDate(date.getDate() - (6 - index));
          break;
        case 'month':
          date.setDate(date.getDate() - (29 - index));
          break;
        case 'year':
          date.setMonth(now.getMonth() - (11 - index));
          break;
      }
      revenueByDate.set(date.toDateString(), 0);
    });

    bookings?.forEach((booking) => {
      const bookingDate = new Date(booking.created_at).toDateString();
      if (revenueByDate.has(bookingDate)) {
        revenueByDate.set(bookingDate, (revenueByDate.get(bookingDate) || 0) + booking.total_price);
      }
    });

    const data = Array.from(revenueByDate.values());
    return { labels, data };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get today's date in ISO format
        const today = new Date().toISOString().split('T')[0];

        // Fetch total bookings count
        const { count: totalBookings, error: bookingsError } = await supabaseClient
          .from('bookings')
          .select('*', { count: 'exact', head: true });

        if (bookingsError) throw bookingsError;

        // Fetch pending bookings
        const { count: pendingBookings, error: pendingError } = await supabaseClient
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (pendingError) throw pendingError;

        // Fetch room count
        const { count: roomCount, error: roomsError } = await supabaseClient
          .from('rooms')
          .select('*', { count: 'exact', head: true });

        if (roomsError) throw roomsError;

        // Fetch package count
        const { count: packageCount, error: packagesError } = await supabaseClient
          .from('packages')
          .select('*', { count: 'exact', head: true });

        if (packagesError) throw packagesError;

        // Fetch today's check-ins
        const { count: todayCheckIns, error: checkInsError } = await supabaseClient
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('check_in_date', today);

        if (checkInsError) throw checkInsError;

        // Fetch today's check-outs
        const { count: todayCheckOuts, error: checkOutsError } = await supabaseClient
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('check_out_date', today);

        if (checkOutsError) throw checkOutsError;

        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabaseClient
          .from('bookings')
          .select('total_price')
          .eq('status', 'confirmed');

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData.reduce((sum, booking) => sum + booking.total_price, 0);

        // Calculate occupancy rate (simplified)
        // In a real app, you'd need to calculate this based on actual room availability per day
        const occupancyRate = roomCount ? Math.min(95, (totalBookings / (roomCount * 30)) * 100) : 0;

        // Fetch recent bookings
        const { data: recentBookings, error: recentError } = await supabaseClient
          .from('bookings')
          .select(`
            id,
            guest_name,
            check_in_date,
            check_out_date,
            total_price,
            status,
            payment_status,
            created_at,
            rooms:room_id (name),
            packages:package_id (name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // Calculate booking and revenue trends (mock data for demonstration)
        // In a real app, you would compare current period to previous period
        const bookingTrend = 8.2; // 8.2% increase
        const revenueTrend = 12.5; // 12.5% increase

        // Add revenue chart data
        const revenueChartData = await generateRevenueData(timeframe);
        setChartData(revenueChartData);

        setStats({
          totalBookings: totalBookings || 0,
          totalRevenue,
          occupancyRate,
          pendingBookings: pendingBookings || 0,
          todayCheckIns: todayCheckIns || 0,
          todayCheckOuts: todayCheckOuts || 0,
          roomCount: roomCount || 0,
          packageCount: packageCount || 0,
          recentBookings: recentBookings || [],
          bookingTrend,
          revenueTrend
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Hotel management system overview and statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs 
            defaultValue="week" 
            className="w-auto" 
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {stats.revenueTrend > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={stats.revenueTrend > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(stats.revenueTrend)}%
              </span>
              from last {timeframe}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stats.bookingTrend > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{stats.bookingTrend}% increase</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(stats.bookingTrend)}% decrease</span>
                </>
              )}
              &nbsp;from previous {timeframe}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <div className="text-xs text-amber-500 mt-1">
              Needs attention
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-12">
        <Card className="col-span-full lg:col-span-8">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Revenue trends for {timeframe}</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData && (
              <div className="h-[300px]">
                <ResponsiveBar
                  data={chartData.data.map((value, index) => ({
                    date: chartData.labels[index],
                    revenue: value
                  }))}
                  keys={['revenue']}
                  indexBy="date"
                  margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: 'blues' }}
                  axisLeft={{
                    format: (value) => `KSh ${value/1000}k`
                  }}
                  axisBottom={{
                    tickRotation: -45
                  }}
                  enableLabel={false}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentBookings.map((booking, i) => (
              <div key={booking.id} className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{booking.guest_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.rooms?.name} • {new Date(booking.check_in_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(booking.total_price)}
                  </p>
                  <p className={`text-xs ${
                    booking.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/admin/bookings">
                View all bookings
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick access buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/rooms" passHref>
          <Button variant="outline" className="w-full h-[80px] justify-start px-6 hover:bg-gray-50 dark:hover:bg-gray-900">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-1">
                <BedDouble className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Manage Rooms</span>
              </div>
              <span className="text-xs text-muted-foreground">View and edit room inventory</span>
            </div>
          </Button>
        </Link>
        
        <Link href="/admin/packages" passHref>
          <Button variant="outline" className="w-full h-[80px] justify-start px-6 hover:bg-gray-50 dark:hover:bg-gray-900">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-1">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-medium">Manage Packages</span>
              </div>
              <span className="text-xs text-muted-foreground">Configure special offerings</span>
            </div>
          </Button>
        </Link>
        
        <Link href="/admin/bookings" passHref>
          <Button variant="outline" className="w-full h-[80px] justify-start px-6 hover:bg-gray-50 dark:hover:bg-gray-900">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-1">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                <span className="font-medium">Manage Bookings</span>
              </div>
              <span className="text-xs text-muted-foreground">Process reservations and payments</span>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
