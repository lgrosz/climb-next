import { GRAPHQL_ENDPOINT } from '@/constants';
import { NextRequest } from "next/server";
import { Image } from "@/gql/graphql"

// TODO Ideally, we get this stuff completely from
interface UploadImageResponse {
  data: {
    uploadImage: {
      id: Image["id"]
    };
  };
}

async function uploadImageViaGraphQL({
  file,
  alt,
}: {
  file: File,
  alt: string | null,
}) {
  "use server";

  if (!file?.size) {
    throw new Error("File not found");
  }

  const operations = JSON.stringify({
    query: `
      mutation ($image: Upload!, $alt: String) {
        uploadImage(image: $image, alt: $alt) {
          id
        }
      }
    `,
    variables: {
      image: null,
      alt: alt || null,
    },
  });

  const map = JSON.stringify({
    "0": ["variables.image"],
  });

  const graphqlForm = new FormData();
  graphqlForm.set("operations", operations);
  graphqlForm.set("map", map);
  graphqlForm.set("0", file);

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    body: graphqlForm,
  });

  let data: UploadImageResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected response");
  }

  if (!response.ok) {
    throw new Error("Reponse not OK");
  }

  const id = data.data?.uploadImage?.id;
  if (!id) {
    throw new Error("No ID");
  }

  return { id: id as string };
}


export async function POST(r: NextRequest) {
  const formData = await r.formData();
  const file = formData.get("file") as File;
  const alt = formData.get("alt")?.toString() || null;

  try {
    const { id } = await uploadImageViaGraphQL({ file, alt });
    return Response.json({ id }, { status: 200 });
  } catch (e) {
    console.error("Failed to upload image via GraphQL", e);
    return new Response(null, { status: 500 });
  }
}


