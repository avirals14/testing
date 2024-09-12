// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADBlVxXVx7a3-_oxO9uid1ca08DCjkKIQ",
  authDomain: "sair-india-829a4.firebaseapp.com",
  projectId: "sair-india-829a4",
  storageBucket: "sair-india-829a4.appspot.com",
  messagingSenderId: "895834721244",
  appId: "1:895834721244:web:47a4d385dd259f4f841d19",
  measurementId: "G-HEMQJH7350"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);