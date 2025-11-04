"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";

type Region = {
  id: string,
  name?: string,
}

type Crag = {
  name?: string
}

export default function MoveCragForm(
  {
    action,
    crag,
    defaultRegionId,
    regions,
  }: {
    action: (_: FormData) => Promise<void>,
    crag: Crag,
    defaultRegionId?: string,
    regions: Array<Region>,
  }
) {
  const router = useRouter();

  const clientAction = async (formData: FormData) => {
    await action(formData);
    router.back();
  }

  return (
    <form action={clientAction} className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
      <Breadcrumb>
	<BreadcrumbList>
	  <BreadcrumbItem>
	    <select name="region" defaultValue={defaultRegionId}>
	      <option value={undefined} label="None"/>
	      {regions.map(r => (
		<option key={r.id} value={r.id} label={r.name || "Anonymous region"} />
	      ))}
	    </select>
	  </BreadcrumbItem>
	  <BreadcrumbSeparator />
	  <BreadcrumbItem>
	    <BreadcrumbPage>
	      { crag.name || <i>Anonymous crag</i>}
	    </BreadcrumbPage>
	  </BreadcrumbItem>
	</BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-2 flex-row">
	<input type="button" onClick={router.back} value="Cancel" />
	<button type="submit">Save</button>
      </div>
    </form>
  );
}
