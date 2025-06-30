// gets a string error message from an error, but throws if the error is not a string or Error
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  } else if (error instanceof Error) {
    return error.message
  }
  throw error
}
