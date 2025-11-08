"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";

type SuccessState = { success: true; imageId: string };
type ErrorState = { success: false; error: string };
type InitialState = null;
type FormState = SuccessState | ErrorState | InitialState;

async function uploadImage(_: FormState,  formData: FormData): Promise<FormState> {
  const res = await fetch("/images/new/upload", {
    method: "POST",
    body: formData,
  });

  let data;

  try {
    data = await res.json();
    return { success: true, imageId: data.id as string };
  } catch {
    return { success: false, error: "Failed to upload image." };
  }
}

function NewImagePage() {
  const [state, dispatch, pending] = useActionState(uploadImage, null);
  const searchParams = useSearchParams();
  const formation = searchParams.get("formation");

  return (
    <>
      <section aria-labelledby="upload-heading" className="mt-4">
        <h2 id="upload-heading">
          {state === null ? "Upload an image" : "Upload another image"}
        </h2>
        { pending && <progress className="block" /> }
        <form action={dispatch} className="space-y-2">
          {formation && (
            <input type="hidden" name="formation" value={formation} />
          )}
          <input
            type="file"
            name="file"
            accept="image/*"
            placeholder="Choose file"
            disabled={pending}
            className="block"
          />
          <input
            type="text"
            name="alt"
            placeholder="Alternative text"
            disabled={pending}
            className="block"
          />
          <input
            type="submit"
            disabled={pending}
            className="block"
          />
        </form>
      </section>

      {state?.success === true && (
        <section aria-labelledby="success-heading" className="mt-4">
          <h2 id="success-heading">Upload successful</h2>
          <figure>
            <img
              src={`/images/${state.imageId}/download`}
              alt="Uploaded image"
              className="max-w-[300px] rounded-md"
            />
            <figcaption className="mt-1 text-sm text-gray-600">
              <a
                href={`/images/${state.imageId}`}
                target="_blank"
                rel="noreferrer"
              >
                View image
              </a>
              {" | "}
              <a
                href={`/images/${state.imageId}/download`}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            </figcaption>
          </figure>
        </section>
      )}

      {state?.success === false && (
        <section aria-labelledby="error-heading" className="mt-4">
          <h2 id="error-heading">Upload failed</h2>
          <p className="text-red-600">Error: {state.error}</p>
        </section>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <NewImagePage />
    </Suspense>
  );
}
