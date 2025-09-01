import Link from 'next/link'
import Coordinate from '@/lib/Coordinate'
import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import { TopoViewer } from '@/components/TopoViewer';
import { fromGql } from '@/lib/TopoWorld';
import styles from "./formation.module.css"

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
    <div>
      <div>
        <h1>
          {
            formation.name ??
            <i>Unnamed formation</i>
          }
        </h1>
        <Link href={`/formations/${formation.id}/rename`}>Rename</Link>
      </div>
      <div>
        <h3>
          {
            location ?
            <a href={`geo:${location.latitude},${location.longitude}`}>
              {location.toDMSString()}
            </a> :
            <i>No location</i>
          }
        </h3>
        <Link href={`/formations/${formation.id}/relocate`}>Relocate</Link>
      </div>
      <div>
        <Link href={`/formations/${formation.id}/move`}>Move</Link>
      </div>
      <div>
        <h3>Description</h3>
        <p>
          {
            formation.description ??
            <i>No description available</i>
          }
        </p>
        <Link href={`/formations/${formation.id}/describe`}>Describe</Link>
      </div>
      <div>
        <h3>Climbs</h3>
        <Link href="/climbs/new">New climb</Link>
      </div>
      <ul>
        {formation.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
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

