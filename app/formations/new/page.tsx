import Form from 'next/form';
import { create } from '@/formations/actions';
import { redirect } from "next/navigation";

export default function Page() {
  const action = async (formData: FormData) => {
    'use server';
    const name = formData.get('name')?.toString() || null;
    const parentType = formData.get('parent-type')?.toString() || null;
    const parentAreaId = Number(formData.get('parent-area-id')?.toString()) || null;
    const parentFormationId = Number(formData.get('parent-formation-id')?.toString()) || null;

    const id = await create(
      name ?? undefined,
      {
        area: (parentType === "area" ? parentAreaId : null) ?? undefined,
        formation: (parentType === "formation" ? parentFormationId : null) ?? undefined
      }
    );

    redirect(`/formations/${id}`);
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
        <input
          id="parent-is-area"
          type="radio"
          name="parent-type"
          value="area"
        />
        <label htmlFor="parent-is-area">Parent is an area</label>
        <input
          id="parent-is-formation"
          type="radio"
          name="parent-type"
          value="formation"
        />
        <label htmlFor="parent-is-formation">Parent is a formation</label>
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
      <div>
        <label htmlFor="parent-formation-id">Add a parent formation</label>
        <input
          id="parent-formation-id"
          name="parent-formation-id"
          type="number"
          placeholder="Parent formation id"
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
}

