import Form from "next/form";
import { prepareImageUpload } from "@/images/actions";
import { redirect } from "next/navigation";

export default async function Page()
{
  const action = async (formData: FormData) => {
    'use server';
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

    redirect(`/images/${image.id}`);
  }

  return (
    <Form action={action}>
      <input name="image" type="file" accept="image/*" />
      <label htmlFor="alt">Alternative text</label>
      <input name="alt" type="text" />
      <button type="submit">Upload image</button>
    </Form>
  );
}
