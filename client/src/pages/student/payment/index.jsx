import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Building2, Smartphone, Banknote } from "lucide-react";

function PaymentSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Get course details from URL params
  const courseId = searchParams.get("courseId");
  const courseTitle = searchParams.get("courseTitle");
  const amount = searchParams.get("amount");

  const paymentMethods = [
    {
      id: "online",
      title: "Online Payment",
      description: "Pay securely with credit/debit cards, mobile banking, or digital wallets",
      icon: <CreditCard className="h-8 w-8 text-[hsl(var(--brand-green))]" />,
      features: ["Instant processing", "Secure gateway", "Multiple payment options"],
      action: () => {
        const params = new URLSearchParams();
        if (courseId) params.set("courseId", courseId);
        if (courseTitle) params.set("courseTitle", courseTitle);
        if (amount) params.set("amount", amount);
        navigate(`/payment/online?${params.toString()}`);
      },
    },
    {
      id: "offline",
      title: "Offline Payment",
      description: "Pay through bank transfer, mobile banking, or cash at office",
      icon: <Building2 className="h-8 w-8 text-[hsl(var(--brand-gold))]" />,
      features: ["Bank transfer", "Bkash/Nagad", "Office cash payment"],
      action: () => {
        const params = new URLSearchParams();
        if (courseId) params.set("courseId", courseId);
        if (courseTitle) params.set("courseTitle", courseTitle);
        if (amount) params.set("amount", amount);
        navigate(`/payment/offline?${params.toString()}`);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)] py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Payment Method</h1>
          <p className="text-muted-foreground text-lg">
            Select how you'd like to complete your course enrollment
          </p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedMethod === method.id
                  ? "border-[hsl(var(--brand-green))] bg-[hsla(var(--brand-green)/0.05)]"
                  : "border-white/60 hover:border-[hsl(var(--brand-green))/0.5]"
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {method.icon}
                </div>
                <CardTitle className="text-xl">{method.title}</CardTitle>
                <CardDescription className="text-base">
                  {method.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-green))] mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={selectedMethod === method.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    method.action();
                  }}
                >
                  Choose {method.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="bg-white/80 border-white/60">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Smartphone className="h-6 w-6 text-[hsl(var(--brand-green))] mb-2" />
                <h3 className="font-semibold mb-1">Mobile Banking</h3>
                <p className="text-sm text-muted-foreground">
                  Bkash, Nagad, Rocket, and other mobile wallets
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Banknote className="h-6 w-6 text-[hsl(var(--brand-gold))] mb-2" />
                <h3 className="font-semibold mb-1">Bank Transfer</h3>
                <p className="text-sm text-muted-foreground">
                  Direct bank transfers and office cash payments
                </p>
              </div>
              <div className="flex flex-col items-center">
                <CreditCard className="h-6 w-6 text-[hsl(var(--brand-red))] mb-2" />
                <h3 className="font-semibold mb-1">Card Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Visa, Mastercard, and other credit/debit cards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PaymentSelectionPage;