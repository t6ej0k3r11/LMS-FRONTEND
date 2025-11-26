import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const transactionId = searchParams.get(PAYMENT_CONFIG.FIELDS.TRANSACTION_ID);
  const amount = searchParams.get(PAYMENT_CONFIG.FIELDS.AMOUNT);

  useEffect(() => {
    // Clear any stored transaction data
    sessionStorage.removeItem("currentTransactionId");
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)] flex items-center justify-center py-8">
      <div className="mx-auto max-w-md w-full px-4">
        <Card className="border-green-200 bg-green-50/90 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-green-700">
                Your payment has been processed successfully.
              </p>
              {transactionId && (
                <p className="text-sm text-green-600">
                  Transaction ID: <span className="font-mono font-semibold">{transactionId}</span>
                </p>
              )}
              {amount && (
                <p className="text-lg font-semibold text-green-800">
                  Amount Paid: ৳{parseFloat(amount).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-white/70 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-green-800">What happens next?</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Course access will be granted within a few minutes</li>
                <li>• You will receive a confirmation email</li>
                <li>• Check your dashboard for course materials</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/student-courses")}
                className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))/0.9]"
              >
                Go to My Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/home")}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;