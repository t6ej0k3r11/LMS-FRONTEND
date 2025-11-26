import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, User, BookOpen, CreditCard, Calendar, FileText, X } from "lucide-react";
import { paymentService } from "../services";
import { useToast } from "../hooks/use-toast";

function AdminPaymentDetailsModal({ paymentId, isOpen, onClose }) {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (paymentId && isOpen) {
      fetchPaymentDetails();
    }
  }, [paymentId, isOpen]);

  const fetchPaymentDetails = async () => {
    if (!paymentId) return;

    setLoading(true);
    try {
      const response = await paymentService.getAdminPaymentDetails(paymentId);
      if (response.success) {
        setPaymentDetails(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch payment details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "verified":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getMethodDisplayName = (method) => {
    const methodMap = {
      sslcommerz: "SSLCommerz",
      aamarpay: "aamarPay",
      bkash_manual: "bKash Manual",
      nagad_manual: "Nagad Manual",
      bank_transfer: "Bank Transfer",
      cash_office: "Office Cash",
    };
    return methodMap[method] || method.replace("_", " ").toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this payment transaction
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading payment details...</span>
          </div>
        ) : paymentDetails ? (
          <div className="space-y-6">
            {/* Payment ID and Status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Payment #{paymentDetails._id?.slice(-8)}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(paymentDetails.status)}>
                    {paymentDetails.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submission Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(paymentDetails.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(paymentDetails.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.userId?.userName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.userId?.userEmail || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium">Course Title</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentDetails.courseId?.title || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      ৳{paymentDetails.amount?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.currency || "BDT"}
                    </p>
                  </div>
                </div>
                <div className="border-t my-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      {getMethodDisplayName(paymentDetails.method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Transaction ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {paymentDetails.transactionId || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(paymentDetails.offlineProofURL || paymentDetails.adminNote || paymentDetails.referenceNote) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentDetails.offlineProofURL && (
                    <div>
                      <p className="text-sm font-medium mb-2">Payment Proof</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(paymentDetails.offlineProofURL, '_blank')}
                      >
                        View Proof Document
                      </Button>
                    </div>
                  )}
                  {paymentDetails.referenceNote && (
                    <div>
                      <p className="text-sm font-medium">Additional Notes</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {paymentDetails.referenceNote}
                      </p>
                    </div>
                  )}
                  {paymentDetails.adminNote && (
                    <div>
                      <p className="text-sm font-medium">Admin Note</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {paymentDetails.adminNote}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No payment details available</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

AdminPaymentDetailsModal.propTypes = {
  paymentId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminPaymentDetailsModal;