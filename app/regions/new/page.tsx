export default async function Page()
{
  return (
    <div>
      <h1>Create a new region</h1>
      <form>
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
