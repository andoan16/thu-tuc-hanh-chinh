import doiGpkx from './procedures/doi-gpkx.json'
import dangKyTamTru from './procedures/dang-ky-tam-tru.json'
import khaiBaoVangMat from './procedures/khai-bao-vang-mat.json'
import lyLichTuPhap from './procedures/ly-lich-tu-phap.json'
import trichLucHoTich from './procedures/trich-luc-ho-tich.json'
import chungThucSaoY from './procedures/chung-thuc-sao-y.json'
import dangKyXe from './procedures/dang-ky-xe.json'
import dangKyBienDongDat from './procedures/dang-ky-bien-dong-dat.json'

export const procedures = [
  doiGpkx,
  dangKyTamTru,
  khaiBaoVangMat,
  dangKyXe,
  lyLichTuPhap,
  trichLucHoTich,
  chungThucSaoY,
  dangKyBienDongDat,
]

export function getProcedure(slug) {
  return procedures.find((p) => p.slug === slug)
}