import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import { redirect } from 'next/navigation';
import Form from 'next/form';
import { create } from '@/ascents/actions';
import DateIntervalInput from '@/components/DateIntervalInput';

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
    let dateWindow = formData.get('date-window')?.toString() || null;

    // Currently, there's no real use for this data and I'd just prefer it to
    // end up being "no date window," represented by null
    if (dateWindow == "../..") {
      dateWindow = null;
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
        <label>Date window</label>
        <DateIntervalInput
          id="date-window"
          name="date-window"
          max={today.toISOString().split("T")[0]}
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  );
}
