import React, { useRef, useEffect, useState } from "react";
import { CosValues, ICanvasData, SinValues } from "../../utility/Type";
import { mencariFd, mencariGayaHambatanHorizontal, mencariLuasPenampang } from "../../utility/Function";

interface IViewUser {
  tengahMendatar: string;
  akhirMendatar: string;
  waktuTempuh: string;
}

export let clearCanvas: () => void;

const CanvasBg = ({ canvasData, active }: { canvasData: ICanvasData; active: boolean }) => {
  const animationRef = useRef<number | null>(null); // Menyimpan ID animasi untuk dibatalkan
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Referensi ke canvas
  const [viewUser, setViewUser] = useState<IViewUser>({ tengahMendatar: "0 Meter", akhirMendatar: "0 Meter", waktuTempuh: "0 Detik" });

  const lokasiBola = useRef<{ x: number; y: number }[]>([]);

  const perMeter = 0.055; // per 1 meter dalam pixel
  const perKM = perMeter / 1000; // per 1 KM dalam pixel
  const massaBenda = 0.5; // kg
  const gravity = 9.81; // m/s^2
  const drag = 0.5; // koefisien hambatan bola
  const gayaGesekan = 1.4715; // gaya gesekan

  const CosValue = CosValues[`COS_${canvasData.sudut}` as keyof typeof CosValues];
  const SinValue = SinValues[`SIN_${canvasData.sudut}` as keyof typeof SinValues];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const { width, height } = { width: canvas.width, height: canvas.height };

    const backgroundImage = new Image();
    backgroundImage.src = "/bg-cover1.svg";
    const ballImage = new Image();
    ballImage.src = "/bola.svg";
    const ronaldoImage = new Image();
    ronaldoImage.src = "/ronaldo.svg";

    let ballImageLoaded = false;
    ballImage.onload = () => (ballImageLoaded = true);

    const gambarLapangan = () => {
      context.save(); // simpan keadaan canvas sebelum di flip
      // set transformasi untuk flip canvas agar gambar normal
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.drawImage(backgroundImage, 0, 0, width, height);
      context.restore(); // set ulang keadaan canvas sebelum diflip
    };

    const cancelAnimation = () => {
      cancelAnimationFrame(animationRef.current as number); // Hentikan animasi
      animationRef.current = null;
    };

    const gambarAttribute = (x: number, y: number, sudut: number) => {
      if (ballImageLoaded) {
        context.save(); // Simpan keadaan canvas sebelum di flip
        context.drawImage(ronaldoImage, 30, 90, 90, 200);
        context.drawImage(ballImage, x, y > 90 ? y : 90, 45, 45);
        context.restore(); // Setel ulang keadaan canvas sebelum di flip
      } else {
        setTimeout(() => gambarAttribute(x, y, sudut), 100); // Coba lagi setelah 100ms
      }
    };

    clearCanvas = () => {
      // Bersihkan animasi sebelumnya
      if (animationRef.current) cancelAnimation();
      lokasiBola.current = [];
      context.clearRect(0, 0, width, height);
      gambarLapangan();
      gambarAttribute(120, 0, canvasData.sudut);
    };

    // Gambar lapangan
    backgroundImage.onload = () => {
      let tinggiSementara = 0;
      const draw = (kecepatanAwal: number, sudut: number) => {
        if (animationRef.current) cancelAnimation(); // Bersihkan animasi sebelumnya

        // Perhitungan kecepatan dikali dengan sin dan cos sudut
        let Vox = Number(kecepatanAwal * CosValue);
        let Voy = Number((kecepatanAwal * SinValue).toFixed(2));

        const t = 0.01; // langkah waktu
        const a = -(0.3 * (gravity * massaBenda)) / massaBenda;
        const kondisiSudut = sudut <= 0;
        const waktuTempuh = kondisiSudut ? -kecepatanAwal / a : (2 * Voy) / gravity; // Waktu total di udara
        const totalFrame = Number((waktuTempuh / t).toFixed(0)); // Total frame animasi per-detik

        gambarLapangan(); // Gambar lapangan
        gambarAttribute(120, 0, canvasData.sudut);
        context.drawImage(ronaldoImage, 25, 90, 90, 200);

        let xAnimation: number = 0;
        let yAnimation: number = 0;
        let perulangan: number = 0;
        let x = 0;
        let y = 0;
        const update = () => {
          // Mencari sisi X
          const aX = active
            ? kondisiSudut
              ? (mencariFd(drag, 1.23, Number(mencariLuasPenampang(0.11).toFixed(2)), Vox) + gayaGesekan) / massaBenda
              : mencariGayaHambatanHorizontal(Vox, drag, massaBenda)
            : kondisiSudut
            ? gayaGesekan / massaBenda
            : 0; // mencari percepatan horizontal
          const vt_x = Vox - aX * t; // mencari kecepatan dalam waktu tertentu
          xAnimation += Vox * t + massaBenda * -aX * Math.pow(t, 2); // menyimpan dan menambahkan posisi x

          // Mencari sisi Y [Gravitasi disini itu aY]
          const vt_y = Voy - gravity * t; // mencari kecepatan dalam waktu tertentu
          yAnimation += Voy * t + massaBenda * -gravity * Math.pow(t, 2); // menyimpan dan menambahkan posisi y

          if (!isNaN(xAnimation) || !isNaN(yAnimation)) {
            x = kondisiSudut && vt_x <= 0 ? x : xAnimation * 18.18;
            y = yAnimation < 0 ? 0 : yAnimation * 18.18;

            context.clearRect(0, 0, width, height); // Bersihkan canvas
            gambarLapangan(); // Gambar Lapangan
            gambarAttribute(x + 120, y + 90, sudut); // Gambar bola
            lokasiBola.current.length && lokasiBola.current.forEach((lokasi) => gambarAttribute(lokasi.x + 120, lokasi.y + 90, canvasData.sudut));

            if (tinggiSementara === 0) tinggiSementara = y;
            if (tinggiSementara < y) tinggiSementara = y;
            const changeTengahMendatar = Number((tinggiSementara * perMeter).toFixed(2)) >= 1000;
            const changeAkhirMendatar = Number((x * perMeter).toFixed(2)) >= 1000;
            setViewUser({
              tengahMendatar: changeTengahMendatar
                ? `${(tinggiSementara * perKM).toFixed(2)} KM`
                : `${(tinggiSementara * perMeter).toFixed(2)} Meter`,
              akhirMendatar: changeAkhirMendatar ? `${(x * perKM).toFixed(2)} KM` : `${(x * perMeter).toFixed(2)} Meter`,
              waktuTempuh: `${(perulangan * t).toFixed(2)} Detik`,
            });

            // Berhenti jika bola mencapai tanah
            if (perulangan >= totalFrame || y + 90 < 90) {
              if (lokasiBola.current.length >= 2) lokasiBola.current.shift();
              lokasiBola.current.push({ x, y });
              animationRef.current = null;
              gambarAttribute(120, 0, canvasData.sudut);
              return;
            } // Hentikan animasi
            // Lanjutkan animasi
            animationRef.current = requestAnimationFrame(update);

            console.log(CosValue, 1.23, drag, (mencariLuasPenampang(0.11).toFixed(2)), Vox, Number(mencariFd(drag, 1.23, 0.04, Vox).toFixed(5)), aX, perulangan);
            Vox = Number(vt_x);
            Voy = Number(vt_y);
            perulangan++;
          }
        };

        update();
      };

      // Atur ulang transformasi dan warna
      context.setTransform(1, 0, 0, -1, 0, height);

      // Mulai menggambar
      draw(canvasData.kecepatan, Number(canvasData.sudut));
    };

    return () => {
      if (animationRef.current) cancelAnimation(); // Bersihkan animasi sebelumnya
    };
  }, [canvasData, lokasiBola, CosValue, SinValue, perKM, perMeter]);

  return (
    <div className="place-self-center">
      <div className="flex justify-between">
        <div className="flex items-center space-x-3 font-semibold bg-[#FF85EF] px-5 p-3 mb-2 rounded-md">
          <p>Titik Tertinggi : {viewUser.tengahMendatar}</p>
          <p>Jarak Akhir : {viewUser.akhirMendatar}</p>
          <p>Waktu Tempuh : {viewUser.waktuTempuh}</p>
        </div>
      </div>
      <canvas ref={canvasRef} width={1900} height={800} className="border-2" />
    </div>
  );
};

export default CanvasBg;
