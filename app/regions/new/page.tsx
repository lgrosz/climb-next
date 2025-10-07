import { redirect } from "next/navigation";
import { submitNewRegionForm } from "./actions";
import RegionForm from "./RegionForm";

export default async function Page()
{
  const action = async (formData: FormData) => {
    "use server";
    const id = await submitNewRegionForm(formData);
    redirect(`/regions/${id}`);
  }

  return (
    <div>
      <h1>Create a new region</h1>
      <RegionForm id="new-region-form" action={action} />
      <div className="flex justify-end">
        <button form="new-region-form" type="submit">
          Create
        </button>
      </div>
    </div>
  );
}
