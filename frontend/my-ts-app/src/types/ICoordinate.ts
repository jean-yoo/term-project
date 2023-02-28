/** A geographical coordinate with lat and lon */
export interface ICoordinate {
  latitude: number,
  longitude: number
}

/**
 * makes an ICoordinate object from the given lat/lon. 
 * @param latitude latitude 
 * @param longitude longitude 
 * @returns an ICoordinate object containing the input lat/lon values. 
 */
export function makeICoordinate(
  latitude: string,
  longitude: string
): ICoordinate {
  return {
    latitude: Number(latitude),
    longitude: Number(longitude)
  }
}