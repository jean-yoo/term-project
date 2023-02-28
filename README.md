# CS32 Term Project: Transport @Brown
syoo28, kcai6, ali190, pli46

~30 hrs

https://github.com/cs0320-f2022/term-project-ali190-kcai6-pli46-syoo28

## Design Choices
### Types
#### ICoordinate
An `ICoordinate` represents a coordinate location with the latitude and longitude
as strings.

#### ITrip
An `ITrip` represents a trip, and is used to put trips into the database and to
convert them back to usable types when loaded in from the database.

### Frontend
There are 3 main pages of our webapp.

#### Home
The code for this page is located in `home.tsx`, `auth.tsx`, and `TripDisplay.tsx`. 
The home page shows the login page when first loaded. There is a login button
that uses Google Authentication from Firebase. In `auth.tsx`, the `signInWithGoogle`
method tries to sign in, and checks that if the user is in the `brown.edu` domain.

After a user logs in successfully, the page renders all the matched trips for the
user. It does this using `MatchedTripsDisplay` from `TripDisplay.tsx`.

#### Profile
The code for this page is located in `profile.tsx` and `TripDisplay.tsx`.

If a user is logged in, the page loads in the user's trips from the Firebase 
database and displays a list of the user's trips using `PersonalTripDisplay` 
from `TripDisplay.tsx`. There is also a sign out button fora user to log out of their account.

If a user is not logged in, the trip only displays a message saying so, and does
not display any trips.

#### Book
The code for the Book page is located in `book.tsx`. It contains divs where the user can input the source/destination locations, departure time, and any notes about their contact information. Much of the departure time component and the location/map component come from existing react modules from npm.
- `LoadScriptOnlyIfNeeded` is a class for loading the Google Maps script only on the first time the user loads the page. The original Google Maps API for react had bugs with re-loading the script every single time the page was re-rendered, so we had to find [this solution on google](https://github.com/JustFly1984/react-google-maps-api/issues/70). 
- When the submit button is clicked, `handleSubmit` extracts the current user’s id, the location’s coordinates, and date, and makes a new `ITrip` object.
	- This is passed into `insert`, which inserts the newly-booked trip into the database. 
	- Then `findMatch` is called to find and insert into the dabase existing trips that are a match, in terms of departure time and location, with this newly-booked trip. 
	- `changeSource` and `loadAutoSrc` initialize and update the state variables holding the information about the places selected from the Google Maps Autocomplete API (such as name, latitude, longitude).

### Backend
Our backend uses Firebase Realtime Database to store trips. 

There are two fields: `all-trips`, which stores all the trips booked, and 
`user-trips`, which has keys for each user's id and then stores all their trips.

Inside of `user-trips`, there are two fields: `my-trips` and `matched-trips`.
Each trip's key is the userid. The trip's fields are `userid`, `tripName`, `departTime`,
`departTimeName`, `departTimeUnix`, `sourceCoords`, `destinationCoords`, and `notes`.

If a trip matches with another trip, another field is added to trips in `my-trips`
called `matched-ids`, which stores the user id and trip id of the matched trip.

We get the trip’s departure time and add/subtract 1 hour to get the time range that we want. Then we load in the data from the database to filter on, by querying from all trips whose departure times are within that specified range, and are not the current user’s own trips. Then we compute the distance, in km, between the current trip and all the query-returned trips’ departure and source locations. If they are within 10miles/17km of each other, it is a match. 

1. The matched trip and user ids are put under the current user’s trip, under matched-id, in the database. 
2. The matched trip is put under the current user’s matched-trip list.
3. The matched trip is put under the matched user’s matched-trip list. 

## Errors/Bugs
- When the user first tries to delete their trip, _their_ trip gets deleted from their profile, but the matched trips don’t get deleted from the current user or the matched user’s end. However, this bug does not appear for any subsequently-made trips. We were not able to pinpoint where the issue in the database was. 
- When User 1 has two trips that match one of User 2’s trips, and User 1 deletes one of their trips, User 2 gets completely deleted from the matched trips page without accounting for the fact that User 1 still has a trip remaining matching User 2. We tried resolving this by maintaining a list of matched ids for each user so that two of the same user-ids would appear if a trip matched twice, but the matched relationships got too tangled once we tried matching among 3 or 4 people. We decided to leave this as is, since this is an edge case (there has to be some traveling time in between each trip, so it’s unlikely for a person to have 2 _simultaneous_ trips that both match another person’s trip). 

## Tests
Tests are located in `App.test.tsx`.
The tests check for correct rendering of the different pages depending on whether
or not a user is signed in.
They also check that different text, buttons, etc. are correctly rendered.

## How to...
To run tests:
Navigate to the `frontend/my-ts-app` directory and run `npm test`. 

To start the webapp:
Navigate to the `frontend/my-ts-app` directory and run `npm start`. 

