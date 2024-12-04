import { CosValues, SinValues } from "../utility/Type";

// untuk derajat === 0
const menghitungAkhirMendatar = (kecepatanAwal: number, sudut: number, resistansiUdara: number) => {
  const massaBola = 0.5; // kg
  const gravitasi = 9.8; // m/s^2

  // Ambil nilai cos dari enum
  const cosValue = CosValues[`COS_${sudut}` as keyof typeof CosValues];
  if (cosValue === undefined) return "Nilai sudut tidak valid";

  // Perhitungan
  const Vox = kecepatanAwal * cosValue; // Kecepatan mendatar awal
  const gayaNormal = massaBola * gravitasi; // Gaya normal
  const koefisienGesekan = 0.3 * gayaNormal; // Koefisien gesekan rata-rata
  const percepatanGesekan = koefisienGesekan / massaBola; // Percepatan akibat gesekan
  const totalPercepatan = percepatanGesekan + resistansiUdara; // Total percepatan
  if (totalPercepatan <= 0) return "Total percepatan tidak valid"; // Pastikan percepatan masuk akal

  const t_darat = Vox / totalPercepatan; // Waktu total mendatar
  const posisiAkhirX = Vox * t_darat - 0.5 * totalPercepatan * Math.pow(t_darat, 2); // Posisi mendatar akhir

  return posisiAkhirX >= 0 ? { posisiAkhirX: Number(posisiAkhirX.toFixed(3)), Vox } : 0; // Jika negatif, posisi diatur ke 0
};

// untuk derajat > 0
const menghitungAkhirVerHori = (kecepatanAwal: number, sudut: number, resistansiUdara: number) => {
  const gravitasi = 9.8; // m/s^2
  const posisiAwalY = 0; // m
  const posisiAwalX = 0; // m

  // Ambil nilai sin dan cos dari enum
  const sinValue = SinValues[`SIN_${sudut}` as keyof typeof SinValues];
  const cosValue = CosValues[`COS_${sudut}` as keyof typeof CosValues];

  if (sinValue === undefined || cosValue === undefined) return "Nilai sudut tidak valid";

  // Perhitungan
  const V0y = kecepatanAwal * sinValue; // Kecepatan vertikal awal
  const V0x = kecepatanAwal * cosValue; // Kecepatan horizontal awal
  const t_udara = (2 * V0y) / gravitasi; // Waktu total di udara

  const Vy = V0y - gravitasi * t_udara; // Kecepatan vertikal akhir
  const Vx = V0x; // Kecepatan horizontal akhir
  const Vt = Math.sqrt(Math.pow(Vx, 2) + Math.pow(Vy, 2)); // Kecepatan total akhir 
  
  const totalPercepatanVertikal = gravitasi; // Percepatan vertikal akibat gravitasi

  const posisiAkhirX = Number((posisiAwalX + V0x * t_udara - 0.5 * resistansiUdara * Math.pow(t_udara, 2)).toFixed(3)); // Posisi horizontal akhir
  const posisiAkhirY = Number(posisiAwalY.toFixed(3)); // Posisi vertikal akhir tetap sama karena kembali ke tanah
  const titikTertinggi = Number((posisiAwalY + V0y * (0.5 * t_udara) - 0.5 * totalPercepatanVertikal * Math.pow(0.5 * t_udara, 2)).toFixed(3)); // Titik tertinggi

  return { posisiAkhirX, posisiAkhirY, titikTertinggi, Vx, Vy, Vt };
};

export { menghitungAkhirMendatar, menghitungAkhirVerHori };
