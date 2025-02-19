// Ideally a code generator produces these types.. but for now, every attribute
// is optional, since we can exclude them when querying for them. If those
// attributes are actually GraphQL-optional, then they are unioned with `null`

export interface Area {
  __typename?: 'Area'
  id?: string
  name?: string | null
  description?: string | null
  parent?: AreaParent | null
  areas?: Area[]
  formations?: Formation[],
  climbs?: Climb[],
}

export type AreaParent = Area;

export interface Formation {
  __typename?: 'Formation'
  id?: string
  name?: string | null
  description?: string | null
  location?: Coordinate | null
  parent?: FormationParent | null
  formations?: Formation[]
  climbs?: Climb[]
}

export interface Coordinate {
  __typename?: "Coordinate"
  latitude?: number
  longitude?: number
}

export type FormationParent = Area | Formation;

export interface Climb {
  __typename?: "Climb"
  id?: string
  name?: string | null
  description?: string | null
  grades?: ClimbGrade[]
  parent?: ClimbParent | null
}

export type ClimbParent = Area | Formation;

export type ClimbGrade = ClimbVerminGrade;

export interface ClimbVerminGrade {
  __typename?: "ClimbVerminGrade"
  value?: string,
}

export interface ClimbFontainebleauGrade {
  __typename?: "ClimbFontainebleauGrade"
  value?: string,
}

export interface ClimbYosemiteDecimalGrade {
  __typename?: "ClimbYosemiteDecimalGrade"
  value?: string,
}
