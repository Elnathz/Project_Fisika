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


  // Ambil nilai sin dan cos dari enum
  const sinValue = SinValues[`SIN_${sudut}` as keyof typeof SinValues];
  const cosValue = CosValues[`COS_${sudut}` as keyof typeof CosValues];

  if (sinValue === undefined || cosValue === undefined) return "Nilai sudut tidak valid";

  let langkahWaktu = 0.01; // detik
  let posisiAwalY = 0; // m
  let posisiAwalX = 0; // m
  let posisiAkhirX = 0;
  let posisiAkhirY = 0;
  let totalWaktu = 0; // detik
  
  // perhitungan untuk pantulan bola belum fix
  // const V_EP = Math.sqrt(2*gravitasi*titikTertinggi); // kecepatan bola dari titik tertinggi yang dirubah menjadi energi kinetik 
  
  return {posisiAkhirX, posisiAkhirY, totalWaktu};
};

function kecepatanBenda (waktu : number, V0y: SinValues, V0x: CosValues, resistansiUdara: number) {
  const gravitasi = 9.8; // m/s^2
  const koefisienHambatanUdara = 0.3; // koefisien hambatan udara sekitar 0.2 - 0.5 tergantung banyak faktor, tetapi di sini dibuat 0.3 karena cukup kompleks untuk perhitungannya
  const massaBola = 0.5; // kg
  const diameterBola = 0.22 ; // m didapat dari diameter bola piala dunia
  const densitasUdara = 1.225; // densitas udara dalam kg/m^3,  kondisi atmosfer standar (ISA – International Standard Atmosphere) 15 C
  const luasPenampangBola = Math.PI * Math.pow(0.5 * diameterBola, 2); // m^2
  
  const Vrelatif = V0x - resistansiUdara;
  const gayaHambatanUdara = 0.5 * densitasUdara * koefisienHambatanUdara * luasPenampangBola * Math.pow (Vrelatif, 2); // Gaya hambatan udara

  const percepatanVertikal = -gravitasi;
  const percepatanHorizontal = - gayaHambatanUdara / massaBola;

  const Vx = V0x + percepatanHorizontal 
  const Vy = V0y + percepatanVertikal
  return {Vx, Vy}
}
export { menghitungAkhirMendatar, menghitungAkhirVerHori };
