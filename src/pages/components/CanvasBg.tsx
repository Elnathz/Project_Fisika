import React, { useRef, useEffect, useState } from "react";
import { CosValues, ICanvasData, SinValues } from "../../utility/Type";

interface IViewUser {
  tengahMendatar: string;
  akhirMendatar: string;
}

const CanvasBg = ({ canvasData, repeatOn }: { canvasData: ICanvasData; repeatOn: boolean }) => {
  const animationRef = useRef<number | null>(null); // Menyimpan ID animasi untuk dibatalkan
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resistansiUdara = useRef<number>(Number((Math.random() * (15 - 1) + 1).toFixed(3))).current;
  const [viewUser, setViewUser] = useState<IViewUser>({ tengahMendatar: "0 Meter", akhirMendatar: "0 Meter" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const perMeter = 0.06; // per 1 meter dalam pixel
    const perKM = 0.00006; // per 1 KM dalam pixel
    const massaBenda = 0.5; // kg

    const width = canvas.width;
    const height = canvas.height;

    const gambarGrid = () => {
      const gridSize = 25; // Ukuran grid dalam piksel

      // Gambar grid
      context.strokeStyle = "#ddd"; // Warna garis grid
      context.lineWidth = 1;

      // Garis vertikal
      for (let gx = 0; gx <= width; gx += gridSize) {
        context.beginPath();
        context.moveTo(gx, 0);
        context.lineTo(gx, height);
        context.stroke();
      }

      // Garis horizontal
      for (let gy = 0; gy <= height; gy += gridSize) {
        context.beginPath();
        context.moveTo(0, gy);
        context.lineTo(width, gy);
        context.stroke();
      }
    };

    let tinggiSementara = 0;
    const draw = (Vo: number, angle: number) => {
      // Bersihkan animasi sebelumnya
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      const Vox = Vo * CosValues[`COS_${angle}` as keyof typeof CosValues];
      const Voy = Vo * SinValues[`SIN_${angle}` as keyof typeof SinValues];
      const g = 9.8;
      const startTime = Date.now();

      const update = () => {
        const t = (Date.now() - startTime) / 100; // Konversi waktu ke detik
        const x = Vox * t;
        const y = Voy * t - 0.5 * g * Math.pow(t, 2) + 12;

        // Menghapus canvas sebelum menggambar
        context.clearRect(0, 0, width, height);

        // Gambar grid
        gambarGrid();

        // agar tidak spam sistem
        if (isNaN(x) || isNaN(y)) return;

        // Gambar bola
        context.beginPath();
        context.arc(x < 10 ? 10 : x, y > 10 ? y : 10, 10, 0, Math.PI * 2, true);
        context.fill();

        // Berhenti jika bola mencapai tanah
        if (y < 12) return (animationRef.current = null); // Hentikan animasi

        // Lanjutkan animasi
        animationRef.current = requestAnimationFrame(update);
        if (tinggiSementara === 0) tinggiSementara = y;
        if (tinggiSementara < y) tinggiSementara = y;
        const changeTengahMendatar = Number((tinggiSementara * perMeter).toFixed(2)) >= 1000;
        const changeAkhirMendatar = Number((x * perMeter).toFixed(2)) >= 1000;
        setViewUser({
          tengahMendatar: changeTengahMendatar ? `${(tinggiSementara * perKM).toFixed(2)} KM` : `${(tinggiSementara * perMeter).toFixed(2)} Meter`,
          akhirMendatar: changeAkhirMendatar ? `${(x * perKM).toFixed(2)} KM` : `${(x * perMeter).toFixed(2)} Meter`,
        });
      };

      update();
    };

    // Atur ulang transformasi dan warna
    context.setTransform(1, 0, 0, -1, 0, height);
    context.fillStyle = canvasData.warna;

    // Mulai menggambar
    draw(canvasData.kecepatan - resistansiUdara, Number(canvasData.sudut));

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [canvasData, resistansiUdara]);

  return (
    <div className="place-self-center">
      <div className="flex justify-between">
        <div className="flex items-center space-x-3">
          <p>Jarak Awal : 0 Meter</p>
          <p>Titik Tertinggi : {viewUser.tengahMendatar}</p>
          <p>Jarak Akhir : {viewUser.akhirMendatar}</p>
        </div>
        <p>Resistensi Udara : {resistansiUdara} m/s²</p>
      </div>
      <canvas ref={canvasRef} width={1000} height={500} className="border-2" />
      <div className="information space-y-7 mt-3">
        <div className="w-full bg-green-400 rounded h-1">
          <p className="text-center p-1">60 Meter / 0,06 KM</p>
        </div>
      </div>
    </div>
  );
};

export default CanvasBg;
