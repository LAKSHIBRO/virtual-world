import { CHUNK_SIZE, TILE_SIZE, TERRAIN } from '../constants.js';

export class Chunk {
  constructor(world, x, y, generator) {
    this.world = world;
    this.position = { x, y };
    this.tiles = new Array(CHUNK_SIZE * CHUNK_SIZE);
    this.heightMap = new Array(CHUNK_SIZE * CHUNK_SIZE);
    this.generate(generator);
  }

  generate(generator) {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldX = this.position.x * CHUNK_SIZE + x;
        const worldY = this.position.y * CHUNK_SIZE + y;
        
        const height = generator.getHeight(worldX, worldY);
        const moisture = generator.getMoisture(worldX, worldY);
        
        this.heightMap[y * CHUNK_SIZE + x] = height;
        
        if (height < -0.2) {
          this.tiles[y * CHUNK_SIZE + x] = TERRAIN.WATER;
        } else if (height < -0.1) {
          this.tiles[y * CHUNK_SIZE + x] = TERRAIN.SAND;
        } else if (height > 0.3) {
          this.tiles[y * CHUNK_SIZE + x] = TERRAIN.STONE;
        } else {
          this.tiles[y * CHUNK_SIZE + x] = TERRAIN.GRASS;
        }
      }
    }
  }

  getTile(x, y) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE) return null;
    return this.tiles[y * CHUNK_SIZE + x];
  }

  getHeight(x, y) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE) return 0;
    return this.heightMap[y * CHUNK_SIZE + x];
  }

  canGrowTree(x, y) {
    const localX = Math.floor(x / TILE_SIZE) % CHUNK_SIZE;
    const localY = Math.floor(y / TILE_SIZE) % CHUNK_SIZE;
    const tile = this.getTile(localX, localY);
    return tile === TERRAIN.GRASS;
  }

  render(ctx, camera) {
    const tileSize = TILE_SIZE * camera.zoom;
    const screenX = (this.position.x * CHUNK_SIZE * TILE_SIZE - camera.position.x) * camera.zoom + camera.width / 2;
    const screenY = (this.position.y * CHUNK_SIZE * TILE_SIZE - camera.position.y) * camera.zoom + camera.height / 2;

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const tile = this.getTile(x, y);
        switch(tile) {
          case TERRAIN.WATER:
            ctx.fillStyle = '#4444FF';
            break;
          case TERRAIN.GRASS:
            ctx.fillStyle = '#44FF44';
            break;
          case TERRAIN.SAND:
            ctx.fillStyle = '#FFFF44';
            break;
          case TERRAIN.STONE:
            ctx.fillStyle = '#888888';
            break;
          default:
            continue;
        }
        
        ctx.fillRect(
          screenX + x * tileSize,
          screenY + y * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  }
}