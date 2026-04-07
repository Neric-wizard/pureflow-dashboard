// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDprRH2HHhWh-AhnJxZV1gfAFbRLRE4XEc",
  authDomain: "pureflow-dashboard.firebaseapp.com",
  projectId: "pureflow-dashboard",
  storageBucket: "pureflow-dashboard.firebasestorage.app",
  messagingSenderId: "877501739630",
  appId: "1:877501739630:web:177c8645b6d3422729ac7f",
  measurementId: "G-NGW5Y60KLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Listen to sensor data from ESP32
export const listenToSensorData = (callback) => {
  const sensorRef = ref(database, 'sensors');
  return onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};