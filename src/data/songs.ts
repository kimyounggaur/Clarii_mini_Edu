export interface Song {
  id: string;
  title: string;
  tempo: number;
  /** [온음 id, 박자] — 모든 음은 기준층(layer 0) 온음 (옥타브 키 없이 연주 가능한 첫 곡) */
  notes: [string, number][];
}

export const SONGS: Song[] = [
  { id: "airplane", title: "비행기", tempo: 80,
    notes: [
      ["mi",1],["re",1],["do",1],["re",1],["mi",1],["mi",1],["mi",2],
      ["re",1],["re",1],["re",2],["mi",1],["sol",1],["sol",2],
      ["mi",1],["re",1],["do",1],["re",1],["mi",1],["mi",1],["mi",1],["mi",1],
      ["re",1],["re",1],["mi",1],["re",1],["do",4]
    ] },
  { id: "school-bell", title: "학교종", tempo: 92,
    notes: [
      ["sol",1],["sol",1],["la",1],["la",1],["sol",1],["sol",1],["mi",2],
      ["sol",1],["sol",1],["mi",1],["mi",1],["re",4],
      ["sol",1],["sol",1],["la",1],["la",1],["sol",1],["sol",1],["mi",2],
      ["sol",1],["mi",1],["re",1],["mi",1],["do",4]
    ] }
];

export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(
  SONGS.map((s) => [s.id, s]),
);
