import { evaluatePasswordStrength } from "@/lib/password-strength";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import PropTypes from "prop-types";

function PasswordStrengthIndicator({ password = "" }) {
  if (!password) return null;

  const { strength, feedback, checks } = evaluatePasswordStrength(password);

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthLabels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Strength Meter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength === "weak"
                ? "w-1/3"
                : strength === "medium"
                ? "w-2/3"
                : "w-full"
            } ${strengthColors[strength]}`}
          />
        </div>
        <Badge
          variant={strength === "strong" ? "default" : "secondary"}
          className={`text-xs ${
            strength === "weak"
              ? "bg-red-100 text-red-800"
              : strength === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {strengthLabels[strength]}
        </Badge>
      </div>

      {/* Feedback Messages */}
      {feedback.length > 0 && (
        <Alert className="py-2">
          <AlertDescription className="text-sm">
            <ul className="space-y-1">
              {feedback.map((message, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          {checks.length ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span className={checks.length ? "text-green-700" : "text-red-700"}>
            8+ characters
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.variety ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span className={checks.variety ? "text-green-700" : "text-red-700"}>
            Mixed characters
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.noRepeated ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span className={checks.noRepeated ? "text-green-700" : "text-red-700"}>
            No repeats
          </span>
        </div>
        <div className="flex items-center gap-1">
          {checks.noSequential ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span className={checks.noSequential ? "text-green-700" : "text-red-700"}>
            No sequences
          </span>
        </div>
      </div>
    </div>
  );
}

PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string,
};

export default PasswordStrengthIndicator;