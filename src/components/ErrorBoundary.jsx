import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service (e.g., Sentry, LogRocket)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset, onReload }) => {
  const theme = useTheme();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        backgroundColor: theme.palette.background.default,
        textAlign: 'center'
      }}
    >
      <ErrorOutline 
        sx={{ 
          fontSize: 80, 
          color: theme.palette.error.main,
          mb: 2 
        }} 
      />
      
      <Typography variant="h3" gutterBottom>
        Oops! Something went wrong
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
        We apologize for the inconvenience. The application encountered an unexpected error.
        Please try refreshing the page or contact support if the problem persists.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onReload}
        >
          Reload Page
        </Button>
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={onReset}
        >
          Try Again
        </Button>
      </Box>

      {isDevelopment && error && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            backgroundColor: theme.palette.grey[100],
            borderRadius: 1,
            maxWidth: 800,
            width: '100%',
            textAlign: 'left',
            overflow: 'auto'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Error Details (Development Only):
          </Typography>
          <Typography 
            component="pre" 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              fontSize: '0.75rem'
            }}
          >
            {error.toString()}
            {errorInfo && errorInfo.componentStack}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ErrorBoundary;
