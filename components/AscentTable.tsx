import { FragmentType, getFragmentData, graphql } from "@/gql";

type PartyMember = {
  firstName: string;
  lastName: string;
};

type Party = {
  complete: boolean;
  members: PartyMember[];
};

type Ascent = {
  ascentWindow?: string;
  firstAscent: boolean;
  verified: boolean;
  party: Party;
};

type AscentTableProps = {
  className?: string;
  ascents: Ascent[];
};

const AscentFragmentType = graphql(`
  fragment AscentTableDataFragment on Ascent {
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

export function AscentTable({ className, ascents }: AscentTableProps) {
  return (
    <table className={className} border={1}>
      <thead>
        <tr>
          <th>Party</th>
          <th>Date Window</th>
          <th>First Ascent</th>
        </tr>
      </thead>
      <tbody>
        {ascents.map((ascent, i) => (
          <tr key={i}>
            <td>
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
            </td>
            <td>
              {ascent.ascentWindow}
              {!ascent.verified && <sup>†</sup>}
            </td>
            <td>{ascent.firstAscent ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

