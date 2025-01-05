import Form from 'next/form';
import { submitNewArea } from './actions';

export default () => {
  return (
    <Form action={submitNewArea}>
      <div>
        <label htmlFor="name">Add a name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Name"
        />
      </div>
      <div>
        <label htmlFor="parent-area-id">Add a parent area</label>
        <input
          id="parent-area-id"
          name="parent-area-id"
          type="number"
          placeholder="Parent area id"
        />
      </div>
      <button type="submit">Submit</button>
    </Form>
  )
}
