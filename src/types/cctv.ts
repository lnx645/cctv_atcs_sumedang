export interface CCTVLocation {
    id: number;
    nama: string;
    lat: number;
    lng: number;
    url: string | null; // null jika data streaming belum tersedia
}
