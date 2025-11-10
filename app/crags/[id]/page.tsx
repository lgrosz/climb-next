import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';
import Link from 'next/link';
import Header from './Header';
import Description from './Description';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const cragData = graphql(`
  query cragData($id: ID!) {
    crag(
      id: $id
    ) {
      id name
      description
      sectors { id name }
      formations { id name }
      climbs { id name }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    cragData,
    { id: params.id }
  );

  const { crag } = data;

  return (
    <div className='space-y-4'>
      <Header id={crag.id} name={crag.name ?? undefined} />
      <Description id={crag.id} description={crag.description ?? undefined} />
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Sectors</h3>
          <Button asChild variant='secondary' size='sm'>
            <Link href={`/sectors/new?crag=${crag.id}`}>Add sector</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crag.sectors.map((sector) => (
            <Link key={sector.id} href={`/sectors/${sector.id}`} className="block group">
              <Card className="transition-transform hover:scale-[1.02] hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {sector.name || <i>Anonymous sector</i>}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <Separator />
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Formations</h3>
          <Button asChild variant='secondary' size='sm'>
            <Link href={`/formations/new?crag=${crag.id}`}>Add formation</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crag.formations.map((formation) => (
            <Link key={formation.id} href={`/formations/${formation.id}`} className="block group">
              <Card className="transition-transform hover:scale-[1.02] hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {formation.name || <i>Anonymous formation</i>}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <Separator />
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Climbs</h3>
          <Button asChild variant='secondary' size='sm'>
            <Link href={`/climbs/new?crag=${crag.id}`}>Add climb</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crag.climbs.map((climb) => (
            <Link key={climb.id} href={`/climbs/${climb.id}`} className="block group">
              <Card className="transition-transform hover:scale-[1.02] hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {climb.name || <i>Anonymous climb</i>}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


