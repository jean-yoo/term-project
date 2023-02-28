import React, { Dispatch, SetStateAction, useState } from "react";
import "./book.css";
import { ITrip } from "../../types/ITrip";
import { makeICoordinate } from "../../types/ICoordinate";
import { makeITrip } from "../../types";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, push, update } from "firebase/database";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { findMatch } from "../../components/filter/Filter";
import { auth } from "../home";
import globe from "../../images/6-3.jpeg";
import { Autocomplete, LoadScript, LoadScriptProps} from '@react-google-maps/api';
import { autocompleteKey, firebaseKey } from '../../private/key'

/**
 * Class for loading the Google Maps script only on the first time the user 
 * loads the page; the original Google Maps API for react had bugs with re-loading the
 * script every single time the page was re-rendered, so we had to find this 
 * solution on google. 
 * (https://github.com/JustFly1984/react-google-maps-api/issues/70)
 */
class LoadScriptOnlyIfNeeded extends LoadScript {
  componentDidMount() {
    const cleaningUp = true
    const isBrowser = typeof document !== "undefined" // require('@react-google-maps/api/src/utils/isbrowser')
    const isAlreadyLoaded = window.google && window.google.maps && document.querySelector('body.first-hit-completed') // AJAX page loading system is adding this class the first time the app is loaded
    if (!isAlreadyLoaded && isBrowser) {
      // @ts-ignore
      if (window.google && !cleaningUp) {
        console.error("google api is already presented")
        return
      }

      this.isCleaningUp().then(this.injectScript)
    }

    if (isAlreadyLoaded) {
      this.setState({ loaded: true })
    }
  }
}

/**
 * ControlledInputProps has a value, a function to set the value state, and an ariaLabel
 */
interface ControlledInputProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  ariaLabel: string;
  placeholder: string;
}

/**
 * ControlledInput is of type ControlledInputProps and sets the value when the input is changed
 * @param value the input value
 * @param setValue a function to manage value state
 * @param ariaLabel the aria label
 * @returns input div
 */
function ControlledInput({
  value,
  setValue,
  ariaLabel,
  placeholder,
}: ControlledInputProps) {
  return (
    <textarea
      className="note-input"
      value={value}
      onChange={(ev) => setValue(ev.target.value)}
      aria-label={ariaLabel}
      placeholder={placeholder}
    ></textarea>
  );
}
// prop to pass into loadscript component so that specific places load 
// as autocomplete when the user types in places to book a page. 
const googleMapsLibraries: LoadScriptProps['libraries'] = ["places"];

/**
 * Function loaded when booking page is rendered. 
 * @returns the div elements for the booking page. 
 */
