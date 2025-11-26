import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

function PaymentFailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason") || "Payment was cancelled or failed";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-red)/0.1),_transparent_60%)] flex items-center justify-center py-8">
      <div className="mx-auto max-w-md w-full px-4">
        <Card className="border-red-200 bg-red-50/90 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-red-700">
                We couldn't process your payment at this time.
              </p>
              {orderId && (
                <p className="text-sm text-red-600">
                  Order ID: <span className="font-mono font-semibold">{orderId}</span>
                </p>
              )}
              <p className="text-sm text-red-600 bg-red-100/70 rounded-lg p-3">
                Reason: {reason}
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-red-800">What you can do:</h3>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• Check your payment method details</li>
                <li>• Ensure sufficient balance/funds</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if needed</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/payment")}
                className="bg-[hsl(var(--brand-red))] hover:bg-[hsl(var(--brand-red))/0.9]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/courses")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PaymentFailPage;