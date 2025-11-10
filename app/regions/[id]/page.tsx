import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';
import Link from 'next/link';
import Header from './Header';
import Description from './Description';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const regionData = graphql(`
  query regionData($id: ID!) {
    region(
      id: $id
    ) {
      id name
      description
      crags { id name }
      formations { id name }
      climbs { id name }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    regionData,
    { id: params.id }
  );

  const { region } = data;

  return (
    <div className='space-y-4'>
      <Header id={region.id} name={region.name ?? undefined} />
      <Description id={region.id} description={region.description ?? undefined} />
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Crags</h3>
          <Button asChild variant='secondary' size='sm'>
            <Link href={`/crags/new?region=${region.id}`}>Add crag</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {region.crags.map((crag) => (
            <Link key={crag.id} href={`/crags/${crag.id}`} className="block group">
              <Card className="transition-transform hover:scale-[1.02] hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {crag.name || <i>Anonymous crag</i>}
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
            <Link href={`/formations/new?region=${region.id}`}>Add formation</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {region.formations.map((formation) => (
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
            <Link href={`/climbs/new?region=${region.id}`}>Add climb</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {region.climbs.map((climb) => (
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


