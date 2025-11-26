import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import OfflinePaymentForm from "@/components/student-view/payment/OfflinePaymentForm";

function OfflinePaymentPage() {
  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");
  const courseTitle = searchParams.get("courseTitle") || "Course";
  const amount = parseFloat(searchParams.get("amount")) || 0;

  // Check if courseId is required
  if (!courseId) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-muted-foreground">Course ID is required to proceed with payment.</p>
        </div>
      </div>
    );
  }

  const paymentInstructions = {
    bkash: {
      title: "bKash Payment Instructions",
      steps: [
        "Open your bKash app",
        "Go to 'Send Money' or 'Payment'",
        "Enter our bKash number: 01XXXXXXXXX",
        "Enter the exact amount",
        "Complete the payment and save the transaction ID",
        "Upload the payment confirmation screenshot"
      ]
    },
    nagad: {
      title: "Nagad Payment Instructions",
      steps: [
        "Open your Nagad app",
        "Go to 'Send Money' or 'Payment'",
        "Enter our Nagad number: 01XXXXXXXXX",
        "Enter the exact amount",
        "Complete the payment and save the transaction ID",
        "Upload the payment confirmation screenshot"
      ]
    },
    bank_transfer: {
      title: "Bank Transfer Instructions",
      account: {
        bank: "Example Bank Ltd.",
        accountName: "DeshGory Learning Platform",
        accountNumber: "1234567890123",
        routingNumber: "123456789"
      },
      steps: [
        "Use your online banking app or visit a branch",
        "Transfer to the account details shown above",
        "Use the exact amount and save the transaction ID/reference",
        "Upload the bank receipt or screenshot"
      ]
    },
    office_cash: {
      title: "Office Cash Payment",
      address: "DeshGory Office, Dhaka, Bangladesh",
      contact: "+880 1XXXXXXXXX",
      steps: [
        "Visit our office during business hours (9 AM - 6 PM)",
        "Bring the exact amount in cash",
        "Mention your course enrollment",
        "Get a receipt and upload it here"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)] py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Offline Payment</h1>
          <p className="text-muted-foreground text-lg">
            Complete your payment using traditional methods
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <OfflinePaymentForm
              courseId={courseId}
              courseTitle={courseTitle}
              amount={amount}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            {/* Course Summary */}
            <Card className="border-white/60 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Course:</span>
                  <span>{courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-lg">৳{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Method:</span>
                  <span>Offline Payment</span>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-yellow-200 bg-yellow-50/90">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-yellow-600" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    Payments are verified within 24-48 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    Course access granted after approval
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    Keep your payment proof safe
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    Contact support if you have issues
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment Methods Info */}
            <Card className="border-white/60 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Available Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(paymentInstructions).map(([key, method]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 capitalize">
                        {method.title.replace("Payment Instructions", "").replace("Instructions", "")}
                      </h3>
                      {method.account && (
                        <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                          <div><strong>Bank:</strong> {method.account.bank}</div>
                          <div><strong>Account Name:</strong> {method.account.accountName}</div>
                          <div><strong>Account Number:</strong> {method.account.accountNumber}</div>
                          <div><strong>Routing:</strong> {method.account.routingNumber}</div>
                        </div>
                      )}
                      {method.address && (
                        <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                          <div><strong>Address:</strong> {method.address}</div>
                          <div><strong>Contact:</strong> {method.contact}</div>
                        </div>
                      )}
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {method.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfflinePaymentPage;