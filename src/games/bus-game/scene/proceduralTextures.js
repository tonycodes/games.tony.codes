import * as THREE from 'three';

export function createAsphaltTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Dark gray base
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, size, size);

  // Pixel noise (±15 RGB)
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // Faint crack lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 80;
      y += (Math.random() - 0.5) * 80;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Oil blotches
  for (let i = 0; i < 5; i++) {
    const bx = Math.random() * size;
    const by = Math.random() * size;
    const br = 8 + Math.random() * 20;
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    grad.addColorStop(0, 'rgba(30, 30, 35, 0.15)');
    grad.addColorStop(1, 'rgba(30, 30, 35, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(bx - br, by - br, br * 2, br * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 40);
  return tex;
}

export function createGrassTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Green base
  ctx.fillStyle = '#4a8a4a';
  ctx.fillRect(0, 0, size, size);

  // Pixel noise (±20 green, ±10 R/B)
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() - 0.5) * 20));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + (Math.random() - 0.5) * 40));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + (Math.random() - 0.5) * 20));
  }
  ctx.putImageData(imageData, 0, 0);

  // Grass blade lines (~4000)
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 3 + Math.random() * 6;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    ctx.strokeStyle = `rgba(${30 + Math.random() * 20}, ${80 + Math.random() * 40}, ${30 + Math.random() * 20}, 0.3)`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Scattered clover patches
  for (let i = 0; i < 30; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 3 + Math.random() * 5;
    ctx.fillStyle = `rgba(${50 + Math.random() * 20}, ${110 + Math.random() * 30}, ${40 + Math.random() * 15}, 0.4)`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(80, 80);
  return tex;
}
