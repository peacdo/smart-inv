export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  // Handle unknown errors
  return {
    error: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
  };
}

export function createErrorResponse(error: unknown) {
  const errorDetails = handleAPIError(error);
  return Response.json(
    { error: errorDetails.error, code: errorDetails.code },
    { status: errorDetails.status }
  );
} 