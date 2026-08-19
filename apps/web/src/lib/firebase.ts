"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_-LpaFZi9mEqbz5yWfwLevueeobYCukU",
  authDomain: "mscholar-sms.firebaseapp.com",
  projectId: "mscholar-sms",
  storageBucket: "mscholar-sms.firebasestorage.app",
  messagingSenderId: "977048971630",
  appId: "1:977048971630:web:ca8ab4c5becb683e6e797f",
};

export function getFirebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
