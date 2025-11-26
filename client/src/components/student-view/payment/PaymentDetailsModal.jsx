import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaymentDetailsService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

function PaymentDetailsModal({ paymentId, isOpen, onClose }) {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPaymentDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPaymentDetailsService(paymentId);
      if (response?.success) {
        setPaymentDetails(response.data);
      } else {
        throw new Error(response.message || "Failed to load payment details");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load payment details",
        variant: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [paymentId, toast, onClose]);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending", icon: Clock, color: "text-yellow-600" },
      approved: { variant: "default", label: "Approved", icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle, color: "text-red-600" },
      verified: { variant: "default", label: "Approved", icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive", label: "Rejected", icon: XCircle, color: "text-red-600" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPaymentProof = () => {
    if (!paymentDetails?.offlineProofURL) return null;

    const isImage = paymentDetails.offlineProofURL?.match(/\.(jpg|jpeg|png|gif)$/i);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment Proof
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isImage ? (
            <div className="space-y-4">
              <img
                src={paymentDetails.offlineProofURL}
                alt="Payment proof"
                className="max-w-full h-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
              <p className="text-sm text-muted-foreground">
                Uploaded on {formatDate(paymentDetails.createdAt)}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Payment Receipt</p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {formatDate(paymentDetails.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(paymentDetails.offlineProofURL, "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
            View detailed information about your payment
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading payment details...</span>
          </div>
        ) : paymentDetails ? (
           <div className="space-y-6">
             {/* Payment Status */}
             <Card>
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold">{paymentDetails.course?.title}</h3>
                     <p className="text-muted-foreground">Payment ID: {paymentDetails._id.slice(-8)}</p>
                   </div>
                   {getStatusBadge(paymentDetails.status)}
                 </div>
               </CardContent>
             </Card>

             {/* Payment Information */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Payment Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Amount:</span>
                     <span className="font-semibold">৳{paymentDetails.amount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Method:</span>
                     <span className="capitalize">{paymentDetails.method.replace('_', ' ')}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Date:</span>
                     <span>{formatDate(paymentDetails.createdAt)}</span>
                   </div>
                   {paymentDetails.transactionId && (
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Transaction ID:</span>
                       <span className="font-mono text-sm">{paymentDetails.transactionId}</span>
                     </div>
                   )}
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Personal Information</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Name:</span>
                     <span>{paymentDetails.student?.name}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Mobile:</span>
                     <span>{paymentDetails.student?.mobile}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Email:</span>
                     <span>{paymentDetails.student?.email}</span>
                   </div>
                 </CardContent>
               </Card>
             </div>

             {/* Additional Notes */}
             {paymentDetails.referenceNote && (
               <Card className="border-blue-200 bg-blue-50">
                 <CardHeader>
                   <CardTitle className="text-base text-blue-800">Additional Notes</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-blue-700">{paymentDetails.referenceNote}</p>
                 </CardContent>
               </Card>
             )}

             {/* Admin Note */}
             {paymentDetails.adminNote && (
               <Card className="border-yellow-200 bg-yellow-50">
                 <CardHeader>
                   <CardTitle className="text-base text-yellow-800">Admin Note</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-yellow-700">{paymentDetails.adminNote}</p>
                 </CardContent>
               </Card>
             )}

             {/* Payment Proof */}
             {paymentDetails.method !== "sslcommerz" && paymentDetails.method !== "aamarpay" && renderPaymentProof()}

             {/* Action Buttons */}
             <div className="flex justify-end gap-3 pt-4 border-t">
               <Button variant="outline" onClick={onClose}>
                 Close
               </Button>
             </div>
           </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Payment details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

PaymentDetailsModal.propTypes = {
  paymentId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentDetailsModal;