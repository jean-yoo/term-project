import {app} from  "../auth/Firebase"
import { getDatabase, query, ref, child, push, update, orderByChild, onChildAdded, endBefore, startAt, Database, DataSnapshot } from "firebase/database";
import { getAuth } from "firebase/auth";
import { ICoordinate } from "../../types/ICoordinate";
import { ITrip } from  "../../types/ITrip"

/**
 * Method that finds all of the matched trips for the given trip. 
 * @param trip ITrip object to find matches for. 
 */
export function findMatch(trip:ITrip) {
  const db = getDatabase(app);
  const allTripRef = ref(db, 'all-trips'); // get all trips in the database 
  const auth = getAuth(); 

  const user = auth.currentUser
  if (user) { // if signed in 
    const uid: string | null = user.uid
    const mySource = trip.sourceCoords 
    const myDest = trip.destinationCoords

    const timeBound = new Date(trip.departTime)
    timeBound.setHours(timeBound.getHours()+1);  // end time bound
    const timeEndUnix = Math.floor(timeBound.getTime() / 1000)
    timeBound.setHours(timeBound.getHours()-2); // start time bound
    const timeStartUnix = Math.floor(timeBound.getTime() / 1000)

    // query from the all-trip path, trips that are within the allowed time range (1 hour before/after)
    const trips = query(allTripRef, orderByChild('departTimeUnix'), endBefore(timeEndUnix), startAt(timeStartUnix))
    onChildAdded(trips, function(snapshot2) {
        if (snapshot2.val().userid !== uid) { // don't want to match user with themselves 
          // distance between queried trip and current user's trip in km 
          const destinationDist = distanceBetween(snapshot2.val().destinationCoords, myDest)
          const sourceDist = distanceBetween(snapshot2.val().sourceCoords, mySource)
          // if within a 10 mile/17km radius: 
          if (destinationDist <= 17 && sourceDist <= 17) {
            // insert this matched trip under current user's trip in the 
            // database, and under the matched user's trip. 
              insertUnderCurrent(snapshot2, trip, db, uid)
              insertUnderTheirs(trip, db, snapshot2.val().userid)
          }

        }
    })
  }}

  /**
   * Method which calculates the distance, in kilometers, between two locations,
   * via the Haversine formula.
   *
   * @param location1 The [latitude, longitude] pair of the first location.
   * @param location2 The [latitude, longitude] pair of the second location.
   * @returns The distance, in kilometers, between the inputted locations.
   */
  export function distanceBetween(location1:ICoordinate, location2:ICoordinate): number {
      const radius = 6371; // Earth's radius in kilometers
      const latDelta = degToRad(location1.latitude - location2.latitude);
      const lonDelta = degToRad(location2.longitude - location1.longitude);
    
      const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
        (Math.cos(degToRad(location1.latitude)) * Math.cos(degToRad(location2.latitude)) *
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));
    
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
      return radius * c;
    }

  /**
   * Converts degrees to radians.
   * @param deg number, degrees
   * @returns deg converted to radians
   */
  function degToRad(deg:number) : number {
      return deg * Math.PI / 180; 
  }

  /**
   * Inserts the matched trip under my matched trips in the database, 
   * and also updates the current trip in my database to include 
   * the newly matched user's ids and their trip's id.
   * 
   * @param tripDataSnap DataSnapshot containing the other person's trips information
   * in the database. 
   * @param trip trip containing my trip 
   * @param db the database. 
   * @param uid current user id. 
   */
  const insertUnderCurrent = (tripDataSnap:DataSnapshot, trip: ITrip, db: Database, uid: string) => {
    const theirTripVals = tripDataSnap.val(); 
    const theirTripKey = tripDataSnap.key;
    const myTripKey = trip.tripKey;
    console.log(theirTripKey)

    // update current user's "my-trip" to reflect matched information
    const myPostData = theirTripVals.userid+'/'+theirTripKey

    // make a post entry to update current user's "matched-trip"
    const matchedPostData = {
      userid: theirTripVals.userid,
      tripName: theirTripVals.tripName,
      departTime: theirTripVals.departTime,
      departTimeName: theirTripVals.departTimeName,
      departTimeUnix: theirTripVals.departTimeUnix,
      sourceCoords: theirTripVals.sourceCoords,
      destinationCoords: theirTripVals.destinationCoords,
      notes: theirTripVals.notes
    };

    const updates: any = {};
    const newPostKey = push(child(ref(db), "posts")).key;
    updates['/user-trips/' + uid + '/matched-trips/' + theirTripKey] = matchedPostData;
    updates['/user-trips/'+uid+'/my-trips/'+myTripKey+'/matched-ids/'+newPostKey] = myPostData;
    return update(ref(db), updates);
  }

  /**
   * takes the newly-matched trip and makes a new post request under
   * uid's matched-trips, under the same trip id as trip 
   * @param trip ITrip object 
   * @param db Database
   * @param uid The matched user's id
   */
  const insertUnderTheirs = (trip: ITrip, db: Database, uid: string) => {
    const tripKey = trip.tripKey; 
    const postData = {
      userid: trip.userid,
      tripName: trip.tripName,
      departTime: trip.departTime,
      departTimeName: trip.departTimeName,
      departTimeUnix: trip.departTimeUnix,
      sourceCoords: trip.sourceCoords,
      destinationCoords: trip.destinationCoords,
      notes: trip.notes
    };
    const updates: any = {};
    updates['/user-trips/' + uid + '/matched-trips/' + tripKey] = postData;
    return update(ref(db), updates);
  }