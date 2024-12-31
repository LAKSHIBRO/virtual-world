import { TILE_SIZE, TERRAIN, CHUNK_SIZE } from '../constants.js';

const TERRAIN_COLORS = {
  [TERRAIN.GRASS]: '#4CAF50',
  [TERRAIN.WATER]: '#2196F3',
  [TERRAIN.SAND]: '#FDD835',
  [TERRAIN.STONE]: '#757575'
};

export function renderTerrain(ctx, chunks, camera) {
  ctx.save();
  
  ctx.translate(camera.width / 2, camera.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.position.x, -camera.position.y);

  for (const chunk of chunks) {
    const baseX = chunk.position.x * CHUNK_SIZE * TILE_SIZE;
    const baseY = chunk.position.y * CHUNK_SIZE * TILE_SIZE;

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const tile = chunk.getTile(x, y);
        if (tile === null) continue;

        ctx.fillStyle = TERRAIN_COLORS[tile];
        ctx.fillRect(
          baseX + x * TILE_SIZE,
          baseY + y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );

        const height = chunk.getHeight(x, y);
        if (height > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${height * 0.2})`;
          ctx.fillRect(
            baseX + x * TILE_SIZE,
            baseY + y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          );
        }
      }
    }
  }

  ctx.restore();
}