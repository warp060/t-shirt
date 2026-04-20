import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback: FallbackComponent }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error);
      setHasError(true);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const resetError = () => {
    setHasError(false);
    setError(undefined);
  };

  if (hasError) {
    if (FallbackComponent) {
      return <FallbackComponent error={error} resetError={resetError} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for functional components
export const useErrorHandler = () => {
  return (error: Error) => {
    console.error('Error handled by hook:', error);
    // You can integrate with error reporting service here
  };
};