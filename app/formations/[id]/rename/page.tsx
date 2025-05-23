import Form from 'next/form';
import { rename } from '@/formations/actions';
import { redirect } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const action = async (data: FormData) => {
    'use server';
    await rename(id, data.get("name")?.toString() ?? "");
    redirect(`/formations/${id}`);
  }

  return (
    <Form action={action}>
      <label htmlFor="name">Add a name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Name"
      />
      <button type="submit">Rename</button>
    </Form>
  )
}
