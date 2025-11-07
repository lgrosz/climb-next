This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Build and Run

```sh
pnpm run graphql-codegen
pnpm run pg-codegen
pnpm run build
pnpm run start
```

### Development

First, generate the required code:

```sh
pnpm run graphql-codegen
pnpm run pg-codegen
# or
pnpm run graphql-codegen --watch
pnpm run pg-codegen --watch
```

Next, run the development server:

```sh
pnpm dev
```

Run tests with
```sh
jest
# or
pnpm run test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

