// ============================================================
// TUTORIS - UNSAAC | Configuración Firebase
// ============================================================
// 📌 INSTRUCCIONES (solo necesitas hacer esto una vez):
//
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto (ej: "tutoris-unsaac")
// 3. En el proyecto, ve a "Authentication" → "Sign-in method"
//    → Activa "Google" y "Correo electrónico/contraseña"
// 4. Ve a "Configuración del proyecto" (ícono engranaje)
//    → "Tus aplicaciones" → "Agregar app" → Web (</>)
// 5. Copia los valores del objeto firebaseConfig y pégalos abajo
// 6. En "Authentication" → "Settings" → "Dominios autorizados"
//    Agrega tu dominio de GitHub Pages (ej: usuario.github.io)
// ============================================================

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_ID_DE_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};
