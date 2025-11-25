import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

function FloatingNav({ onPrevious, onNext, hasPrevious, hasNext }) {
  FloatingNav.propTypes = {
    onPrevious: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    hasPrevious: PropTypes.bool,
    hasNext: PropTypes.bool
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center space-x-3 bg-white rounded-full shadow-lg border border-gray-200 p-2">
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          variant="ghost"
          size="sm"
          className={`rounded-full w-10 h-10 p-0 ${
            hasPrevious
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="w-px h-6 bg-gray-300"></div>

        <Button
          onClick={onNext}
          disabled={!hasNext}
          variant="ghost"
          size="sm"
          className={`rounded-full w-10 h-10 p-0 ${
            hasNext
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default FloatingNav;