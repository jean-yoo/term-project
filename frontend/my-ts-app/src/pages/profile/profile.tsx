import React, {useCallback, useEffect, useState } from "react";
import './profile.css'
import { signOut, User, Auth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { ITrip, makeITrip } from "../../types";
import { PersonalTripDisplay } from "../../TripDisplay/TripDisplay";
import {auth} from "../home"
  
/**
 * This component represents the user's profile and displays a list of the trips that the user has created themselves.
 */
export const Profile = () => {
  const user = auth.currentUser
  const [userName, setUserName] = useState(localStorage.getItem('userName') ?? user?.displayName)
  const [trips, setTrips] = useState<ITrip[]>([])
  const db = getDatabase()
  const [uid, setUid] = useState<string>(localStorage.getItem('uid') ?? 'no uid')

  const [loggedIn, setLoggedIn] = useState(false)

  /**
   * Function that loads the user's trips from the database via a db reference and trip key and trip data information
   */
  const loadTripsFromDB = useCallback( () => {
    const newTrips: ITrip[] = []
    const tripRef = ref(db, '/user-trips/' + uid +'/my-trips')
        onValue(tripRef, (snapshot) => {
          snapshot.forEach((trip) => {
            const tripKey = trip.key;
            const tripData = trip.val();
            if (tripKey == null) {
              console.log("key error")
            } else {
                // Creates ITrip object with requisite information
                const tripObj = makeITrip(tripKey, uid, tripData.tripName, tripData.departTime, tripData.departTimeName, tripData.departTimeUnix, tripData.destinationCoords, tripData.sourceCoords, tripData.notes)
                // Adds ITrip to array
                newTrips.push(tripObj);
            }

          })
          setTrips(newTrips)
        })
  }, [])

  /**
   * Callback function that retrieves the user information when they login to the application
   */
  const getUserInfo = useCallback( (auth: Auth, user: User | null) => {
    if (localStorage.getItem('login') === 'true') {
      setLoggedIn(true)
      localStorage.setItem('login', 'true');
      // Retrieves user's information and sets their display name
      if (!localStorage.getItem('userName')) {

        const displayName: string = user?.displayName ?? '' 
        localStorage.setItem('userName', user?.displayName ?? "")
        setUserName(displayName)
      }
      else {
        const name = localStorage.getItem('userName')
        setUserName(name)
      }
      let uid: string = ''
      if (!localStorage.getItem('uid')) {
        uid = user?.uid ?? 'no uid'
        localStorage.setItem('uid', user?.uid ?? "")
      }
      else {
        uid = localStorage.getItem('uid') ?? ''
      }
      loadTripsFromDB()
    } else {
      // User is signed out
      setLoggedIn(false)
    }
  }, [loadTripsFromDB])

  useEffect(() => {
    getUserInfo(auth, user)
  }, [])

  /**
   * Handles sign out functionality by removing the login check, username, and uid from local storage. When the page is refreshed, the user will be signed out
   */
  const handleSignOut = () => {
    signOut(auth).then(() => {
      setLoggedIn(false)
      localStorage.removeItem('login')
      localStorage.removeItem('userName')
      localStorage.remove('uid')
    }).catch((error) => {
      console.log("sign out error")
    });
    localStorage.removeItem('login');
  }
  
  return (
    <>
      {localStorage.getItem('login') === 'true' ?
        (<div>
          <div className="text">
          <h1>
            Here are your current trips, {localStorage.getItem('userName')}
            </h1>
          </div>
          {trips.map((trip) => {
            return <PersonalTripDisplay trip={trip} getUserInfo={getUserInfo} auth={auth} user={user}></PersonalTripDisplay>
          })}
          <div className="submit-trip">
            <button onClick={handleSignOut} aria-label="Sign out button">Sign Out </button>
          </div>
        </div>)
        :
        (<div>
          <div className="text">
          <h1>Not signed in</h1>
          </div>
        </div>)
        }
    </>
  )
}