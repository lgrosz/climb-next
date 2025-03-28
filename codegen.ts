
import type { CodegenConfig } from '@graphql-codegen/cli';

const GRAPHQL_URL = "http://localhost:4000/graphql";
const SCHEMA_FILE = "./schema.graphql";

async function schema() {
  try {
    const response = await fetch(GRAPHQL_URL, { method: 'HEAD' });

    if (response.ok) {
      console.warn("Using GraphQL server.")
      return GRAPHQL_URL;
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
  if (config.schema == GRAPHQL_URL) {
    config.generates["schema.graphql"] = { plugins: ["schema-ast"] };
  }

  return config;
}

export default config();
