import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtI4ve4wzUs0TNpLKE6ehx-q9mzgJtHPM",
  authDomain: "estudioapp-tfg.firebaseapp.com",
  projectId: "estudioapp-tfg",
  storageBucket: "estudioapp-tfg.firebasestorage.app",
  messagingSenderId: "994542935630",
  appId: "1:994542935630:web:577609e8b14d1921e7ad1f",
  measurementId: "G-0PG2R42E51"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app); 
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Solo exportamos los servicios inicializados
export { db, storage, auth, googleProvider };