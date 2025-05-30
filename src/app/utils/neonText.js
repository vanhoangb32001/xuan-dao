export function createNeonTextSprite(text, color = '#ff66cc') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 512;

  canvas.width = canvas.height = size;

  ctx.font = 'bold 64px "Arial"'; // 👈 dùng font có sẵn
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 40;

  ctx.fillStyle = color;
  ctx.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(5, 2, 1); // tuỳ chỉnh kích thước

  sprite.position.set(
    (Math.random() - 0.5) * SPAWN_WIDTH,
    START_HEIGHT + Math.random() * 5,
    (Math.random() - 0.5) * SPAWN_DEPTH
  );
  sprite.velocity = 0;

  return sprite;
}
