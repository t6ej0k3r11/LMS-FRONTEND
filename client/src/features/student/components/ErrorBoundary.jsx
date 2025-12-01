import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class StudentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error for monitoring (in production, send to error reporting service)
    console.error('Student Dashboard Error:', error, errorInfo);

    // Could send to analytics/monitoring service here
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;

      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>

            <p className="text-gray-600 mb-6 text-sm">
              We encountered an error while loading this section.
              Please try again or refresh the page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={this.handleRefresh}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </div>

            {showDetails && import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

StudentErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.elementType,
  showDetails: PropTypes.bool,
};

export default StudentErrorBoundary;