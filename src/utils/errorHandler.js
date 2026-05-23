export function handleApiError(error) {
  if (error.message) {
    // Standard error from our api.js fetch wrapper
    if (error.message.includes('401')) {
      localStorage.removeItem('eventdeco_token');
      localStorage.removeItem('eventdeco_user');
      window.location.href = '/auth';
      return 'Session expired. Please login again.';
    }
    if (error.message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('404')) {
      return 'Resource not found.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}
