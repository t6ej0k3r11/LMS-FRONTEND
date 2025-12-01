import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Download, Award, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useStudentToast } from './ToastProvider';
import PropTypes from 'prop-types';

export const CertificateButton = ({
  isCompleted,
  overallProgress,
  courseTitle = '',
  className = ''
}) => {
  const [downloading, setDownloading] = useState(false);
  const { showError } = useStudentToast();

  // Certificate eligibility logic
  const isEligible = isCompleted && overallProgress >= 80;
  const progressNeeded = Math.max(0, 80 - Math.round(overallProgress));

  const handleDownload = async () => {
    if (!isEligible) return;

    try {
      setDownloading(true);

      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await fetch(`/api/student/certificates/${userId}/${courseId}/download`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `certificate-${courseId}.pdf`;
      // a.click();

      // For now, show a message that backend endpoint needs to be implemented
      showError(
        'Certificate Download Unavailable',
        'The certificate generation endpoint is not yet implemented on the backend. Please contact your instructor for a certificate.'
      );

    } catch (error) {
      console.error('Error downloading certificate:', error);
      showError('Download Failed', 'Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!isEligible) {
    return (
      <Card className={`p-4 border-amber-200 bg-amber-50 ${className}`}>
        <div className="flex items-center space-x-3">
          <Lock className="h-8 w-8 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">Certificate Locked</h3>
            <p className="text-sm text-amber-700">
              {progressNeeded > 0
                ? `Complete ${progressNeeded}% more of the course to unlock your certificate.`
                : 'Complete the course to unlock your certificate.'
              }
            </p>
            <div className="mt-2">
              <div className="flex items-center space-x-2 text-xs text-amber-600">
                <span>Progress: {Math.round(overallProgress)}%</span>
                <div className="flex-1 bg-amber-200 rounded-full h-1">
                  <div
                    className="bg-amber-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(overallProgress, 80)}%` }}
                  />
                </div>
                <span>80% required</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 border-green-200 bg-green-50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Award className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Certificate Ready!</h3>
            <p className="text-sm text-green-700">
              Congratulations! You've earned your certificate for {courseTitle}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600">Course completed with {Math.round(overallProgress)}%</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Downloading...' : 'Download PDF'}
        </Button>
      </div>

      {/* Backend Implementation Note */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <strong>Backend Implementation Required:</strong> The certificate download functionality
            requires a backend endpoint at <code>GET /student/certificates/:userId/:courseId/download</code>
            that generates and returns a PDF certificate using a library like pdfkit or puppeteer.
          </div>
        </div>
      </div>
    </Card>
  );
};

CertificateButton.propTypes = {
  isCompleted: PropTypes.bool.isRequired,
  overallProgress: PropTypes.number.isRequired,
  courseTitle: PropTypes.string,
  className: PropTypes.string,
};