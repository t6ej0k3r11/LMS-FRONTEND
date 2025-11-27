import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-gold)/0.1),_transparent_60%)] flex items-center justify-center py-8">
      <div className="mx-auto max-w-md w-full px-4">
        <Card className="border-yellow-200 bg-yellow-50/90 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <XCircle className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-yellow-800">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-yellow-700">
                You cancelled the payment process.
              </p>
              <p className="text-sm text-yellow-600">
                No charges have been made to your account.
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-yellow-800">Ready to continue?</h3>
              <ul className="text-sm text-yellow-700 space-y-1 text-left">
                <li>• Your course selection is still saved</li>
                <li>• Try a different payment method</li>
                <li>• Complete your enrollment anytime</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/payment")}
                className="bg-[hsl(var(--brand-gold))] hover:bg-[hsl(var(--brand-gold))/0.9] text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Different Method
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

export default PaymentCancelPage;