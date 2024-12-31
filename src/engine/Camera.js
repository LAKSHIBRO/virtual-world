import { WORLD_SIZE, CHUNK_SIZE, TILE_SIZE } from './constants.js';

export class Camera {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.position = {
      x: (WORLD_SIZE * CHUNK_SIZE * TILE_SIZE) / 2,
      y: (WORLD_SIZE * CHUNK_SIZE * TILE_SIZE) / 2
    };
    this.zoom = 0.5; 
    this.targetZoom = 0.5;
    this.zoomSpeed = 5;
  }

  update(deltaTime) {
    const zoomDiff = this.targetZoom - this.zoom;
    if (Math.abs(zoomDiff) > 0.001) {
      this.zoom += zoomDiff * this.zoomSpeed * deltaTime;
    }
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.position.x) * this.zoom + this.width / 2,
      y: (worldY - this.position.y) * this.zoom + this.height / 2
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.width / 2) / this.zoom + this.position.x,
      y: (screenY - this.height / 2) / this.zoom + this.position.y
    };
  }

  setZoom(zoom) {
    this.targetZoom = Math.max(0.1, Math.min(2.0, zoom));
  }

  zoomIn() {
    this.setZoom(this.targetZoom * 1.2);
  }

  zoomOut() {
    this.setZoom(this.targetZoom / 1.2);
  }
}