import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PropTypes from 'prop-types';

function PaymentHistory({ payments, loading, error, onRetry, onViewDetails }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      verified: { variant: "default", label: "Approved" },
      failed: { variant: "destructive", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Payment History</CardTitle>
          <p className="text-sm text-muted-foreground">View all your payment submissions and their status</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading payments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Payment History</CardTitle>
          <p className="text-sm text-muted-foreground">View all your payment submissions and their status</p>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to load payments"
            message={error}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Payment History</CardTitle>
          <p className="text-sm text-muted-foreground">View all your payment submissions and their status</p>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CreditCard}
            title="No Payments Yet"
            message="Your payment history will appear here once you make a purchase"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payment History</CardTitle>
        <p className="text-sm text-muted-foreground">View all your payment submissions and their status</p>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Additional Notes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-mono text-sm">{payment._id.slice(-8)}</TableCell>
                  <TableCell className="max-w-xs truncate">{payment.courseId?.title}</TableCell>
                  <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {payment.referenceNote || "—"}
                  </TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(payment._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

PaymentHistory.propTypes = {
  payments: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  onViewDetails: PropTypes.func.isRequired,
};

export default PaymentHistory;