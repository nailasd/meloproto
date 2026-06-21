export type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string; // hex/oklch gradient seed via id
  color: string; // tailwind-ready hex for cover background
};

export type Match = {
  id: string;
  source: Track;
  match: Track;
  vibe: string;
  author: { name: string; avatarColor: string };
  likes: number;
  createdAt: string;
};

const tracks: Track[] = [
  { id: "t1", title: "Glimpse of Us", artist: "Joji", cover: "", color: "#7c3aed" },
  { id: "t2", title: "Sunsetz", artist: "Cigarettes After Sex", cover: "", color: "#ec4899" },
  { id: "t3", title: "Late Night Drive", artist: "Tycho", cover: "", color: "#3b82f6" },
  { id: "t4", title: "Nights", artist: "Frank Ocean", cover: "", color: "#a855f7" },
  { id: "t5", title: "Redbone", artist: "Childish Gambino", cover: "", color: "#f43f5e" },
  { id: "t6", title: "After Hours", artist: "The Weeknd", cover: "", color: "#6366f1" },
  { id: "t7", title: "Resonance", artist: "HOME", cover: "", color: "#8b5cf6" },
  { id: "t8", title: "Pink + White", artist: "Frank Ocean", cover: "", color: "#ec4899" },
  { id: "t9", title: "Self Control", artist: "Frank Ocean", cover: "", color: "#a78bfa" },
  { id: "t10", title: "Midnight City", artist: "M83", cover: "", color: "#2563eb" },
];

export const allTracks = tracks;

export const mockMatches: Match[] = [
  {
    id: "m1",
    source: tracks[0],
    match: tracks[7],
    vibe: "melancholic dreams",
    author: { name: "naïla", avatarColor: "#c084fc" },
    likes: 142,
    createdAt: "2h",
  },
  {
    id: "m2",
    source: tracks[2],
    match: tracks[9],
    vibe: "late night drive",
    author: { name: "ana", avatarColor: "#f472b6" },
    likes: 89,
    createdAt: "5h",
  },
  {
    id: "m3",
    source: tracks[4],
    match: tracks[3],
    vibe: "warm summer haze",
    author: { name: "leo", avatarColor: "#60a5fa" },
    likes: 231,
    createdAt: "1d",
  },
  {
    id: "m4",
    source: tracks[5],
    match: tracks[6],
    vibe: "after midnight",
    author: { name: "mira", avatarColor: "#fb7185" },
    likes: 67,
    createdAt: "1d",
  },
  {
    id: "m5",
    source: tracks[8],
    match: tracks[1],
    vibe: "soft heartbreak",
    author: { name: "sam", avatarColor: "#a78bfa" },
    likes: 312,
    createdAt: "2d",
  },
  {
    id: "m6",
    source: tracks[3],
    match: tracks[7],
    vibe: "frank ocean spiral",
    author: { name: "kim", avatarColor: "#e879f9" },
    likes: 188,
    createdAt: "3d",
  },
];

export const vibes = [
  "chill", "euphoric", "melancholic", "late night drive", "summer haze",
  "heartbreak", "hyperpop", "ambient", "rage", "soft rock", "lo-fi", "dreamy",
];
