"use client";

import ClimbForm from "@/app/climbs/new/ClimbForm";
import Modal from "@/app/ui/Modal";
import { submitNewClimbForm } from "@/app/climbs/new/actions";
import { useRouter } from "next/navigation";
import { ClimbParentOptions } from "@/app/climbs/new/ClimbParentOptions";

export default function NewClimbModal({
  parentOptions
}: {
  parentOptions: ClimbParentOptions,
}) {
  const router = useRouter();

  const action = async (formData: FormData) => {
    await submitNewClimbForm(formData);
    router.back();
  }

  const header = (
    <div>
      <h1>Create a new climb</h1>
      <button onClick={() => router.back()}>Close</button>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <button form="new-climb-form" type="button" onClick={() => router.back()}>
        Cancel
      </button>
      <button form="new-climb-form" type="submit">
        Create
      </button>
    </div>
  );

  return (
    <Modal
      header={header}
      footer={footer}
    >
      <ClimbForm
        id="new-climb-form"
        action={action}
        parentOptions={parentOptions}
      />
    </Modal>
  )
}

