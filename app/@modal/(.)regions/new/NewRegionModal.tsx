"use client";

import Modal from "@/app/ui/Modal";
import { submitNewRegionForm } from "@/app/regions/new/actions";
import { useRouter } from "next/navigation";
import RegionForm from "@/app/regions/new/RegionForm";

export default function NewRegionModal() {
  const router = useRouter();

  const action = async (formData: FormData) => {
    await submitNewRegionForm(formData);
    router.back();
  }

  const header = (
    <div>
      <h1>Create a new region</h1>
      <button onClick={() => router.back()}>Close</button>
    </div>
  );

  const footer = (
    <div className="flex justify-end">
      <button form="new-region-form" type="button" onClick={() => router.back()}>
        Cancel
      </button>
      <button form="new-region-form" type="submit">
        Create
      </button>
    </div>
  );

  return (
    <Modal
      header={header}
      footer={footer}
    >
      <RegionForm
        id="new-region-form"
        action={action}
      />
    </Modal>
  )
}

