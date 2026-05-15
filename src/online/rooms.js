import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import app from "../firebase";

import { dealCardsForCounts } from "../game/deck";

const db = getFirestore(app);

export async function createRoom(hostName) {
  const roomRef = await addDoc(collection(db, "rooms"), {
    host: hostName,
    createdAt: Date.now(),
    status: "waiting",
    maxPlayers: 5,
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

export async function startRoomGame(roomId) {
  if (!roomId) return;

  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const room = roomSnap.data();
  const roomPlayers = room.players || [];

  const counts = roomPlayers.map(() => 1);
  const dealt = dealCardsForCounts(counts);

  const allHands = [dealt.player, ...dealt.bots];

  await updateDoc(roomRef, {
    status: "playing",
    startedAt: Date.now(),
    gameState: {
      round: 1,
      phase: "bidding",
      players: roomPlayers.map((player, index) => ({
        id: index,
        name: player.name,
        cardsCount: 1,
        hand: allHands[index] || [],
        eliminated: false,
      })),
      currentPlayerIndex: 0,
      declaredCard: "",
      currentBidPower: -1,
      lastDeclarerIndex: null,
      history: ["Gra rozpoczęta", "Rozdano karty"],
    },
  });
}

export async function deleteRoom(roomId) {
  if (!roomId) return;

  await deleteDoc(doc(db, "rooms", roomId));
}



export async function joinRoom(roomId, playerName) {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Pokój nie istnieje.");
  }

  const room = roomSnap.data();
  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 5;

  if (room.status !== "waiting") {
    throw new Error("Gra w tym pokoju już trwa.");
  }

  if (players.length >= maxPlayers) {
    throw new Error("Pokój jest pełny.");
  }

  const alreadyInRoom = players.some(
    (player) => player.name.toLowerCase() === playerName.toLowerCase()
  );

  if (alreadyInRoom) {
    throw new Error("Ten nick jest już w pokoju.");
  }

  await updateDoc(roomRef, {
    players: [
      ...players,
      {
        name: playerName,
        ready: false,
      },
    ],
  });

  return roomId;
}

export function listenToRooms(callback) {
  return onSnapshot(collection(db, "rooms"), (snapshot) => {
    const rooms = snapshot.docs
      .map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      .filter((room) => room.status === "waiting")
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(rooms);
  });
}

export function listenToRoom(roomId, callback) {
  return onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snapshot.id,
      ...snapshot.data(),
    });
  });
}

export async function leaveRoom(roomId, playerName) {
  if (!roomId || !playerName) return;

  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;

  const room = roomSnap.data();
  const players = room.players || [];

  const updatedPlayers = players.filter(
    (player) => player.name.toLowerCase() !== playerName.toLowerCase()
  );

  if (updatedPlayers.length === 0 || room.host === playerName) {
    await deleteDoc(roomRef);
    return;
  }

  await updateDoc(roomRef, {
    players: updatedPlayers,
  });
}