import { openDB } from 'idb';

const DB_NAME = 'PokerGameDB';
const STORE_NAME = 'gameState';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export async function saveGameState(state) {
  const db = await getDB();
  await db.put(STORE_NAME, JSON.parse(JSON.stringify(state)), 'currentGame');
}

export async function loadGameState() {
  const db = await getDB();
  const state = await db.get(STORE_NAME, 'currentGame');
  return state ? JSON.parse(JSON.stringify(state)) : null;
}

export async function clearGameState() {
  const db = await getDB();
  await db.delete(STORE_NAME, 'currentGame');
}

