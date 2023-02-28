import { ICoordinate } from "./ICoordinate"
/**
 * Interface that represents a trip
 */
export interface ITrip {
  tripKey: string
  userid: string
  tripName: string
  departTime: Date,
  departTimeName: string,
  departTimeUnix: number,
  sourceCoords: ICoordinate
  destinationCoords: ICoordinate
  notes: string
}

/**
 * Function that creates an ITrip given relevant inputs
 * @param tripName string
 * @param departTime Date
 * @param arriveTime Date
 * @param sourceCity ICoordinate
 * @param destinationCity ICoordinate
 * @param transportMode ITransport
 * @returns IRoute object
 */
export function makeITrip(
  tripKey: string,
  userid: string,
  tripName: string,
  departTime: Date,
  departTimeName: string,
  departTimeUnix: number,
  sourceCoords: ICoordinate,
  destinationCoords: ICoordinate,
  notes: string
): ITrip {
  return {
    tripKey: tripKey,
    userid: userid,
    tripName: tripName,
    departTime: departTime,
    departTimeName : departTimeName,
    departTimeUnix: departTimeUnix,
    sourceCoords: sourceCoords,
    destinationCoords: destinationCoords,
    notes: notes
  }
}
