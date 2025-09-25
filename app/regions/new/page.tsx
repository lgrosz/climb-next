import { create } from "@/regions/actions";
import { redirect } from "next/navigation";

export default async function Page()
{
  const action = async (formData: FormData) => {
    "use server";

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();

    const id = await create(name, description);
    redirect(`/regions/${id}`);
  }

  return (
    <div>
      <h1>Create a new region</h1>
      <form action={action}>
	<div>
	  <label
	    className="block"
	    htmlFor="name"
	  >
	    Add a name
	  </label>
	  <input
	    id="name"
	    type="text"
	    className="w-full"
	    name="name"
	  />
	  <label
	    className="block"
	    htmlFor="description"
	  >
	    Add a description
	  </label>
	  <textarea
	    id="description"
	    className="w-full resize-y"
	    name="description"
	  />
	</div>
	<div className="flex justify-end">
	  <button type="button">
	    Cancel
	  </button>
	  <button type="submit">
	    Create
	  </button>
	</div>
      </form>
    </div>
  );
}
