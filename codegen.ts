
import type { CodegenConfig } from '@graphql-codegen/cli';
import { GRAPHQL_ENDPOINT } from './constants'
import yn from 'yn';

const SCHEMA_FILE = "./schema.graphql";

const GQL_GENERATE = yn(process.env.GQL_GENERATE || "y");

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
    generates: { },
  };

  if (GQL_GENERATE) {
    config.generates["gql/"] = {
      preset: "client",
      plugins: [],
      config: {
        scalars: {
          DateInterval: {
            input: 'string',
            output: 'string',
          },
          FontainebleauGrade: {
            input: 'string',
            output: 'string',
          },
          VerminGrade: {
            input: 'string',
            output: 'string',
          },
          YosemiteDecimalGrade: {
            input: 'string',
            output: 'string',
          },
        },
        strictScalars: true,
      },
    };
  }

  // generate new local schema
  if (config.schema == GRAPHQL_ENDPOINT) {
    config.generates["schema.graphql"] = {
      plugins: ["schema-ast"],
      config: {
        skipDocumentsValidation: true,
      }
    };
  }

  return config;
}

export default config();
