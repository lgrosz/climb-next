"use client";

import Modal from "@/app/ui/Modal";
import { submitNewSectorForm } from "@/app/sectors/new/actions";
import { useRouter } from "next/navigation";
import { SectorParentOptions } from "@/app/sectors/new/SectorParentOptions";
import SectorForm from "@/app/sectors/new/SectorForm";

export default function NewSectorModal({
  parentOptions
}: {
  parentOptions: SectorParentOptions,
}) {
  const router = useRouter();

  const action = async (formData: FormData) => {
    await submitNewSectorForm(formData);
    router.back();
  }

  const header = (
    <div>
      <h1>Create a new sector</h1>
      <button onClick={() => router.back()}>Close</button>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <button form="new-sector-form" type="button" onClick={() => router.back()}>
        Cancel
      </button>
      <button form="new-sector-form" type="submit">
        Create
      </button>
    </div>
  );

  return (
    <Modal
      header={header}
      footer={footer}
    >
      <SectorForm
        id="new-sector-form"
        action={action}
        parentOptions={parentOptions}
      />
    </Modal>
  )
}

