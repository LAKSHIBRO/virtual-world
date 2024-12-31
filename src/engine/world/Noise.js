import { TERRAIN } from '../constants.js';
import { createNoise2D } from 'simplex-noise';

export class TerrainGenerator {
  constructor(seed = Math.random()) {
    this.noise2D = createNoise2D();
    this.seed = seed;
  }

  getHeight(x, y) {
    const baseScale = 0.02;
    const mountainScale = 0.005;
    
    let value = this.noise2D(x * baseScale, y * baseScale);
    
    const mountains = this.noise2D(x * mountainScale, y * mountainScale);
    value += Math.max(0, mountains * 1.5);
    
    value += this.noise2D(x * 0.1, y * 0.1) * 0.1;
    
    return value;
  }

  getMoisture(x, y) {
    const base = this.noise2D((x + 1000) * 0.02, (y + 1000) * 0.02);
    const detail = this.noise2D((x + 2000) * 0.1, (y + 2000) * 0.1) * 0.2;
    return (base + detail) * 0.5 + 0.5;
  }

  getTerrainType(height, moisture) {
    if (height < -0.2) return TERRAIN.WATER;
    if (height < 0) return TERRAIN.SAND;
    if (height > 0.5) return TERRAIN.STONE;
    return TERRAIN.GRASS;
  }
}