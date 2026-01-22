"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBhYHAE0Y0g7sMH5kjn40X-Lx28qbf2sQw",
  authDomain: "inventorymanagement-8b396.firebaseapp.com",
  projectId: "inventorymanagement-8b396",
  storageBucket: "inventorymanagement-8b396.firebasestorage.app",
  messagingSenderId: "1033209128765",
  appId: "1:1033209128765:web:56aa8f5aed5ce64cdc4754",
  measurementId: "G-21D64CXRX5"
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

export { app, db }
