import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  onSnapshot,
  Unsubscribe
} from "firebase/firestore"
import { db } from "./firebase"
import { Container } from "./types"

const INVENTORY_COLLECTION = "inventory"
const CONTAINERS_DOC = "containers"

export async function getContainers(): Promise<Container[]> {
  try {
    const docSnap = await getDocs(collection(db, INVENTORY_COLLECTION))
    
    for (const document of docSnap.docs) {
      if (document.id === CONTAINERS_DOC) {
        const data = document.data()
        return data.containers || []
      }
    }
    return []
  } catch (error) {
    console.error("Error fetching containers from Firestore:", error)
    throw error
  }
}

export async function saveContainers(containers: Container[]): Promise<void> {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, CONTAINERS_DOC)
    await setDoc(docRef, { 
      containers,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error saving containers to Firestore:", error)
    throw error
  }
}

export function subscribeToContainers(
  callback: (containers: Container[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, INVENTORY_COLLECTION, CONTAINERS_DOC)
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        callback(data.containers || [])
      } else {
        callback([])
      }
    },
    (error) => {
      console.error("Firestore subscription error:", error)
      if (onError) onError(error)
    }
  )
}

export async function initializeDefaultData(defaultContainers: Container[]): Promise<boolean> {
  try {
    const existing = await getContainers()
    if (existing.length === 0) {
      await saveContainers(defaultContainers)
      console.log("Initialized Firestore with default data")
      return true
    }
    return false
  } catch (error) {
    console.error("Error initializing default data:", error)
    throw error
  }
}
