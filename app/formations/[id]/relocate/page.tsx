import Form from 'next/form';
import { relocate } from '@/formations/actions';
import { redirect } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const action = async (data: FormData) => {
    'use server';
    const latitude = Number(data.get('latitude') || NaN);
    const longitude = Number(data.get('longitude') || NaN);
    await relocate(id, isNaN(latitude) || isNaN(longitude) ? null : { latitude, longitude });
    redirect(`/formations/${id}`);
  }

  return (
    <Form action={action}>
      <label htmlFor="latitude">Latitude</label>
      <input
        type="number"
        step="any"
        name="latitude"
        placeholder="Latitude"
      />
      <label htmlFor="longitude">Longitude</label>
      <input
        type="number"
        step="any"
        name="longitude"
        placeholder="Longitude"
      />
      <button type="submit">Relocate</button>
    </Form>
  )
}