const Book = () => {
  const [date, setDate] = useState(new Date());
  const [autocompletesource, setAutocompleteSource] = useState<any>(null);

  const [sourceLat, setSourceLat] = useState("");
  const [sourceLng, setSourceLng] = useState("");

  const [destinationLat, setDestinationLat] = useState("");
  const [destinationLng, setDestinationLng] = useState("");

  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [sourceLoc, setSourceLoc] = useState<any>(undefined)
  const [destLoc, setDestLoc] = useState<any>(undefined)


  const firebaseConfig = {
    apiKey: firebaseKey,
    authDomain: "termproj-11b0e.firebaseapp.com",
    databaseURL: "https://termproj-11b0e-default-rtdb.firebaseio.com",
    projectId: "termproj-11b0e",
    storageBucket: "termproj-11b0e.appspot.com",
    messagingSenderId: "1021468081862",
    appId: "1:1021468081862:web:2bff2386f9c2c5458861c7",
    measurementId: "G-W24NR01P41",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const insert = (trip: ITrip) => {
    const db = database;
      // Get a key for a new Post.
    const newPostKey = push(child(ref(db), "posts")).key;
    if (newPostKey == null) { // type checking for defensive programming 
      console.log("key error")
    } else {
    trip.tripKey = newPostKey;
    // A post entry.
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
      updates["/all-trips/" + newPostKey] = postData;
      updates["/user-trips/" + trip.userid + "/my-trips/" + newPostKey] =
        postData;
      return update(ref(db), updates);
    }
  };

  /**
   * Function to be called when the submit button gets clicked. 
   */
  const handleSubmit = () => {
    const user = auth.currentUser;
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      const displayName = user.displayName;

      const coor1 = makeICoordinate(sourceLat, sourceLng);

      const coor2 = makeICoordinate(destinationLat, destinationLng);
      const dateName = date.toLocaleString("en-US");
      // this will be used when filtering trips based on time later 
      const dateUnix = Math.floor(date.getTime() / 1000); 

      // make sure the user is logged in and entered in every required field 
      if (localStorage.getItem('login') === 'true' && (dateName !== "") && (sourceAddress !== "") && (destinationAddress !== "") && coor1 && coor2) {
        // make new trip object 
        const trip = makeITrip(
        "",
        uid,
        displayName + " " + sourceAddress + " to " + destinationAddress,
        date,
        dateName,
        dateUnix,
        coor1,
        coor2,
        notes
        );
        // insert into database 
        insert(trip);
        // find matches for this new trip 
        findMatch(trip);
        // reset states 
        setSourceLat("");
        setSourceLng("");
        setDestinationLat("");
        setDestinationLng("");
  
        setSourceAddress("");
        setDestinationAddress("");
  
        setNotes("");

        setDestLoc("")
        setSourceLoc("")
        setDate(new Date())
        // alert user 
        window.confirm("Trip has been booked");
        window.location.reload();
      } else {
        window.confirm("Not all trip information has been entered")
      }
    } else {
      window.confirm("Not signed in")
      setSourceLat("");
      setSourceLng("");
      setDestinationLat("");
      setDestinationLng("");

      setSourceAddress("");
      setDestinationAddress("");

      setNotes("");

      setDestLoc("")
      setSourceLoc("")
      setDate(new Date())

    }
  };

  /**
   * when the user selects a new place, get the latitude, longitude, and
   * name associated with that place 
   */
  const changeSource = () => {
    setSourceLat(autocompletesource.getPlace().geometry.location.lat().toString());
    setSourceLng(autocompletesource.getPlace().geometry.location.lng().toString());
    setSourceAddress(autocompletesource.getPlace().name);
  }

  /**
   * set location to default autocomplete place when book page is
   * first loaded 
   * @param auto the state variable keeping track of the place from the
   * autocomplete API. 
   */
  const loadAutoSrc = (auto: google.maps.places.Autocomplete) => {
    setAutocompleteSource(auto)
  }

  return (
    <div className="form" data-testid="form">
       <LoadScriptOnlyIfNeeded googleMapsApiKey={autocompleteKey} libraries={googleMapsLibraries}>
      <div className="form-info" data-testid="form-info">
        <h1 className="book-header" data-testid="schedule trip">Schedule a Trip</h1>
        <div className="form-elt">
          <div className="book-text">Source Location</div>
            <div className="location-input">   
          <Autocomplete
            onLoad={(auto) => {loadAutoSrc(auto)}}
            onPlaceChanged=
            {changeSource}
          >
            <input
              type="text"
              placeholder="Enter your departure location"
              style={{
                width: `240px`,
              }}
              value={sourceLoc}
              data-testid="departure location"

            />
          </Autocomplete>
          </div>
        </div>
        <br></br>
        <div className="form-elt">
          <div className="book-text">Destination Location</div>
          <div className="location-input">
          <Autocomplete
            onLoad={(auto) => loadAutoSrc(auto)}
            onPlaceChanged={() => {changeSource()}}
          >
                <input
                  type="text"
                  placeholder="Enter your destination location"
                  style={{
                    width: `240px`,
                  }}
                  value={destLoc}
            />
          </Autocomplete>
          </div>
        </div>
        <br></br>
        <div className="form-elt">
          <div className="book-text" >
            Departure date/time from the source location
          </div>
          <div className="departure-date-inut" aria-description="there is a calendar and time selection to enter date and time">
            <DatePicker
              className="departure-date-input"
              aria-description = "place to enter date and time of departure from source location to book a trip"
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mmaa"
                selected={date}
              onChange={(newDate) => {
                if (newDate != null) {
                  setDate(newDate);
                }
              }}

              required
            />
          </div>
        </div>
        <br></br>
        <div className="form-elt" >
          <div className="note-text">Enter any notes</div>
          <div className="note-input">
            <ControlledInput
              aria-description="place to enter notes about trip to book"
              value={notes}
              setValue={setNotes}
              ariaLabel={"change this later"}
              placeholder="Notes"
            />
          </div>
        </div>
        <br></br>
        <br></br>
        <button
          className="submit-trip"
          type="submit"
          onClick={() => handleSubmit()}
          aria-description ="submit button to book a trip"
        >
          Submit{" "}
        </button>
      </div>
      <div id="globeContainer">
        <img className="globe" src={globe} alt="Globe Image" />
      </div>
      {errorMessage && <p className="error"> {errorMessage} </p>}
      </LoadScriptOnlyIfNeeded>
    </div>)
};

export default Book;