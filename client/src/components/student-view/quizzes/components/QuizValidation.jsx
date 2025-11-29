import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import PropTypes from 'prop-types';

function QuizValidation({ errors, warnings }) {
  return (
    <>
      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert className="border-[hsla(var(--brand-red)/0.3)] bg-[hsla(var(--brand-red)/0.08)]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <Alert className="border-[hsla(var(--brand-gold)/0.3)] bg-[hsla(var(--brand-gold)/0.12)]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

QuizValidation.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
  warnings: PropTypes.arrayOf(PropTypes.string),
};

QuizValidation.defaultProps = {
  errors: [],
  warnings: [],
};

export default QuizValidation;