/**
 * Represents a successful operation result.
 * @template T - The type of the successful data
 */
export type Success<T> = {
  /** The successful result data */
  data: T;
  /** Always null for successful operations */
  error: null;
};

/**
 * Represents a failed operation result.
 * @template E - The type of the error
 */
export type Failure<E> = {
  /** Always null for failed operations */
  data: null;
  /** The error that occurred during the operation */
  error: E;
};

/**
 * A discriminated union representing either a successful or failed operation result.
 * @template T - The type of the successful data
 * @template E - The type of the error (defaults to Error)
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Type guard to check if a value is promise-like (has a 'then' method).
 * @template T - The expected resolved type of the promise
 * @param value - The value to check
 * @returns True if the value is promise-like, false otherwise
 */
function isPromiseLike<T = any>(value: unknown): value is Promise<T> {
  return !!value && typeof (value as any).then === "function";
}

/**
 * Converts any thrown value to an Error instance.
 * @template E - The expected error type
 * @param err - The thrown value to convert
 * @returns An Error instance
 */
function toError<E = Error>(err: unknown): E {
  return (err instanceof Error ? err : new Error(String(err))) as E;
}

/**
 * Handles a promise by wrapping its resolution/rejection in a Result type.
 * @template T - The expected resolved type
 * @template E - The expected error type
 * @param promise - The promise to handle
 * @returns A promise that resolves to a Result
 */
function handlePromise<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  return promise
    .then((data) => ({ data, error: null as null }))
    .catch((error) => ({ data: null, error: toError<E>(error) }));
}

/**
 * Wraps a promise in a Result type for safe error handling.
 * @template T - The expected resolved type
 * @template E - The expected error type
 * @param operation - The promise to wrap
 * @returns A promise that resolves to a Result
 * @example
 * ```typescript
 * const { data, error } = await tryCatch(fetch('/api/users'));
 * if (error) {
 *   console.error('Request failed:', error.message);
 *   return;
 * }
 * console.log('Response:', data);
 * ```
 */
export function tryCatch<T, E = Error>(operation: Promise<T>): Promise<Result<T, E>>;

/**
 * Wraps an async function in a Result type for safe error handling.
 * @template T - The expected return type
 * @template E - The expected error type
 * @param operation - The async function to wrap
 * @returns A promise that resolves to a Result
 * @example
 * ```typescript
 * const { data, error } = await tryCatch(async () => {
 *   const response = await fetch('/api/users');
 *   return response.json();
 * });
 * ```
 */
export function tryCatch<T, E = Error>(operation: () => Promise<T>): Promise<Result<T, E>>;

/**
 * Wraps a synchronous function in a Result type for safe error handling.
 * @template T - The expected return type
 * @template E - The expected error type
 * @param operation - The synchronous function to wrap
 * @returns A Result containing either the data or error
 * @example
 * ```typescript
 * const { data, error } = tryCatch(() => JSON.parse(jsonString));
 * if (error) {
 *   console.error('Parse failed:', error.message);
 *   return;
 * }
 * console.log('Parsed:', data);
 * ```
 */
export function tryCatch<T, E = Error>(operation: () => T): Result<T, E>;

/**
 * A universal error handling utility that wraps operations in a Result type.
 * Eliminates the need for try-catch blocks and provides consistent error handling
 * for both synchronous and asynchronous operations.
 *
 * @template T - The expected return/resolved type
 * @template E - The expected error type (defaults to Error)
 * @param operation - The operation to execute safely. Can be:
 *   - A Promise
 *   - A function that returns a value
 *   - A function that returns a Promise
 * @returns Either a Result (for sync) or Promise<Result> (for async)
 *
 * @example
 * ```typescript
 * // Async operations
 * const { data, error } = await tryCatch(fetch('/api/data'));
 *
 * // Sync operations
 * const { data, error } = tryCatch(() => JSON.parse(input));
 *
 * // Database operations (Prisma, Drizzle, etc.)
 * const { data, error } = await tryCatch(prisma.user.findMany());
 * ```
 */
export function tryCatch<T, E = Error>(
  operation: Promise<T> | (() => T) | (() => Promise<T>)
): Promise<Result<T, E>> | Result<T, E> {
  if (isPromiseLike(operation)) {
    return handlePromise<T, E>(operation);
  }

  try {
    const result = operation();

    if (isPromiseLike(result)) {
      return handlePromise<T, E>(result);
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: toError<E>(error) };
  }
}