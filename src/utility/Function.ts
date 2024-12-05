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
  const koefisienHambatanUdara = 0.3; // koefisien hambatan udara sekitar 0.2 - 0.5 tergantung banyak faktor, tetapi di sini dibuat 0.3 karena cukup kompleks untuk perhitungannya
  const massaBola = 0.5; // kg
  const diameterBola = 0.22 ; // m didapat dari diameter bola piala dunia
  const tekananUdara = 101325 // menggunakan Pa | Pascal 1 pascal = 1 N/m^2, 101325 setara dengan 1 atmoster dan dibuat konstan karena tidak ada perubahan tekanan udara yang signifikan dalam perhitungan ini
  const konstantaGasUdara = 287 ; // J/(kg*K), didapat dari perhitungan dinamika fluida dan rata rata menggunakan 287 J/kg*K untuk nilai udara
  const suhuUdara = 25;// buat math.random seperti udara, buat 25 - 35 derajat celcius
  const densitasUdara = (tekananUdara)/(konstantaGasUdara * (suhuUdara + 273.15)); // densitas udara dalam kg/m^3, dan suhu udara ditambah 273.15 agar berubah menjadi kelvin
  const luasPenampangBola = Math.PI * Math.pow(0.5 * diameterBola, 2); // m^2


  // Ambil nilai sin dan cos dari enum
  const sinValue = SinValues[`SIN_${sudut}` as keyof typeof SinValues];
  const cosValue = CosValues[`COS_${sudut}` as keyof typeof CosValues];

  if (sinValue === undefined || cosValue === undefined) return "Nilai sudut tidak valid";

  // Perhitungan
  const V0y = kecepatanAwal * sinValue; // Kecepatan vertikal awal
  const V0x = kecepatanAwal * cosValue; // Kecepatan horizontal awal
  
  // initialisasi data
  let Vy = V0y; // kecepatan vertikal
  let Vx = V0x; // kecepatan horizontal
  let Vt = Math.sqrt(Math.pow(V0x, 2) + Math.pow(V0y, 2));  // Kecepatan total
  let langkahWaktu = 0.01; // detik
  let posisiAwalY = 0; // m
  let posisiAwalX = 0; // m
  let posisiAkhirX = 0;
  let posisiAkhirY = 0;
  let totalWaktu = 0; // detik

  // Fungsi untuk menghitung drag
  const Hambatan = function (Vx : number, Vy : number) {
  return 0.5 * koefisienHambatanUdara * densitasUdara * luasPenampangBola * Math.pow(Vt, 2);  // Gaya drag
}

// Fungsi untuk menghitung waktu ke titik tertinggi secara analitis
  const Tpuncak = function (Vy : number, massaBola : number, koefisienHambatanUdara : number, gravitasi : number) {
  return -(massaBola / koefisienHambatanUdara) * Math.log((massaBola * gravitasi / koefisienHambatanUdara) / (Vy + massaBola * gravitasi / koefisienHambatanUdara));
}

// Fungsi untuk menghitung tinggi maksimum secara analitis
  let Ypuncak = function(Vy: number, massaBola: number, koefisienHambatanUdara: number, gravitasi: number) {
  const waktuTertinggi = Tpuncak (Vy, massaBola, koefisienHambatanUdara, gravitasi);
  return (massaBola / koefisienHambatanUdara) * ((Vy + massaBola * gravitasi / koefisienHambatanUdara) * (1 - Math.exp(-koefisienHambatanUdara * waktuTertinggi / massaBola)) - gravitasi * waktuTertinggi);
}


// Simulasi gerak bola dengan drag menggunakan metode Euler
const simulasiGerakBola = function (posisiAkhirX : number, posisiAkhirY : number, posisiAwalX: number, posisiAwalY: number, Vx: number, Vy: number, massaBola: number, koefisienHambatanUdara: number, gravitasi: number, langkahWaktu: number, totalWaktu: number) {
  while (posisiAwalY >= 0) {
    // Hitung gaya drag pada komponen horizontal dan vertikal
    let gayaHambatan = Hambatan(Vx, Vy);

    // Perubahan kecepatan horizontal dan vertikal
    let gayaHambatanX = gayaHambatan * (Vx / Vt);  // Komponen horizontal dari gaya Hambatan
    let gayaHambatanY = gayaHambatan * (Vy / Vt);  // Komponen vertikal dari gaya Hambatan

    // Perbarui kecepatan berdasarkan gaya drag dan gravitasi
    Vx = Vx - (gayaHambatanX / massaBola) * langkahWaktu;  // Perubahan kecepatan horizontal
    Vy = Vy - (gravitasi + gayaHambatanY / massaBola) * langkahWaktu;  // Perubahan kecepatan vertikal (termasuk gravitasi)

    // Perbarui posisi bola
    let posisiAkhirX = posisiAwalX + Vx * langkahWaktu;
    let posisiAkhirY = posisiAwalY + Vy * langkahWaktu;

    // Perbarui waktu
    totalWaktu += langkahWaktu;
    return {posisiAkhirX, posisiAkhirY, totalWaktu, titikTertinggi};
  }
}
  const titikTertinggi = Ypuncak (Vy, massaBola, koefisienHambatanUdara, gravitasi);

// Simulasi numerik
  const simulasi = simulasiGerakBola(posisiAkhirX, posisiAkhirY, posisiAwalX, posisiAwalY, Vx, Vy, massaBola, koefisienHambatanUdara, gravitasi, langkahWaktu, totalWaktu);

  // perhitungan untuk pantulan bola belum fix
  const V_EP = Math.sqrt(2*gravitasi*titikTertinggi); // kecepatan bola dari titik tertinggi yang dirubah menjadi energi kinetik 
  
  return {posisiAkhirX, posisiAkhirY, totalWaktu, titikTertinggi};
};
export { menghitungAkhirMendatar, menghitungAkhirVerHori };
