import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import app from "../firebase";

const db = getFirestore(app);

export async function createRoom(hostName) {
  const roomRef = await addDoc(collection(db, "rooms"), {
    host: hostName,
    createdAt: Date.now(),
    status: "waiting",
    players: [
      {
        name: hostName,
        ready: false,
      },
    ],
  });

  return roomRef.id;
}

export async function getRoom(roomId) {
  const roomDoc = await getDoc(doc(db, "rooms", roomId));

  if (!roomDoc.exists()) {
    return null;
  }

  return {
    id: roomDoc.id,
    ...roomDoc.data(),
  };
}

export async function deleteRoom(roomId) {
  if (!roomId) return;

  await deleteDoc(doc(db, "rooms", roomId));
}
