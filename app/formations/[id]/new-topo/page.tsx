"use client";

import Form from "next/form";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useRef } from "react";
import { addFeature as addTopoFeature, create as createTopo } from "@/topos/actions";

type UploadImageResultFailure = { success: false };
type UploadImageResultSuccess = { success: true; imageId: string };
type UploadImageResult = UploadImageResultFailure | UploadImageResultSuccess;

async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  const res = await fetch("/images/new/upload", {
    method: "POST",
    body: formData,
  });

  let data;

  try {
    data = await res.json();
    return { success: true, imageId: data.id as string };
  } catch {
    return { success: false };
  }
}

function getImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image;
    const url = URL.createObjectURL(file);

    const revokeUrl = () => URL.revokeObjectURL(url);

    image.onload = () => {
      revokeUrl();
      resolve(image);
    };

    image.onabort = () => {
      revokeUrl();
      reject();
    }

    image.src = url;
  });
}

export default function Page()
{
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { id: formationId } = useParams<{ id: string }>()

  const handle = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const file = formData.get("image") as File | null;
    const alt = formData.get("alt")?.toString().trim() || null;
    const title = formData.get("title")?.toString().trim() || null;

    const uploadImageFormData = new FormData();
    uploadImageFormData.append("file", file ?? "");
    if (alt) uploadImageFormData.append("alt", alt);
    if (formationId) uploadImageFormData.append("formation", formationId);

    if (!file?.size) {
      // TODO this doesn't protect against malicious uploads
      return;
    }

    try {
      // TODO We can leave some things dangling here.. so some report of what failed would be good
      // and some links for the user to clean up if they want to
      const uploadPromise = uploadImage(uploadImageFormData);
      const localImage = await getImage(file);
      const topoId = await createTopo(title, localImage.naturalWidth, localImage.naturalHeight);
      const upload = await uploadPromise;

      if (upload.success) {
        await addTopoFeature(topoId, {
          type: "image",
          topoId,
          imageId: upload.imageId,
          destCrop: {
            min: { x: 0, y: 0 },
            max: { x: localImage.naturalWidth, y: localImage.naturalHeight },
          },
        });
      }

      router.push(`/topos/${topoId}/edit`);
    } catch (err) {
      console.error(err);
      // TODO look into [NextJS errors](https://nextjs.org/docs/app/getting-started/error-handling)
    }
  }, [formationId, router]);

  return (
    <Form ref={formRef} action="" onSubmit={handle}>
      <div>
        <label htmlFor="image">Image</label>
        <input name="image" type="file" accept="image/*" />
        <label htmlFor="alt">Alternative text</label>
        <input id="alt" name="alt" type="text" />
      </div>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" />
      </div>
      <button type="submit">Create topo</button>
    </Form>
  );
}

