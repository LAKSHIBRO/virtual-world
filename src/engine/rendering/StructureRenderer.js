import { TILE_SIZE } from '../constants.js';

const STRUCTURE_STYLES = {
  house: {
    color: '#A0522D',
    width: 2,
    height: 2
  }
};

export function renderStructures(ctx, structures, camera) {
  ctx.save();
  
  ctx.translate(camera.width / 2, camera.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.position.x, -camera.position.y);

  for (const [pos, type] of structures) {
    const [x, y] = pos.split(',').map(Number);
    const style = STRUCTURE_STYLES[type];
    if (!style) continue;

    ctx.fillStyle = style.color;
    ctx.fillRect(
      x - TILE_SIZE * style.width / 2,
      y - TILE_SIZE * style.height / 2,
      TILE_SIZE * style.width,
      TILE_SIZE * style.height
    );
  }

  ctx.restore();
}