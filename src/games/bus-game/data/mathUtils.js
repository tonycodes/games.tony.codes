export function dd(ax, az, bx, bz) {
  return Math.sqrt((ax - bx) * (ax - bx) + (az - bz) * (az - bz));
}

export function ptSegDist(px, pz, ax, az, bx, bz) {
  var dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  if (len2 < 0.01) return dd(px, pz, ax, az);
  var t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  return dd(px, pz, ax + t * dx, az + t * dz);
}

export function nearRoad(R, px, pz, minDist) {
  for (var ri = 0; ri < R.length - 1; ri++) {
    if (ptSegDist(px, pz, R[ri][0], R[ri][1], R[ri + 1][0], R[ri + 1][1]) < minDist) return true;
  }
  return false;
}
