import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useFileValidator from "@/hooks/useFileValidator";
import { submitOfflinePaymentService } from "@/services";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";
import PropTypes from 'prop-types';

const PAYMENT_METHODS = PAYMENT_CONFIG.UI.PAYMENT_METHODS;

function OfflinePaymentForm({ courseId, amount, onSuccess }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    method: "",
    name: "",
    mobile: "",
    amount: amount || "",
    transactionId: "",
    notes: "",
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // File validation hook for payment proof
  const paymentProofValidator = useFileValidator({
    allowedTypes: ['image', 'document'],
    multiple: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Use the file validator hook
    const validation = paymentProofValidator.validateFile(selectedFile);

    if (!validation.valid) {
      toast({
        title: "File validation failed",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }

    if (errors.file) {
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.method) newErrors.method = "Please select a payment method";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (!file) newErrors.file = "Please upload payment proof";

    // Transaction ID required for bKash, Nagad, and Bank Transfer
    if ([PAYMENT_CONFIG.METHODS.BKASH_MANUAL, PAYMENT_CONFIG.METHODS.NAGAD_MANUAL, PAYMENT_CONFIG.METHODS.BANK_TRANSFER].includes(formData.method) && !formData.transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required for this payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append(PAYMENT_CONFIG.FIELDS.COURSE_ID, courseId);
      submitData.append(PAYMENT_CONFIG.FIELDS.METHOD, formData.method);
      submitData.append("amount", formData.amount);
      if (formData.transactionId) {
        submitData.append(PAYMENT_CONFIG.FIELDS.TRANSACTION_ID, formData.transactionId.trim());
      }
      if (formData.notes) {
        submitData.append(PAYMENT_CONFIG.FIELDS.REFERENCE_NOTE, formData.notes.trim());
      }
      submitData.append(PAYMENT_CONFIG.FIELDS.PROOF_FILE, file);

      const response = await submitOfflinePaymentService(submitData);

      if (response[PAYMENT_CONFIG.RESPONSE_FORMAT.SUCCESS]) {
        toast({
          title: "Payment Submitted",
          description: "Your offline payment has been submitted for verification. You will be notified once approved.",
        });

        if (onSuccess) {
          onSuccess(response[PAYMENT_CONFIG.RESPONSE_FORMAT.DATA]);
        } else {
          navigate("/student-courses");
        }
      } else {
        throw new Error(response[PAYMENT_CONFIG.RESPONSE_FORMAT.MESSAGE] || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Offline Payment Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete your payment using one of the offline methods below
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={formData.method} onValueChange={(value) => handleInputChange("method", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <span>{method.icon}</span>
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && <p className="text-sm text-red-600">{errors.method}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="01XXXXXXXXX"
            />
            {errors.mobile && <p className="text-sm text-red-600">{errors.mobile}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Transaction ID */}
          {[PAYMENT_CONFIG.METHODS.BKASH_MANUAL, PAYMENT_CONFIG.METHODS.NAGAD_MANUAL, PAYMENT_CONFIG.METHODS.BANK_TRANSFER].includes(formData.method) && (
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID *</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => handleInputChange("transactionId", e.target.value)}
                placeholder="Enter transaction ID"
              />
              {errors.transactionId && <p className="text-sm text-red-600">{errors.transactionId}</p>}
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Payment Proof *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {!file ? (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload payment screenshot or receipt
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Images, Documents up to {paymentProofValidator.getMaxSizeMB()}MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload").click()}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept={paymentProofValidator.getAcceptedTypes()}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about your payment..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Payment...
              </>
            ) : (
              "Submit Payment for Verification"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

OfflinePaymentForm.propTypes = {
  courseId: PropTypes.string.isRequired,
  amount: PropTypes.number,
  onSuccess: PropTypes.func,
};

export default OfflinePaymentForm;