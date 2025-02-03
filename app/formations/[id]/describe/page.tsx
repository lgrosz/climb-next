import Form from 'next/form';
import { describe } from '@/formations/actions';
import { redirect } from 'next/navigation';

export default async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = parseInt(params.id);
  const action = async (data: FormData) => {
    'use server';
    await describe(id, data.get("description")?.toString() ?? "");
    redirect(`/formations/${id}`);
  }

  return (
    <Form action={action}>
      <label htmlFor="description">Add a description</label>
      <textarea
        name="description"
        placeholder="Description"
      />
      <button type="submit">Describe</button>
    </Form>
  )
}
