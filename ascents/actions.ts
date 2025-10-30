"use server";

import { graphql } from "@/gql";
import { Scalars } from "@/gql/graphql";
import { graphqlQuery } from "@/graphql";

function formatDateRange(dateRange: [Date | undefined, Date | undefined]): string {
  const format = (d?: Date) =>
    d ? d.toISOString().slice(0, 10) : "";
  return `[${format(dateRange[0])}, ${format(dateRange[1])}]`;
}

export async function addAscent(
  climbId: Scalars["ID"]["input"],
  memberIds: Array<Scalars["ID"]["input"]>,
  partyIsComplete: boolean,
  dateWindow: [Date | undefined, Date | undefined],
  isFa: boolean,
  isVerified: boolean,
) {
  const mutation = graphql(`
    mutation addAscent(
      $climbId: ID!
      $dateWindow: DateRange
      $firstAscent: Boolean!
      $party: AscentPartyInput!
      $verified: Boolean!
    ) {
      action: addAscent (
        climbId: $climbId
        dateWindow: $dateWindow
        firstAscent: $firstAscent
        party: $party
        verified: $verified
      ) { id }
    }
  `);

  await graphqlQuery(
    mutation, {
      climbId,
      firstAscent: isFa,
      dateWindow: (dateWindow[0] || dateWindow[1]) ? formatDateRange(dateWindow) : null,
      verified: isVerified,
      party: {
        complete: partyIsComplete,
        memberIds
      }
    }
  )
}
