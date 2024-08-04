// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; Not important time 14:34
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuYhCLqDTA6wTqKbM-132hwKxMfmQVY_A",
  authDomain: "inventory-management-33b48.firebaseapp.com",
  projectId: "inventory-management-33b48",
  storageBucket: "inventory-management-33b48.appspot.com",
  messagingSenderId: "882060397834",
  appId: "1:882060397834:web:e1cb98987550a678f2bef3",
  measurementId: "G-DBH0KGV6BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };