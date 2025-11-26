import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../../context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Users, BookOpen, Shield, Activity, LogOut, Search, MoreHorizontal, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight, Sparkles, CheckCircle, XCircle } from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { getAllUsersService, deleteUserService, deactivateUserService, reactivateUserService, getAdminStatsService, getRecentActivitiesService, getAllPaymentsService, updatePaymentStatusService } from "../../services";
import CourseManagement from "./course-management";
import AdminPaymentDetailsModal from "../../components/AdminPaymentDetailsModal";

function AdminDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // User management state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dashboard state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalAdmins: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Payment management state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentFilters, setPaymentFilters] = useState({
    method: "all",
    status: "all",
    page: 1,
    limit: 10,
  });
  const [totalPaymentPages, setTotalPaymentPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
      };
      const response = await getAllUsersService(params);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, toast]);

  // Handle user actions
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserService(selectedUser._id);
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await deactivateUserService(userId);
      toast({
        title: "Success",
        description: "User deactivated successfully.",
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      await reactivateUserService(userId);
      toast({
        title: "Success",
        description: "User reactivated successfully.",
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const [statsResponse, activitiesResponse] = await Promise.all([
        getAdminStatsService(),
        getRecentActivitiesService(10)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDashboardLoading(false);
    }
  }, [toast]);

  // Effect to fetch users when filters change
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  // Payment management functions
  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const params = {
        page: paymentFilters.page,
        limit: paymentFilters.limit,
      };
      if (paymentFilters.method !== "all") {
        params.method = paymentFilters.method;
      }
      if (paymentFilters.status !== "all") {
        params.status = paymentFilters.status;
      }
      const response = await getAllPaymentsService(params);
      setPayments(response.data.payments || []);
      setTotalPaymentPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentsLoading(false);
    }
  }, [paymentFilters, toast]);

  const handlePaymentStatusUpdate = async (paymentId, newStatus) => {
    try {
      await updatePaymentStatusService(paymentId, { status: newStatus });
      toast({
        title: "Success",
        description: `Payment ${newStatus} successfully.`,
      });
      fetchPayments();
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Effect to fetch dashboard data
  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardData();
    }
  }, [activeTab, fetchDashboardData]);

  // Effect to fetch payments when payments tab is active
  useEffect(() => {
    if (activeTab === "payments") {
      fetchPayments();
    }
  }, [activeTab, fetchPayments]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        {/* Header */}
        <div className="glass-effect rounded-[32px] border border-white/40 px-6 py-6 sm:px-10 sm:py-8 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Admin Command</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Welcome back, {auth?.user?.userName}! Keep DeshGory humming with thoughtful oversight and quick approvals.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-[hsl(var(--brand-red))]" />
                {stats.pendingCourses} pending items need review
              </div>
            </div>
            <Button variant="secondary" onClick={logout} className="rounded-full self-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[{
            title: "Total Users",
            value: stats.totalUsers,
            change: "+12%",
            icon: Users,
            accent: "bg-[hsla(var(--brand-green)/0.15)]"
          }, {
            title: "Total Courses",
            value: stats.totalCourses,
            change: "+8%",
            icon: BookOpen,
            accent: "bg-[hsla(var(--brand-red)/0.15)]"
          }, {
            title: "Pending Courses",
            value: stats.pendingCourses,
            change: "Needs review",
            icon: Shield,
            accent: "bg-[hsla(var(--brand-gold)/0.2)]"
          }, {
            title: "Active Admins",
            value: stats.totalAdmins,
            change: "Core team",
            icon: Activity,
            accent: "bg-[hsla(var(--brand-green)/0.12)]"
          }].map((card) => (
            <Card
              key={card.title}
              className="rounded-3xl border-white/60 bg-white/85 shadow-[0_25px_60px_rgba(5,41,30,0.12)] transition-transform duration-300 hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{card.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{card.change}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.accent}`}>
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="glass-effect border border-white/40 grid w-full grid-cols-2 sm:grid-cols-5 rounded-2xl p-1">
            {[
              { value: "overview", label: "Overview" },
              { value: "users", label: "User Management" },
              { value: "courses", label: "Course Approval" },
              { value: "payments", label: "Payment Management" },
              { value: "audit", label: "Audit Logs" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-2xl text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {dashboardLoading ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading dashboard data...</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No recent activities</p>
                    ) : (
                      recentActivities.map((activity) => (
                        <div key={activity._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{activity.action.replace('_', ' ').toUpperCase()}</Badge>
                              <span className="text-sm text-gray-600">{activity.targetName}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleString()} by {activity.adminName}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="instructor">Instructors</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Students Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Students</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Enrollment Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : users.filter(user => user.role === 'student').length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No students found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.filter(user => user.role === 'student').map((user) => (
                            <TableRow key={user._id}>
                              <TableCell className="font-mono text-sm">{user._id.slice(-8)}</TableCell>
                              <TableCell>{user.userName}</TableCell>
                              <TableCell>{user.userEmail}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(user.enrollmentDate)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {user.status === 'active' ? (
                                      <DropdownMenuItem onClick={() => handleDeactivateUser(user._id)}>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleReactivateUser(user._id)}>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Reactivate
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setDeleteDialogOpen(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Instructors Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Instructors</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Hire Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : users.filter(user => user.role === 'instructor').length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No instructors found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.filter(user => user.role === 'instructor').map((user) => (
                            <TableRow key={user._id}>
                              <TableCell className="font-mono text-sm">{user._id.slice(-8)}</TableCell>
                              <TableCell>{user.userName}</TableCell>
                              <TableCell>{user.userEmail}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(user.hireDate)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {user.status === 'active' ? (
                                      <DropdownMenuItem onClick={() => handleDeactivateUser(user._id)}>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleReactivateUser(user._id)}>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Reactivate
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setDeleteDialogOpen(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user
                    {selectedUser && ` "${selectedUser.userName}"`} and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <p className="text-sm text-muted-foreground">Review and manage student payment submissions</p>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Select
                    value={paymentFilters.method}
                    onValueChange={(value) => setPaymentFilters(prev => ({ ...prev, method: value, page: 1 }))}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="office_cash">Office Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={paymentFilters.status}
                    onValueChange={(value) => setPaymentFilters(prev => ({ ...prev, status: value, page: 1 }))}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payments Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                            Loading payments...
                          </TableCell>
                        </TableRow>
                      ) : payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell className="font-mono text-sm">{payment._id.slice(-8)}</TableCell>
                            <TableCell>{payment.userId?.userName}</TableCell>
                            <TableCell className="max-w-xs truncate">{payment.courseId?.title}</TableCell>
                            <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                            <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === 'verified' ? 'default' :
                                  payment.status === 'failed' ? 'destructive' : 'secondary'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(payment.createdAt)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {payment.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handlePaymentStatusUpdate(payment._id, 'verified')}
                                        className="text-green-600"
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handlePaymentStatusUpdate(payment._id, 'failed')}
                                        className="text-red-600"
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPayment(payment._id);
                                      setIsPaymentModalOpen(true);
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPaymentPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={paymentFilters.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {paymentFilters.page} of {totalPaymentPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentFilters(prev => ({ ...prev, page: Math.min(totalPaymentPages, prev.page + 1) }))}
                      disabled={paymentFilters.page === totalPaymentPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="rounded-[30px] border-white/60 bg-white/90 shadow-[0_30px_70px_rgba(9,42,31,0.14)]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Audit Logs</CardTitle>
                <p className="text-sm text-muted-foreground">Trace every administrative action performed inside the platform.</p>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    No audit entries recorded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity._id}
                        className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Badge variant="outline" className="uppercase tracking-wide">
                              {activity.action?.replace?.("_", " ") || "ACTION"}
                            </Badge>
                            <span className="text-muted-foreground">{activity.targetName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Executed by <span className="font-semibold text-foreground">{activity.adminName}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Details Modal */}
        <AdminPaymentDetailsModal
          paymentId={selectedPayment}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPayment(null);
          }}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;