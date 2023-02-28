// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from "../../pages/home"
import { firebaseKey } from '../../private/key'


// Our web app's Firebase configuration
const firebaseConfig = {
    apiKey: firebaseKey,
    authDomain: "termproj-11b0e.firebaseapp.com",
    databaseURL: "https://termproj-11b0e-default-rtdb.firebaseio.com",
    projectId: "termproj-11b0e",
    storageBucket: "termproj-11b0e.appspot.com",
    messagingSenderId: "1021468081862",
    appId: "1:1021468081862:web:2bff2386f9c2c5458861c7",
    measurementId: "G-W24NR01P41"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// use Google Authentication object 
const provider = new GoogleAuthProvider()

/**
 * function to check whether this is a @brown.edu account or not 
 * @param userEmail the email to check 
 * @returns true if brown email, false otherwise. 
 */
function validAccount(userEmail : string){
	return userEmail.split('@')[1] === 'brown.edu';
}

/**
 * allows user to sign in with their google account (brown email, specifically). 
 * @returns a Promise with the user email if valid account, "fail" otherwise. 
 */
export const signInWithGoogle = () => {
    return new Promise((resolve) => {
        signInWithPopup(auth, provider).then((result) => {
            if (result.user.email == null) {
                console.log("fail")
            }
            else {
                if
                    (validAccount(result.user.email)) {
                    resolve(result.user.email.toString) // return email
                } else {
                    resolve("fail")
                }
            }
        }).catch((error) => {
            console.log(error);
        })
    })
}



