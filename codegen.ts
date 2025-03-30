
import type { CodegenConfig } from '@graphql-codegen/cli';
import { GRAPHQL_ENDPOINT } from './constants'

const SCHEMA_FILE = "./schema.graphql";

async function schema() {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, { method: 'HEAD' });

    if (response.ok) {
      console.warn("Using GraphQL server.")
      return GRAPHQL_ENDPOINT;
    } else {
      console.warn(`GraphQL server responed with "${response.statusText}" (${response.status}), falling back to local schema.`);
      return SCHEMA_FILE;
    }
  } catch (error) {
    console.warn("GraphQL server not available, falling back to local schema.");
    return SCHEMA_FILE;
  }
}

async function config() {
  const config: CodegenConfig = {
    overwrite: true,
    schema: await schema(),
    documents: ["**/*.tsx", "**/*.ts"],
    generates: {
      "gql/": {
        preset: "client",
        plugins: []
      },
    },
  };

  // generate new local schema
  if (config.schema == GRAPHQL_ENDPOINT) {
    config.generates["schema.graphql"] = { plugins: ["schema-ast"] };
  }

  return config;
}

export default config();
