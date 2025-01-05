import Form from 'next/form';
import { create } from '@/areas/actions';
import { redirect } from "next/navigation";

export default () => {
  const action = async (formData: FormData) => {
    'use server';
    const name = formData.get('name')?.toString() || null;
    const parentAreaId = Number(formData.get('parent-area-id')?.toString()) || null;

    let id = await create(name ?? undefined, { area: parentAreaId ?? undefined });

    redirect(`/areas/${id}`);
  }

  return (
    <Form action={action}>
      <div>
        <label htmlFor="name">Add a name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Name"
        />
      </div>
      <div>
        <label htmlFor="parent-area-id">Add a parent area</label>
        <input
          id="parent-area-id"
          name="parent-area-id"
          type="number"
          placeholder="Parent area id"
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
}
