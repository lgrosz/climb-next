import Form from 'next/form';
import { describe } from '@/areas/actions';
import { redirect } from "next/navigation";

export default ({ id, description }: { id: number, description: string }) => {
  const action = async (formData: FormData) => {
    'use server';
    const description = formData.get('description')?.toString();

    await describe(id, description ?? "");

    // TODO refresh
    redirect(`/areas/${id}`);
  }

  return (
    <Form action={action}>
      <div>
        <label htmlFor="name">Describe area</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter description"
          defaultValue={description}
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
}

