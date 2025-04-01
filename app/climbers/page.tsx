import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import Link from "next/link";

const query = graphql(`
  query climbers {
    climbers {
      id lastName firstName
    }
  }
`);

export default async function Page() {
  const data = await graphqlQuery(query);

  const { climbers } = data;

  return (
    <div>
      <h1>Climbers</h1>
      <p>List of climbers in the database.</p>
      <ul>
        {climbers.map((climber) => (
          <li key={`climber-${climber.id}`}>
            <Link href={`/climbers/${climber.id}`}>{climber.lastName}, {climber.firstName}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}


