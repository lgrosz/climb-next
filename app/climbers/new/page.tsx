import Form from 'next/form';
import { create } from '@/climbers/actions';
import { redirect } from "next/navigation";

export default function Page() {
  const action = async (formData: FormData) => {
    'use server';
    const firstName = formData.get('first-name')?.toString() ?? "";
    const lastName = formData.get('last-name')?.toString() ?? "";

    await create(firstName, lastName);

    redirect("climbers");
  }

  return (
    <Form action={action}>
      <div>
        <label htmlFor="first-name">Add a first name</label>
        <input
          id="first-name"
          name="first-name"
          type="text"
          placeholder="First name"
          required
        />
      </div>
      <div>
        <label htmlFor="last-name">Add a last name</label>
        <input
          id="last-name"
          name="last-name"
          type="text"
          placeholder="Last name"
          required
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
}

