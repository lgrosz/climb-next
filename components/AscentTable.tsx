import { FragmentType, getFragmentData, graphql } from "@/gql";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

type PartyMember = {
  firstName: string;
  lastName: string;
};

type Party = {
  complete: boolean;
  members: PartyMember[];
};

type Ascent = {
  id: string;
  ascentWindow?: string;
  firstAscent: boolean;
  verified: boolean;
  party: Party;
};

type AscentTableProps = {
  className?: string;
  selected?: Set<string>;
  toggleSelect?: (_: string) => void
  ascents: Ascent[];
};

const AscentFragmentType = graphql(`
  fragment AscentTableDataFragment on Ascent {
    id
    ascentWindow
    firstAscent
    verified
    party {
      complete
      members {
	firstName lastName
      }
    }
  }
`);

export function fragmentAsAscentTableProp(frag: Array<FragmentType<typeof AscentFragmentType>>): Ascent[] {
  const a = getFragmentData(AscentFragmentType, frag);

  return a.map(d => ({
    id: d.id,
    ascentWindow: d.ascentWindow || undefined,
    firstAscent: d.firstAscent,
    verified: d.verified,
    party: {
      complete: d.party.complete,
      members: d.party.members.map(m => ({
        firstName: m.firstName ?? "",
        lastName: m.lastName ?? "",
      })),
    }
  }));
}

export function AscentTable({ className, selected, ascents, toggleSelect }: AscentTableProps) {
  return (
    <Table className={className} border={1}>
      <TableCaption>Notable ascents</TableCaption>
      <TableHeader>
        <TableRow>
          { !!selected && <TableHead /> }
          <TableHead>Party</TableHead>
          <TableHead>Date Window</TableHead>
          <TableHead>First Ascent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ascents.map((ascent, i) => (
          <TableRow key={i}>
            { !!selected &&
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected?.has(ascent.id) ?? false}
                  disabled={!toggleSelect}
                  onChange={() => toggleSelect?.(ascent.id)}
                />
              </TableCell>
            }
            <TableCell>
              {ascent.party.members.length > 0 ? (
                <span>
                  {ascent.party.members
                    .map((m) => `${m.firstName} ${m.lastName}`)
                    .join(", ")}
                  {!ascent.party.complete && "*"}
                </span>
            ) : (
              <em>None</em>
            )}
            </TableCell>
            <TableCell>
              {ascent.ascentWindow}
              {!ascent.verified && <sup>†</sup>}
            </TableCell>
            <TableCell>{ascent.firstAscent ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

