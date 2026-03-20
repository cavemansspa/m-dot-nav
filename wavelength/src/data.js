export const artists = [
  {
    id: "a1", name: "Neon Phantom", genre: "Synthwave",
    color: "#ff6b35",
    albums: [
      { id: "al1", title: "Chrome Dreams", year: 2023, tracks: [
        { id: "t1", title: "Midnight Circuit", duration: "3:42" },
        { id: "t2", title: "Neon Rain", duration: "4:11" },
        { id: "t3", title: "Ghost Signal", duration: "3:58" },
        { id: "t4", title: "Velocity", duration: "5:02" },
      ]},
      { id: "al2", title: "Void Runner", year: 2021, tracks: [
        { id: "t5", title: "Dark Matter", duration: "4:33" },
        { id: "t6", title: "Pulse Drive", duration: "3:47" },
        { id: "t7", title: "Zero Point", duration: "6:12" },
      ]},
    ]
  },
  {
    id: "a2", name: "Cassette Wolves", genre: "Lo-fi Hip Hop",
    color: "#7eb8f7",
    albums: [
      { id: "al3", title: "Rainy Day Tape", year: 2024, tracks: [
        { id: "t8",  title: "2AM Coffee", duration: "2:58" },
        { id: "t9",  title: "Vinyl Scratch", duration: "3:14" },
        { id: "t10", title: "Foggy Window", duration: "3:33" },
        { id: "t11", title: "Old Map", duration: "2:47" },
        { id: "t12", title: "Static Love", duration: "4:01" },
      ]},
    ]
  },
  {
    id: "a3", name: "Marble Arc", genre: "Post-Rock",
    color: "#a8e6cf",
    albums: [
      { id: "al4", title: "Tectonic", year: 2022, tracks: [
        { id: "t13", title: "Fault Line", duration: "7:22" },
        { id: "t14", title: "Uplift", duration: "5:44" },
        { id: "t15", title: "Sediment", duration: "8:01" },
      ]},
      { id: "al5", title: "Pressure Ridge", year: 2020, tracks: [
        { id: "t16", title: "Ice Core", duration: "6:15" },
        { id: "t17", title: "Calving", duration: "9:33" },
      ]},
    ]
  },
  {
    id: "a4", name: "Solenne", genre: "Dream Pop",
    color: "#d4a5f5",
    albums: [
      { id: "al6", title: "Soft Architecture", year: 2024, tracks: [
        { id: "t18", title: "Porcelain", duration: "4:22" },
        { id: "t19", title: "Silk Thread", duration: "3:55" },
        { id: "t20", title: "Hollow Bells", duration: "5:11" },
        { id: "t21", title: "Lavender Crush", duration: "3:38" },
      ]},
    ]
  },
];

export function getArtist(id)  { return artists.find(a => a.id === id); }
export function getAlbum(id)   { return artists.flatMap(a => a.albums).find(al => al.id === id); }
export function getAlbumArtist(albumId) { return artists.find(a => a.albums.some(al => al.id === albumId)); }
export function getTrack(id)   { return artists.flatMap(a => a.albums).flatMap(al => al.tracks).find(t => t.id === id); }
export function getAllTracks()  { return artists.flatMap(a => a.albums.flatMap(al => al.tracks.map(t => ({ ...t, artist: a, album: al })))); }
export function searchAll(q)   {
  q = q.toLowerCase();
  return {
    artists: artists.filter(a => a.name.toLowerCase().includes(q)),
    albums:  artists.flatMap(a => a.albums.map(al => ({ ...al, artist: a }))).filter(al => al.title.toLowerCase().includes(q)),
    tracks:  getAllTracks().filter(t => t.title.toLowerCase().includes(q)),
  };
}
