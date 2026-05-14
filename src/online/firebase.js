import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_WKLEISZ",
  authDomain: "TU_WKLEISZ",
  projectId: "TU_WKLEISZ",
  storageBucket: "TU_WKLEISZ",
  messagingSenderId: "TU_WKLEISZ",
  appId: "TU_WKLEISZ",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);