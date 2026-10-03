// Simple global state for the CutPreview prototype. AsyncStorage-persisted.
// No third-party state lib; just a tiny observable pattern.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import type { FadeType, Gender, RegionKey, Texture } from "./data/regions";
import { HAIR_COLORS } from "./data/regions";
import { AVATARS, findAvatar } from "./data/avatars";
import { findStyle } from "./data/styles";

export interface RegionParams {
  lengthCm: number;
  fade?: FadeType;
  fadeHeight?: number;
  texture?: Texture;
  volume?: number;
  partingSide?: "left" | "right" | "center" | "none";
  partingPos?: number;
  color?: string;
}

export type VariantParams = Partial<Record<RegionKey, RegionParams>> & {
  globalColor?: string;
};

export interface SavedVersion {
  id: string;
  name: string;
  createdAt: number;
  avatarId: string;
  styleId: string;
  gender: Gender;
  params: VariantParams;
}

interface State {
  avatarId: string;
  activeGender: Gender;
  activeStyleId: string | null;
  params: VariantParams;
  favorites: string[]; // style ids
  recent: string[]; // style ids
  versions: SavedVersion[];
  history: VariantParams[];
  future: VariantParams[];
  hydrated: boolean;
}

const KEY = "cutpreview_state_v1";

const initial: State = {
  avatarId: AVATARS[0].id,
  activeGender: "men",
  activeStyleId: null,
  params: {},
  favorites: [],
  recent: [],
  versions: [],
  history: [],
  future: [],
  hydrated: false,
};

let state: State = { ...initial };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function persist() {
  const { hydrated, history, future, ...rest } = state;
  AsyncStorage.setItem(KEY, JSON.stringify(rest)).catch(() => {});
}

export async function hydrate() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed, history: [], future: [], hydrated: true };
    } else {
      state = { ...state, hydrated: true };
    }
  } catch {
    state = { ...state, hydrated: true };
  }
  emit();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => sel(state),
    () => sel(state),
  );
}

export function getState() {
  return state;
}

function pushHistory() {
  state.history = [...state.history, state.params].slice(-30);
  state.future = [];
}

// ---- Actions ----

export function setAvatar(id: string) {
  const a = findAvatar(id);
  if (!a) return;
  state = { ...state, avatarId: id, activeGender: a.gender };
  emit();
  persist();
}

export function setGender(g: Gender) {
  state = { ...state, activeGender: g };
  emit();
  persist();
}

export function applyStyle(styleId: string) {
  const s = findStyle(styleId);
  if (!s) return;
  pushHistory();
  const p: VariantParams = {};
  const b = s.base;
  if (s.gender === "men") {
    p.top = { lengthCm: b.topCm ?? 4, texture: b.texture, volume: b.volume };
    p.fringe = { lengthCm: b.fringeCm ?? b.topCm ?? 4, texture: b.texture };
    p.sides = {
      lengthCm: b.sidesCm ?? 1,
      fade: b.fade,
      fadeHeight: b.fadeHeight,
      texture: b.texture,
    };
    p.back = { lengthCm: b.backCm ?? 1, fade: b.fade, texture: b.texture };
    p.sideburns = { lengthCm: b.sideburnsCm ?? 0.6 };
    p.beard = { lengthCm: b.beardCm ?? 0.8 };
  } else {
    p.crown = { lengthCm: b.crownCm ?? 20, texture: b.texture, volume: b.volume };
    p.layers = { lengthCm: b.layersCm ?? 15, texture: b.texture };
    p.bangs = { lengthCm: b.bangsCm ?? 0, texture: b.texture };
    p.sides = { lengthCm: b.crownCm ?? 25, texture: b.texture };
    p.ends = { lengthCm: b.endsCm ?? 30, texture: b.texture };
    p.parting = {
      lengthCm: 0,
      partingSide: b.partingSide ?? "center",
      partingPos: b.partingPos ?? 50,
    };
  }
  const color = b.color ?? HAIR_COLORS[0];
  Object.keys(p).forEach((k) => {
    (p as any)[k] = { ...(p as any)[k], color };
  });
  const recent = [styleId, ...state.recent.filter((x) => x !== styleId)].slice(0, 12);
  state = {
    ...state,
    activeStyleId: styleId,
    activeGender: s.gender,
    params: { ...p, globalColor: color },
    recent,
  };
  emit();
  persist();
}

export function updateRegion(key: RegionKey, patch: Partial<RegionParams>) {
  pushHistory();
  const cur = state.params[key] ?? { lengthCm: 0 };
  const next: VariantParams = { ...state.params, [key]: { ...cur, ...patch } };
  state = { ...state, params: next };
  emit();
  persist();
}

export function resetRegion(key: RegionKey) {
  if (!state.activeStyleId) return;
  const s = findStyle(state.activeStyleId);
  if (!s) return;
  pushHistory();
  // Rebuild that region from base.
  applyStyle(state.activeStyleId);
}

export function resetAll() {
  if (state.activeStyleId) applyStyle(state.activeStyleId);
}

export function undo() {
  if (state.history.length === 0) return;
  const prev = state.history[state.history.length - 1];
  state = {
    ...state,
    params: prev,
    history: state.history.slice(0, -1),
    future: [state.params, ...state.future].slice(0, 30),
  };
  emit();
}

export function redo() {
  if (state.future.length === 0) return;
  const nx = state.future[0];
  state = {
    ...state,
    params: nx,
    future: state.future.slice(1),
    history: [...state.history, state.params].slice(-30),
  };
  emit();
}

export function toggleFavorite(id: string) {
  const has = state.favorites.includes(id);
  state = {
    ...state,
    favorites: has ? state.favorites.filter((x) => x !== id) : [...state.favorites, id],
  };
  emit();
  persist();
}

export function saveVersion(name: string) {
  if (!state.activeStyleId) return null;
  const v: SavedVersion = {
    id: `v${Date.now()}`,
    name: name || `نسخة ${state.versions.length + 1}`,
    createdAt: Date.now(),
    avatarId: state.avatarId,
    styleId: state.activeStyleId,
    gender: state.activeGender,
    params: state.params,
  };
  state = { ...state, versions: [v, ...state.versions] };
  emit();
  persist();
  return v;
}

export function deleteVersion(id: string) {
  state = { ...state, versions: state.versions.filter((v) => v.id !== id) };
  emit();
  persist();
}

export function loadVersion(id: string) {
  const v = state.versions.find((x) => x.id === id);
  if (!v) return;
  state = {
    ...state,
    avatarId: v.avatarId,
    activeStyleId: v.styleId,
    activeGender: v.gender,
    params: v.params,
    history: [],
    future: [],
  };
  emit();
  persist();
}

export function setGlobalColor(hex: string) {
  pushHistory();
  const next: VariantParams = { ...state.params, globalColor: hex };
  (Object.keys(next) as (keyof VariantParams)[]).forEach((k) => {
    if (k === "globalColor") return;
    const v: any = (next as any)[k];
    if (v) (next as any)[k] = { ...v, color: hex };
  });
  state = { ...state, params: next };
  emit();
  persist();
}
