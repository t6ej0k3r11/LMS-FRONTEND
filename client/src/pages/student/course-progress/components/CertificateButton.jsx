import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Download,
  Lock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "@/hooks/use-toast";

function CertificateButton({ courseId, isCompleted, overallProgress }) {
  CertificateButton.propTypes = {
    courseId: PropTypes.string,
    isCompleted: PropTypes.bool,
    overallProgress: PropTypes.number
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadCertificate = async () => {
    if (!isCompleted) return;

    setIsGenerating(true);

    try {
      // Simulate certificate generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, this would call an API to generate/download certificate
      toast({
        title: "Certificate Downloaded!",
        description: "Your course completion certificate has been downloaded.",
      });

      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // Would be actual certificate URL
      link.download = `certificate-${courseId}.pdf`;
      link.click();

    } catch {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCertificateStatus = () => {
    if (isCompleted) {
      return {
        status: "available",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        title: "Certificate Available",
        description: "Congratulations! You've completed the course.",
        buttonText: "Download Certificate",
        buttonVariant: "default",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (overallProgress >= 80) {
      return {
        status: "almost",
        icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
        title: "Almost There!",
        description: `Complete ${100 - overallProgress}% more to earn your certificate.`,
        buttonText: "Continue Learning",
        buttonVariant: "outline",
        bgColor: "bg-yellow-50 border-yellow-200"
      };
    } else {
      return {
        status: "locked",
        icon: <Lock className="h-5 w-5 text-gray-400" />,
        title: "Certificate Locked",
        description: `Complete ${80 - overallProgress}% more of the course to unlock your certificate.`,
        buttonText: "Keep Learning",
        buttonVariant: "outline",
        bgColor: "bg-gray-50 border-gray-200"
      };
    }
  };

  const certificateInfo = getCertificateStatus();

  return (
    <Card className={`${certificateInfo.bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0">
            {certificateInfo.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {certificateInfo.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {certificateInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">Course Certificate</span>
          </div>

          <Button
            onClick={isCompleted ? handleDownloadCertificate : undefined}
            disabled={!isCompleted || isGenerating}
            variant={certificateInfo.buttonVariant}
            size="sm"
            className={`text-xs ${
              isCompleted
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                Generating...
              </>
            ) : (
              <>
                {isCompleted ? (
                  <Download className="h-3 w-3 mr-1" />
                ) : (
                  <Lock className="h-3 w-3 mr-1" />
                )}
                {certificateInfo.buttonText}
              </>
            )}
          </Button>
        </div>

        {/* Progress indicator for certificate */}
        {!isCompleted && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Certificate Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 80)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              80% completion required for certificate
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CertificateButton;