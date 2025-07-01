// firebase-config.js

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDMbEmBJjGn_dp0zZR1M5pvlru6cieHYT0",
  authDomain: "edutrack-8761f.firebaseapp.com",
  projectId: "edutrack-8761f",
  storageBucket: "edutrack-8761f.appspot.com", // Corrigido .app para .appspot.com
  messagingSenderId: "974847944038",
  appId: "1:974847944038:web:56f22e2982e83e0741d4a7",
  measurementId: "G-YE1B9SQGGM"
};

// Inicializa o Firebase (modo compatível com HTML)
firebase.initializeApp(firebaseConfig);
