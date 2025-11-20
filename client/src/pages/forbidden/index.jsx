import PropTypes from "prop-types";

function ForbiddenPage({ message = "You do not have permission to access this page." }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Forbidden</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

ForbiddenPage.propTypes = {
  message: PropTypes.string,
};

export default ForbiddenPage;