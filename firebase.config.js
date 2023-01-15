import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
 // apiKey: "AIzaSyCYFpDIbEH7cZ3F_6F-Sq5aasTP3bTmCtU",
    apiKey: "AIzaSyD-8fyxUkAdpcaKt9tVNzAIv8a6x02YV1g",
    authDomain: "taskmanager-cm3070.firebaseapp.com",
    databaseURL: "https://taskmanager-cm3070-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "taskmanager-cm3070",
    storageBucket: "taskmanager-cm3070.appspot.com",
    messagingSenderId: "202529402957",
    appId: "1:202529402957:web:968ab81b613aa63ec86c04",
    measurementId: "G-BPJB8BJVN7"
  };

let app;

if (firebase.apps.length === 0){
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app()
}

const db = app.firestore();
// const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
  });

export {app, db, auth};
