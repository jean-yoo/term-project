/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useCallback, useEffect, useState } from "react";
import './home.css'
import {signInWithGoogle} from '../../components/auth/Firebase'
import { ITrip, makeITrip } from '../../types';
import { getAuth, signOut, Auth, User } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { MatchedTripDisplay } from "../../TripDisplay/TripDisplay";
import { initializeApp } from "firebase/app";
import airplane from '../../images/paper-airplane-vector-icon-doodle-outline-style-blue-color-paper-airplane-simple-origami-aircraft-element-drawing-doodle-vector-illustration-2HTYB13.jpeg';
import { firebaseKey } from '../../private/key'

export const TEXT_title = "Welcome to Transport at Brown";
export const login_button_text = "button to login";


// Configuration information for Firebase
const firebaseConfig = {
  apiKey: firebaseKey, // apiKey is private for defensive programming
  authDomain: "termproj-11b0e.firebaseapp.com",
  databaseURL: "https://termproj-11b0e-default-rtdb.firebaseio.com",
  projectId: "termproj-11b0e",
  storageBucket: "termproj-11b0e.appspot.com",
  messagingSenderId: "1021468081862",
  appId: "1:1021468081862:web:2bff2386f9c2c5458861c7",
  measurementId: "G-W24NR01P41"
}; 



// Initialize Firebase and created authentication
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)

/**
 * This component represents the page that the user is first directed to when they open/log into the application. When the user is signed in, they can see all of the trips that they've matched with.
 */
export const Home = () => {
  const [errorMessage, setErrorMessage] = useState('')
  // UNCOMMENT AFTER DONE TESTING?
  // const navigate = useNavigate(); //if we want to route somewhere
  const user = auth.currentUser
  const [userName, setUserName] = useState(localStorage.getItem('userName') ?? user?.displayName)
  const [trips, setTrips] = useState<ITrip[]>([])
  const db = getDatabase(app);
  const [uid, setUid] = useState<string>(localStorage.getItem('uid') ?? 'no uid')

  /**
   * Function that creates the trip by calling the makeITrip function and passes in user information to the Trip object. Also sets our state variable newTrips.
   */
  const loadMatchedTripsFromDB = useCallback( () => {
    const newTrips: ITrip[] = []
    console.log('in matched trips')
    const tripRef = ref(db, '/user-trips/' + uid +'/matched-trips')
          onValue(tripRef, (snapshot) => {
            snapshot.forEach((trip) => {
              const tripKey = trip.key;
              const tripData = trip.val();
              if (tripKey == null) {
                console.log("key error")
              }
              else {
                // Creates ITrip object with name, departure time, depart time unix, coordinates, and notes
              const tripObj = makeITrip(tripKey, uid, tripData.tripName, tripData.departTime, tripData.departTimeName, tripData.departTimeUnix, tripData.destinationCoords, tripData.sourceCoords, tripData.notes)
              newTrips.push(tripObj); // add ITrip to array
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
      localStorage.setItem('login', 'true');
      // Gets user profile info and sets the display name
      if (!localStorage.getItem('userName')) {
        const displayName: string = user?.displayName ?? 'no user name' 
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
      loadMatchedTripsFromDB()
    } else {
      // User is signed out
      localStorage.setItem('login', 'false')
    }
  }, [loadMatchedTripsFromDB])

  useEffect(() => {
    getUserInfo(auth, user)
  }, [])

  /**
   * Handles sign-in functionality by making sure that the user is using a Google and Brown email. Also puts login and username in local storage to persist across the entire session
   */
  const handleSignIn = () => {
    signInWithGoogle().then( r => {
      if (r === "fail") {
        signOut(auth);
        alert("Login failed")
      }
      else {
        localStorage.setItem('login', 'true')
        const user = auth.currentUser
        const displayName: string = user?.displayName ?? 'no name'
        setUserName(displayName)
        localStorage.setItem('userName', displayName)
        localStorage.setItem('uid', user?.uid ?? 'no uid')
        loadMatchedTripsFromDB()
      }
    })
  }

  return (
    <>
      {localStorage.getItem('login') === 'true'? 
        (<div>
        <div className="text" data-testid="text"> 
          <h1>
            Here are your matched trips, {localStorage.getItem('userName')}
          </h1>
          </div>
          {trips.map((trip) => {
            return <MatchedTripDisplay trip={trip} getUserInfo={getUserInfo} auth={auth} user={user}></MatchedTripDisplay>
          })}
          </div>)
        :
        (<div>
          <div className="child">
          <h1 aria-label={TEXT_title}>Welcome to Transport@Brown</h1>
          </div>
          <div>
            <img className="airplane" src={airplane} alt="Airplane Image"/>
          </div>
          <div className="login-button">
            <button className="log-button" onClick={handleSignIn} aria-label={login_button_text}>Login</button>
          </div>
          {errorMessage && (<h1 className="error"> {errorMessage} </h1>)}
        </div>)
        }
    </>
  )
}