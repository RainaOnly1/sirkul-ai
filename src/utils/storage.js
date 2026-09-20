import { SEED_ITEMS } from '../data/constants.js';

const LS_KEY = 'sirkul_ai_state_v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // localStorage tidak tersedia atau data korup — pakai default
  }
  return {
    items: SEED_ITEMS,
    needs: [],
    claimed: {},
    you: { pts: 60, name: 'Kamu' },
    chats: {}
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    // storage penuh atau diblokir — lewati diam-diam
  }
}
