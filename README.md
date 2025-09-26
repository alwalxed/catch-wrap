# trycatcher

A simple, type-safe error handling utility for TypeScript that eliminates try-catch boilerplate and provides consistent error handling for both synchronous and asynchronous operations.

## Features

- **Type-safe**: Full TypeScript support with proper type inference
- **Universal**: Works with sync functions, async functions, and promises
- **Zero dependencies**: Lightweight with no external dependencies
- **Consistent API**: Same interface for all operation types
- **Promise-like support**: Works with Drizzle, Prisma, and other thenable objects

## Installation

```bash
pnpm add trycatcher
# or
bun add trycatcher
yarn add trycatcher
npm install trycatcher
```

## Basic Usage

### Async Operations

```typescript
import { tryCatch } from 'trycatcher';

const { data, error } = await tryCatch(fetch('/api/users'));
if (error) {
  console.error('Failed to fetch users:', error.message);
  return;
}

console.log('Status:', data.status);

const { data, error } = await tryCatch(async () => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('API request failed');
  return response.json();
});

if (error) {
  console.error('Operation failed:', error.message);
} else {
  console.log('Users:', data);
}
```

### Synchronous Operations

```typescript
import { tryCatch } from 'trycatcher';

const { data, error } = tryCatch(() => JSON.parse(jsonString));
if (error) {
  console.error('Invalid JSON:', error.message);
  return;
}
console.log('Parsed data:', data);
```

## Framework Integration

### Database Operations (Drizzle, Prisma)

Perfect for database operations that return promise-like objects:

```typescript
import { tryCatch } from 'trycatcher';

const { data: user, error } = await tryCatch(
  db.select().from(users).where(eq(users.id, userId))
);

const { data: users, error } = await tryCatch(
  prisma.user.findMany({ where: { active: true } })
);

if (error) {
  console.error('Database query failed:', error.message);
  return [];
}
return users;
```

### File System Operations

```typescript
import fs from 'fs/promises';
import { tryCatch } from 'trycatcher';

const { data: fileContent, error } = await tryCatch(
  fs.readFile('./config.json', 'utf8')
);

if (error) {
  console.error('Failed to read config file:', error.message);
  return;
}

const { data: config, error: parseError } = tryCatch(() =>
  JSON.parse(fileContent)
);
```

## API Reference

### `tryCatch<T, E>(operation)`

A universal error handling function that wraps operations and returns a result object.

**Parameters:**

- `operation`: Can be one of:
  - A `Promise<T>`
  - A function `() => T` that might throw
  - A function `() => Promise<T>` that returns a promise

**Returns:**

- For sync operations: `Result<T, E>`
- For async operations: `Promise<Result<T, E>>`

**Type Parameters:**

- `T`: The expected return type of the successful operation
- `E`: The error type (defaults to `Error`)

### Types

```typescript
type Result<T, E = Error> = Success<T> | Failure<E>;

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT](./LICENSE) License.
