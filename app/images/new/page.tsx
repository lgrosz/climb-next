"use client";

import Form from "next/form";
import { prepareImageUpload } from "@/images/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useRef, useState } from "react";

function UploadForm()
{
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const params = useSearchParams();
  const [progress, setProgress] = useState(0);

  const handle = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const file = formData.get("image") as File | null;
    const alt = formData.get("alt")?.toString();

    if (!file?.size) {
      // TODO redirect to error page?
      return;
    }

    console.log("prepareImageUpload with formations", params.getAll("formation"));

    const { image, uploadUrl } = await prepareImageUpload(
      file.name,
      alt || undefined,
      params.getAll("formation")
    );

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));

      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    router.push(`/images/${image.id}`);
  }, [router, params]);

  return (
    <Form ref={formRef} action="" onSubmit={handle}>
      <input name="image" type="file" accept="image/*" />
      <label htmlFor="alt">Alternative text</label>
      <input name="alt" type="text" />
      <button type="submit">Upload image</button>
      { progress > 0 &&
        <>
          <label htmlFor="progress">Progress</label>
          <progress max="100" value={progress}>{progress}%</progress>
        </>
      }
    </Form>
  );
}

export default function Page()
{
  return (
    <Suspense>
      <UploadForm />
    </Suspense>
  );
}
