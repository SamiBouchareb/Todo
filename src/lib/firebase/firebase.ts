import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDD102d4VEjSfUEkJYKn32QRpJYXESWP4Y",
  authDomain: "testrsad.firebaseapp.com",
  projectId: "testrsad",
  storageBucket: "testrsad.firebasestorage.app",
  messagingSenderId: "738617376018",
  appId: "1:738617376018:web:10bd7fd05f41b8412807cb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
