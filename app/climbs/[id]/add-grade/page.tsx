import { addGrade } from "@/climbs/actions";
import FontainebleauGrade from "@/fontainebleau-grade";
import VerminGrade from "@/vermin-grade";
import YosemiteDecimalGrade from "@/yosemite-decimal-grade";
import Form from "next/form";

export default async function Page(
  props: {
    params: Promise<{
      id: string,
    }>
  }
) {
  const { id } = await props.params;

  const action = async (formData: FormData) => {
    'use server';

    const climbId = formData.get("climb-id")?.toString() || null;
    const grade = formData.get("grade")?.toString() ?? "";

    if (!climbId) {
      return;
    }

    try {
      const str = FontainebleauGrade.fromString(grade).toString();
      addGrade(climbId, { fontainebleau: str });
    } catch { };

    try {
      const str = VerminGrade.fromString(grade).toString();
      addGrade(climbId, { vermin: str });
    } catch { };

    try {
      const str = YosemiteDecimalGrade.fromString(grade).toString();
      addGrade(climbId, { yosemiteDecimal: str });
    } catch { };

    // TODO Should probably notify the user that something bad happened, or
    // maybe there needs to be some validation on the input so we can only
    // really call this when that is satisifed?
  }

  return (
    <Form action={action}>
      <input type="hidden" name="climb-id" value={id}/>
      <input name="grade" type="text" />
      <button type="submit">Add grade</button>
    </Form>
  );
}
