import { parseLocalDate } from "@/lib/DateUtils";

export async function submitNewAscentForm(formData: FormData) {
  "use server";

  const climbId = formData.get("climb");
  const partyIds = formData.getAll("party")
    .map(p => p.toString())
    .filter(p => p);

  const lowerDate = parseLocalDate(formData.get("date-low")?.toString() ?? "");
  const upperDate = parseLocalDate(formData.get("date-high")?.toString() ?? "");

  const isFa = formData.has("fa");
  const isVerified = formData.has("verified")
  const partyIsComplete = formData.has("party-complete")

  console.log("Climb ID:", climbId);
  console.log("Party IDs:", partyIds);
  console.log("Lower date:", lowerDate);
  console.log("Upper date:", upperDate);
  console.log("Party is complete", partyIsComplete);
  console.log("Is first ascent:", isFa);
  console.log("Is verified:", isVerified);

  // TODO submit mutation
}
