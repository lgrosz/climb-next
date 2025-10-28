"use client";

import { submitNewAscentForm } from "@/app/climbs/[id]/add-ascent/actions";
import AscentForm from "@/app/climbs/[id]/add-ascent/AscentForm";
import Modal from "@/app/ui/Modal";
import BackButton from "@/components/ui/BackButton";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

export default function AddAscentModal({
  id,
  climb,
  climbers
}: {
  id: string,
  climb: { name?: string },
  climbers?: ComponentProps<typeof AscentForm>["climbers"]
}) {
  const router = useRouter();

  const action = async (formData: FormData) => {
    formData.set("climb", id);
    await submitNewAscentForm(formData);
    router.back();
  }

  return (
    <Modal
      header={
        <div>
          <h1>Add ascent for {climb.name || <i>Anonymous climb</i>}</h1>
          <BackButton>Close</BackButton>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <BackButton>Cancel</BackButton>
          <button form="new-ascent-form" type="submit">
            Create
          </button>
        </div>
      }
    >
      <AscentForm
        id="new-ascent-form"
        action={action}
        climbers={climbers?.map(c => ({
          id: c.id,
          firstName: c.firstName ?? "",
          lastName: c.lastName ?? "",
        }))}
      />
    </Modal>
  );
}

