"use client";

import Form from "next/form";
import { prepareImageUpload } from "@/images/actions";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useRef, useState } from "react";
import { addFeature as addTopoFeature, create as createTopo } from "@/topos/actions";

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
  const [progress, setProgress] = useState(0);

  function uploadFile(uploadUrl: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  }

  const handle = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const file = formData.get("image") as File | null;
    const alt = formData.get("alt")?.toString().trim() || null;
    const title = formData.get("title")?.toString().trim() || null;

    if (!file?.size) {
      // TODO this doesn't protect against malicious uploads
      return;
    }

    try {
      const [localImage, { image, uploadUrl }] = await Promise.all([
        getImage(file),
        prepareImageUpload(file.name, alt ?? undefined, [formationId]),
      ]);

      const uploadPromise = uploadFile(uploadUrl, file);
      const topoId = await createTopo(title, localImage.naturalWidth, localImage.naturalHeight);

      await Promise.all([
        uploadPromise,
        addTopoFeature(topoId, {
          type: "image",
          topoId,
          imageId: image.id,
          destCrop: {
            min: { x: 0, y: 0 },
            max: { x: localImage.naturalWidth, y: localImage.naturalHeight },
          },
        }),
      ]);

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
      { progress > 0 &&
        <>
          <label htmlFor="progress">Progress</label>
          <progress id="progress" max="100" value={progress}>{progress}%</progress>
        </>
      }
    </Form>
  );
}

