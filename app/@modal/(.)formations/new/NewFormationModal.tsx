"use client";

import Modal from "@/app/ui/Modal";
import { submitNewFormationForm } from "@/app/formations/new/actions";
import { useRouter } from "next/navigation";
import { FormationParentOptions } from "@/app/formations/new/FormationParentOptions";
import FormationForm from "@/app/formations/new/FormationForm";

export default function NewFormationModal({
  parentOptions
}: {
  parentOptions: FormationParentOptions,
}) {
  const router = useRouter();

  const action = async (formData: FormData) => {
    await submitNewFormationForm(formData);
    router.back();
  }

  const header = (
    <div>
      <h1>Create a new formation</h1>
      <button onClick={() => router.back()}>Close</button>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <button form="new-formation-form" type="button" onClick={() => router.back()}>
        Cancel
      </button>
      <button form="new-formation-form" type="submit">
        Create
      </button>
    </div>
  );

  return (
    <Modal
      header={header}
      footer={footer}
    >
      <FormationForm
        id="new-formation-form"
        action={action}
        parentOptions={parentOptions}
      />
    </Modal>
  )
}

