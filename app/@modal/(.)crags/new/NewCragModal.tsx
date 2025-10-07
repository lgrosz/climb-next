"use client";

import Modal from "@/app/ui/Modal";
import { submitNewCragForm } from "@/app/crags/new/actions";
import { useRouter } from "next/navigation";
import { CragParentOptions } from "@/app/crags/new/CragParentOptions";
import CragForm from "@/app/crags/new/CragForm";

export default function NewCragModal({
  parentOptions
}: {
  parentOptions: CragParentOptions,
}) {
  const router = useRouter();

  const action = async (formData: FormData) => {
    await submitNewCragForm(formData);
    router.back();
  }

  const header = (
    <div>
      <h1>Create a new crag</h1>
      <button onClick={() => router.back()}>Close</button>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <button form="new-crag-form" type="button" onClick={() => router.back()}>
        Cancel
      </button>
      <button form="new-crag-form" type="submit">
        Create
      </button>
    </div>
  );

  return (
    <Modal
      header={header}
      footer={footer}
    >
      <CragForm
        id="new-crag-form"
        action={action}
        parentOptions={parentOptions}
      />
    </Modal>
  )
}

