import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIyHXvNhg2bJpkFS-EKOjLXw0riSg-5_Y",
  authDomain: "dadaday-4df41.firebaseapp.com",
  projectId: "dadaday-4df41",
  storageBucket: "dadaday-4df41.firebasestorage.app",
  messagingSenderId: "24117523047",
  appId: "1:24117523047:web:28124c576b8cae48f9dac2",
  measurementId: "G-0H8424VX30"
};

// Inicializamos Firebase solo si no se ha inicializado ya
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };