import Form from 'next/form';
import { describe } from '@/climbs/actions';
import { redirect } from 'next/navigation';

export default async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  const action = async (data: FormData) => {
    'use server';
    await describe(id, data.get("description")?.toString() ?? "");
    redirect(`/climbs/${id}`);
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
