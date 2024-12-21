const mencariLuasPenampang = (jariJariBola: number) => {
  return 3.14 * Math.pow(jariJariBola, 2);
};

const mencariFd = (dragBola: number, densitasUdara: number, penampangBola: number, Vox: number) => {
  return 0.5 * 1.23 * 0.5  * 0.04 * (Vox * Vox);
};

const mencariGayaHambatanHorizontal = (Vox: number, dragBola: number, massaBenda: number) => {
  const jariJariBola = 0.11; // m
  const densitasUdara = 1.23; // kg/m^3
  const penampangBola = Number(mencariLuasPenampang(jariJariBola).toFixed(2)); // m^2

  const Fd = Number(mencariFd(dragBola, densitasUdara, penampangBola, Vox).toFixed(5)); // N
  const aX = Fd / massaBenda; // m/s^2
  return aX;
};

export { mencariLuasPenampang, mencariFd, mencariGayaHambatanHorizontal };
