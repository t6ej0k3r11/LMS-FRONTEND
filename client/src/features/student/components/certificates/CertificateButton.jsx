import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Award, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function CertificateButton({ courseId, courseTitle, completionPercentage }) {
  const [downloading, setDownloading] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState(null); // null, 'available', 'not-eligible', 'error'
  const { get } = useApi();
  const { user } = useStudentContext();

  // Check if student is eligible for certificate (80%+ completion)
  const isEligible = completionPercentage >= 80;

  const handleDownloadCertificate = async () => {
    if (!isEligible || !user?._id) return;

    try {
      setDownloading(true);
      setCertificateStatus(null);

      // Call certificate generation endpoint
      const response = await get(`/student/certificates/${user._id}/${courseId}/download`, {
        responseType: 'blob', // Important for file download
      });

      if (response) {
        // Create blob URL and trigger download
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Certificate_${courseTitle.replace(/\s+/g, '_')}_${user._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setCertificateStatus('available');
      }
    } catch (error) {
      console.error('Certificate download error:', error);
      setCertificateStatus('error');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!isEligible) {
      return {
        icon: AlertCircle,
        text: `Complete ${80 - completionPercentage}% more to unlock certificate`,
        variant: 'secondary',
        disabled: true
      };
    }

    if (certificateStatus === 'error') {
      return {
        icon: AlertCircle,
        text: 'Download failed. Try again.',
        variant: 'destructive',
        disabled: false
      };
    }

    if (certificateStatus === 'available') {
      return {
        icon: CheckCircle,
        text: 'Certificate downloaded successfully!',
        variant: 'default',
        disabled: false
      };
    }

    return {
      icon: Download,
      text: 'Download Certificate',
      variant: 'default',
      disabled: false
    };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Course Certificate</h3>
              <p className="text-sm text-gray-600">
                {courseTitle}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isEligible ? 'default' : 'secondary'}>
                  {completionPercentage}% Complete
                </Badge>
                {isEligible && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Certificate Eligible
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownloadCertificate}
            disabled={!isEligible || downloading || status.disabled}
            variant={status.variant}
            className="min-w-[160px]"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <StatusIcon className="h-4 w-4 mr-2" />
                {status.text}
              </>
            )}
          </Button>
        </div>

        {!isEligible && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Certificate Requirements:</p>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Complete at least 80% of the course</li>
                  <li>All required assignments must be submitted</li>
                  <li>Final assessment (if applicable) must be passed</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {certificateStatus === 'available' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Certificate downloaded! Check your downloads folder.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

CertificateButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  completionPercentage: PropTypes.number.isRequired,
};

export default CertificateButton;