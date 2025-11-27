import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initOnlinePaymentService } from "@/services";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

function OnlinePaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Get course data from URL params or session storage
  const courseId = searchParams.get("courseId");
  const courseTitle = searchParams.get("courseTitle") || "Course";
  const amount = searchParams.get("amount") || "0";

  useEffect(() => {
    if (!courseId) {
      toast({
        title: "Error",
        description: "Course information is missing. Please try again.",
        variant: "destructive",
      });
      navigate("/courses");
      return;
    }

    // Initialize payment data
    setPaymentData({
      courseId,
      courseTitle,
      amount: parseFloat(amount),
    });
  }, [courseId, courseTitle, amount, navigate, toast]);

  const handleInitPayment = async () => {
    if (!paymentData) return;

    setLoading(true);
    try {
      const response = await initOnlinePaymentService({
        [PAYMENT_CONFIG.FIELDS.COURSE_ID]: paymentData.courseId,
        [PAYMENT_CONFIG.FIELDS.METHOD]: "sslcommerz", // Default to SSLCommerz, could be made configurable
      });

      if (response[PAYMENT_CONFIG.RESPONSE_FORMAT.SUCCESS]) {
        // Store transaction ID for later verification
        sessionStorage.setItem("currentTransactionId", response[PAYMENT_CONFIG.RESPONSE_FORMAT.DATA][PAYMENT_CONFIG.FIELDS.TRANSACTION_ID]);

        // Redirect to payment gateway
        window.location.href = response[PAYMENT_CONFIG.RESPONSE_FORMAT.DATA].paymentUrl;
      } else {
        throw new Error(response[PAYMENT_CONFIG.RESPONSE_FORMAT.MESSAGE] || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading payment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)] py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Online Payment</h1>
          <p className="text-muted-foreground text-lg">
            Complete your secure online payment
          </p>
        </div>

        {/* Payment Summary */}
        <Card className="mb-6 border-white/60 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium">Course:</span>
              <span className="text-right">{paymentData.courseTitle}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium">Amount:</span>
              <span className="text-right font-bold text-lg">৳{paymentData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Payment Method:</span>
              <Badge variant="secondary" className="bg-[hsl(var(--brand-green))/0.1] text-[hsl(var(--brand-green))]">
                Online Payment
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <Card className="mb-6 border-white/60 bg-white/90">
          <CardHeader>
            <CardTitle>Accepted Payment Methods</CardTitle>
            <CardDescription>
              You will be redirected to our secure payment gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Cards</span>
                <span className="text-xs text-muted-foreground">Visa, Mastercard</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-8 w-8 bg-green-600 rounded mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">bKash</span>
                </div>
                <span className="text-sm font-medium">bKash</span>
                <span className="text-xs text-muted-foreground">Mobile Banking</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-8 w-8 bg-orange-600 rounded mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Nagad</span>
                </div>
                <span className="text-sm font-medium">Nagad</span>
                <span className="text-xs text-muted-foreground">Mobile Banking</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-8 w-8 bg-purple-600 rounded mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Bank</span>
                </div>
                <span className="text-sm font-medium">Internet Banking</span>
                <span className="text-xs text-muted-foreground">All Banks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mb-6 border-green-200 bg-green-50/80">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Secure Payment</h3>
                <p className="text-sm text-green-700">
                  Your payment information is encrypted and secure. We use industry-standard SSL encryption
                  and comply with PCI DSS security standards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/payment")}
            className="flex-1"
            disabled={loading}
          >
            Back to Payment Methods
          </Button>
          <Button
            onClick={handleInitPayment}
            disabled={loading}
            className="flex-1 bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))/0.9]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ৳{paymentData.amount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnlinePaymentPage;