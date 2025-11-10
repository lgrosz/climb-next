import Link from 'next/link'
import Coordinate from '@/lib/Coordinate'
import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import { TopoViewer } from '@/components/TopoViewer';
import { fromGql } from '@/lib/TopoWorld';
import styles from "./formation.module.css"
import Header from './Header';
import Description from './Description';
import { CopyToClipboardButton } from '@/components/CopyToClipboardButton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const formationData = graphql(`
  query formationData($id: ID!) {
    formation(
      id: $id
    ) {
      id name description
      location { latitude longitude }
      images { id alt }
      climbs { id name }
    }
    topos: toposByFormation(
      id: $id
    ) {
      id title
      ...Topo_CompleteFragment
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const data = await graphqlQuery(
    formationData,
    { id: params.id }
  );

  const {
    formation,
    topos,
  } = data;

  let location: Coordinate | null = null;

  if (formation.location?.latitude !== undefined && formation.location?.longitude !== undefined) {
    location = new Coordinate(formation.location.latitude, formation.location.longitude);
  }

  return (
    <div className='space-y-4'>
      <Header id={formation.id} name={formation.name ?? undefined} />
      <div className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3>
          {
            location ?
            <a href={`geo:${location.latitude},${location.longitude}`}>
              {location.toDMSString()}
            </a> :
            <i>No location</i>
          }
        </h3>
        <div className="flex gap-2 flex-row">
          <Link href={`/formations/${formation.id}/relocate`}>Relocate</Link>
          <CopyToClipboardButton disabled={!location} content={location?.toDMSString() ?? ""}>Copy DMS</CopyToClipboardButton>
          <CopyToClipboardButton disabled={!location} content={location?.toDDDString() ?? ""}>Copy DDD</CopyToClipboardButton>
        </div>
      </div>
      <Description id={formation.id} description={formation.description ?? undefined} />
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Climbs</h3>
          <Button asChild variant='secondary' size='sm'>
            <Link href={`/climbs/new?formations=${formation.id}`}>Add climb</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formation.climbs.map((climb) => (
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
      <Separator />
      <div>
        <h3>Topos</h3>
        <Link href={`/formations/${formation.id}/new-topo`}>New topo</Link>
      </div>
      <ul>
        {topos.map(topo => (
          <li key={`topo-${topo.id}`}>
            <h4>{topo.title ?? "Untitled"}</h4>
            <div className="flex justify-center items-center p-2 max-w-4xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <TopoViewer world={fromGql(topo)} className={`block w-full h-full ${styles["topo-viewer"]}`} />
            </div>
            <Link href={`/topos/${topo.id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
      <div>
        <h3>Images</h3>
        <Link href={`/images/new?formation=${formation.id}`}>Add image</Link>
      </div>
      <ul>
        {formation.images.map((image) => (
          <li key={`image-${image.id}`}>
          <Link href={`/images/${image.id}`}>{image.alt}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

