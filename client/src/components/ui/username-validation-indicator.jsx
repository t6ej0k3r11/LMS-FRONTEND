import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import PropTypes from "prop-types";
import { getUsernameFeedback, validateUsername } from "@/lib/username-validation";

function UsernameValidationIndicator({ username }) {
  UsernameValidationIndicator.propTypes = {
    username: PropTypes.string.isRequired,
  };
  const feedback = getUsernameFeedback(username);
  const validation = validateUsername(username);

  const getIcon = () => {
    switch (feedback.status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "neutral":
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Real-time feedback */}
      <div className={`flex items-center gap-2 text-sm ${feedback.color}`}>
        {getIcon()}
        <span>{feedback.message}</span>
      </div>

      {/* Username requirements */}
      {username.trim() && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-medium">Requirements:</div>
          <ul className="space-y-1 ml-4">
            <li className={`flex items-center gap-1 ${username.length >= 3 && username.length <= 50 ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="text-xs">•</span>
              3-50 characters ({username.length}/50)
            </li>
            <li className={`flex items-center gap-1 ${/^[a-zA-Z0-9_]+$/.test(username) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="text-xs">•</span>
              Letters, numbers, and underscores only
            </li>
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="text-xs text-blue-600 space-y-1">
          <div className="font-medium">Suggestions:</div>
          <ul className="space-y-1 ml-4">
            {validation.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-xs mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error messages */}
      {validation.errors.length > 0 && (
        <div className="text-xs text-red-600 space-y-1">
          <div className="font-medium">Issues to fix:</div>
          <ul className="space-y-1 ml-4">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-xs mt-0.5">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UsernameValidationIndicator;