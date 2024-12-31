import { CHUNK_SIZE, TILE_SIZE, WORLD_SIZE, TERRAIN } from '../constants.js';
import { Chunk } from './Chunk.js';
import { TerrainGenerator } from './Noise.js';

export class World {
  constructor() {
    this.chunks = new Map();
    this.entities = [];
    this.activeChunks = new Set();
    this.generator = new TerrainGenerator();
    this.structures = new Map();
  }

  update(deltaTime) {
    const entities = [...this.entities];
    for (const entity of entities) {
      if (this.entities.includes(entity)) { 
        entity.update(deltaTime);
      }
    }
  }

  addEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
    }
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  addStructure(x, y, type) {
    const key = `${Math.floor(x)},${Math.floor(y)}`;
    this.structures.set(key, type);
  }

  removeStructure(x, y) {
    const key = `${Math.floor(x)},${Math.floor(y)}`;
    this.structures.delete(key);
  }

  hasStructureAt(x, y) {
    const key = `${Math.floor(x)},${Math.floor(y)}`;
    return this.structures.has(key);
  }

  getNearbyEntities(x, y, radius) {
    return this.entities.filter(entity => {
      const dx = entity.x - x;
      const dy = entity.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  getChunkAt(x, y) {
    const chunkX = Math.floor(x / (CHUNK_SIZE * TILE_SIZE));
    const chunkY = Math.floor(y / (CHUNK_SIZE * TILE_SIZE));
    const key = `${chunkX},${chunkY}`;

    if (!this.chunks.has(key)) {
      this.chunks.set(key, new Chunk(this, chunkX, chunkY, this.generator));
    }

    return this.chunks.get(key);
  }

  getTileAt(x, y) {
    const chunk = this.getChunkAt(x, y);
    const localX = Math.floor(x / TILE_SIZE) % CHUNK_SIZE;
    const localY = Math.floor(y / TILE_SIZE) % CHUNK_SIZE;
    return chunk.getTile(localX, localY);
  }

  canGrowTree(x, y) {
    const chunk = this.getChunkAt(x, y);
    const localX = Math.floor(x / TILE_SIZE) % CHUNK_SIZE;
    const localY = Math.floor(y / TILE_SIZE) % CHUNK_SIZE;
    const tile = chunk.getTile(localX, localY);
    return tile === TERRAIN.GRASS; 
  }

  updateActiveChunks(camera) {
    this.activeChunks.clear();
    
    const viewportWidth = camera.width / camera.zoom;
    const viewportHeight = camera.height / camera.zoom;
    
    const startChunkX = Math.floor((camera.position.x - viewportWidth/2) / (CHUNK_SIZE * TILE_SIZE));
    const startChunkY = Math.floor((camera.position.y - viewportHeight/2) / (CHUNK_SIZE * TILE_SIZE));
    const endChunkX = Math.ceil((camera.position.x + viewportWidth/2) / (CHUNK_SIZE * TILE_SIZE));
    const endChunkY = Math.ceil((camera.position.y + viewportHeight/2) / (CHUNK_SIZE * TILE_SIZE));
    
    for (let x = startChunkX; x <= endChunkX; x++) {
      for (let y = startChunkY; y <= endChunkY; y++) {
        if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
          const chunk = this.getChunkAt(x * CHUNK_SIZE * TILE_SIZE, y * CHUNK_SIZE * TILE_SIZE);
          this.activeChunks.add(chunk);
        }
      }
    }
  }

  render(ctx, camera) {
    for (const chunk of this.activeChunks) {
      chunk.render(ctx, camera);
    }

    for (const entity of this.entities) {
      if (entity.render) {
        entity.render(ctx, camera);
      }
    }
  }
}