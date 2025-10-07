export default function RegionForm({
  id,
  action,
}: {
  id?: string,
  action: (_: FormData) => Promise<void>
})
{
  return (
    <form id={id} action={action}>
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
    </form>
  )
}
