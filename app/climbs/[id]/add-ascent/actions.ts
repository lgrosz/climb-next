import { addAscent } from "@/ascents/actions";
import { parseLocalDate } from "@/lib/DateUtils";

export async function submitNewAscentForm(formData: FormData) {
  "use server";

  const climbId = formData.get("climb")?.toString();

  if (!climbId) {
    throw "Must have climb ID";
  }

  const partyIds = formData.getAll("party")
    .map(p => p.toString())
    .filter(p => p);

  const lowerDate = parseLocalDate(formData.get("date-low")?.toString() ?? "");
  const upperDate = parseLocalDate(formData.get("date-high")?.toString() ?? "");

  const isFa = formData.has("fa");
  const isVerified = formData.has("verified")
  const partyIsComplete = formData.has("party-complete")

  await addAscent(climbId, partyIds, partyIsComplete, [lowerDate, upperDate], isFa, isVerified);
}
