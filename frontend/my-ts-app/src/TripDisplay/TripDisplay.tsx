import { Auth, User } from "firebase/auth";
import { getDatabase, ref, remove, onValue } from "firebase/database";
import { ITrip } from "../types"
import './TripDisplay.scss'

/**
 * ITripDisplayProps is an interface for different ways to display a trip
 */
export interface ITripDisplayProps {
  trip: ITrip
  getUserInfo: (auth: Auth, user: User | null) => void
  auth: Auth
  user: User | null
}

/**
 * PersonalTripDisplay displays a user's trips on their profile page
 * @param props interface for an ITrip
 * @returns div displaying the trip
 */
export const PersonalTripDisplay = (props: ITripDisplayProps) => {
  
  const { trip, getUserInfo, auth, user } = props
  const notes = trip.notes
  const tripName = trip.tripName
  const time = trip.departTimeName
  const myuid = trip.userid
  const departTime = "Departure Date/Time " + time
  const displayNotes = "Notes: " + notes

  /**
  * Function that handles deleting a trip from the user's trip display
  */
  const handleDelete = () => {
    const deletedTripKey = trip.tripKey
    const db = getDatabase();

    const matchedIdRef = ref(db, "/user-trips/" + myuid + "/my-trips/" + deletedTripKey + "/matched-ids");
    onValue(matchedIdRef, (snapshot) => {
      snapshot.forEach((match) => {
        const matchuid = match.val().split("/")[0];
        const matchTripKey = match.val().split("/")[1];
        console.log("should be -NJWwJQgHL.. " + matchTripKey)

        // Removes a matched trip from the current user's matches
        const matchedRef = ref(db, "/user-trips/" + myuid + "/matched-trips/" + matchTripKey);
        remove(matchedRef).then(() => {
          console.log("A matched trip removed from my matches");
        })

        // Removes the trip from the corresponding user's matched trips
        const otherUserMatchRef = ref(db, "/user-trips/" + matchuid + "/matched-trips/" + deletedTripKey)
        remove(otherUserMatchRef).then(() => {
          console.log("My trip removed from other user's matches");
        })
      })
    })

    // Removes the original trip from my-trips
    const tripRef = ref(db, "/user-trips/" + myuid + "/my-trips/" + deletedTripKey);
    remove(tripRef).then(() => {
      console.log("trip removed from my trips");
    })

    // Remove the original trip from all-trips
    const allTripsRef = ref(db, "/all-trips/" + deletedTripKey);
    remove(allTripsRef).then(() => {
      console.log("trip removed from all trips");
    })
  getUserInfo(auth, user)
  }

  /**
   * JSX representing the UI for an individual trip
   */
  return (
    <div className='trip-display'>
      <strong>{tripName}</strong>
      <br></br>
      <br></br>
      {departTime}
      <br></br>
      <br></br>
      {displayNotes}
      <br></br>
      <br></br>
      <button className="delete-button"  
      onClick={() => handleDelete()}>Delete</button>
    </div>
  )
}

/**
 * MatchedTripDisplay displays a other user's trips who have matched with a user
 * @param props interface for an ITrip
 * @returns div displaying the trip
 */
export const MatchedTripDisplay = (props: ITripDisplayProps) => {
  const { trip } = props
  const notes = trip.notes
  const name = trip.tripName 
  const time = trip.departTimeName

  const displayDetail = "Trip: " + name 
  const displayTime = "Departure time: " + time
  const displayNotes = "Notes: " + notes

  return (
    <div className='match-trip-display'>
      <strong>{displayDetail}</strong>
      <br></br>
      {displayTime}
      <br></br>
      {displayNotes}
      <br></br>
      <br></br>
    </div>
  )
}