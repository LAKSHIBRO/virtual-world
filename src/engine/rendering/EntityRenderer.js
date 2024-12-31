import { TILE_SIZE } from '../constants.js';

export function renderEntities(ctx, entities, camera) {
  for (const entity of entities) {
    if (entity.render) {
      entity.render(ctx, camera);
    }
  }
}