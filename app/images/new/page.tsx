"use client";

import Form from "next/form";
import { prepareImageUpload } from "@/images/actions";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useRef } from "react";

export default function Page()
{
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

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

    const { image, uploadUrl } = await prepareImageUpload(file.name, alt || undefined);

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: bytes,
    });

    router.push(`/images/${image.id}`);
  }, [router]);

  return (
    <Form ref={formRef} action="" onSubmit={handle}>
      <input name="image" type="file" accept="image/*" />
      <label htmlFor="alt">Alternative text</label>
      <input name="alt" type="text" />
      <button type="submit">Upload image</button>
    </Form>
  );
}
