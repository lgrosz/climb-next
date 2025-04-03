import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import { redirect } from 'next/navigation';
import Form from 'next/form';
import { create } from '@/ascents/actions';
import { DateInterval } from '@/date-interval';
import { BoundType } from '@/bound';

const query = graphql(`
  query newAscentData {
    climbers { id lastName firstName }
    climbs { id name }
  }
`);

export default async function Page() {
  const data = await graphqlQuery(query);
  const { climbers, climbs } = data;

  const action = async (formData: FormData) => {
    'use server';

    const climbId = formData.get('climb')?.toString() || null;
    const climberId = formData.get('climber')?.toString() || null;

    let dateWindow: DateInterval | null = null;

    const start = formData.get('interval-start')?.toString() || null;
    const end = formData.get('interval-end')?.toString() || null;

    if (start || end) {
      dateWindow = new DateInterval;
      dateWindow.lower = start
        ? { type: BoundType.Included, value: new Date(start) }
        : { type: BoundType.Unbounded };
      dateWindow.upper = end
        ? { type: BoundType.Included, value: new Date(end) }
        : { type: BoundType.Unbounded };
    }

    if (climbId && climberId) {
      const id = await create(climbId, climberId, dateWindow);
      redirect(`/ascents/${id}`)
    }
  }

  // _local_ today
  const today = new Date(Date.now());

  return (
    <Form action={action}>
      <div>
        <label htmlFor="climber">Choose climber</label>
        <select name="climber" id="climber">
          {climbers.map(climber => (
            <option key={`climber-${climber.id}`} value={climber.id}>{climber.lastName}, {climber.firstName}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="climb">Choose climb</label>
        <select name="climb" id="climb">
          {climbs.map(climb => (
            <option key={`climb-${climb.id}`} value={climb.id}>{climb.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="interval-start">Date window start</label>
        <input
          type="date"
          id="interval-start"
          name="interval-start"
          /* TODO max should be max of today and value of the interval-end */
          max={today.toISOString().split("T")[0]}
        />
      </div>
      <div>
        <label htmlFor="interval-end">Date window end</label>
        <input
          type="date"
          id="interval-end"
          name="interval-end"
          /* TODO min should be the value of interval-start */
          max={today.toISOString().split("T")[0]}
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  );
}
