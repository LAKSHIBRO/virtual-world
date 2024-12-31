import { TILE_SIZE, TERRAIN } from './constants.js';
import { renderTerrain } from './rendering/TerrainRenderer.js';
import { renderEntities } from './rendering/EntityRenderer.js';
import { renderStructures } from './rendering/StructureRenderer.js';
import { Animal } from './entities/Animal.js';
import { Tree } from './entities/plants/Tree.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderWorld(world, camera) {
    this.clear();
    
    renderTerrain(this.ctx, world.activeChunks, camera);
    
    renderStructures(this.ctx, world.structures, camera);
    
    for (const entity of world.entities) {
      if (entity.render) {
        entity.render(this.ctx, camera);
      }
    }
  }

  renderUI(game) {
    this.ctx.save();
    
    const padding = Math.min(20, this.canvas.width * 0.02);
    const width = Math.min(300, this.canvas.width * 0.2);
    const height = Math.min(250, this.canvas.height * 0.3);
    const fontSize = Math.min(16, width * 0.08);
    const smallFontSize = Math.min(14, width * 0.07);
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(padding, padding, width, height);

    this.ctx.fillStyle = 'white';
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.fillText(`Selected: ${game.selectedTool}`, padding * 1.5, padding * 2);
    
    this.ctx.font = `bold ${smallFontSize}px Arial`;
    this.ctx.fillText('Controls:', padding * 1.5, padding * 3);
    this.ctx.font = `${smallFontSize}px Arial`;
    this.ctx.fillText('T - Place Tree', padding * 1.5, padding * 4);
    this.ctx.fillText('R - Spawn Rabbit', padding * 1.5, padding * 5);
    this.ctx.fillText('D - Spawn Deer', padding * 1.5, padding * 6);
    this.ctx.fillText('W - Spawn Wolf', padding * 1.5, padding * 7);

    const counts = this.getEntityCounts(game.world);
    this.ctx.font = `bold ${smallFontSize}px Arial`;
    this.ctx.fillText('Population:', padding * 1.5, padding * 8.5);
    this.ctx.font = `${smallFontSize}px Arial`;
    
   
    this.ctx.fillText(`Trees: ${counts.trees}`, padding * 1.5, padding * 9.5);
    this.ctx.fillText(`🐰 Rabbits: ${counts.rabbits}`, padding * 1.5, padding * 10.5);
    this.ctx.fillText(`🦌 Deer: ${counts.deer}`, padding * 1.5, padding * 11.5);
    this.ctx.fillText(`🐺 Wolves: ${counts.wolves}`, padding * 1.5, padding * 12.5);

    this.ctx.restore();
  }

  getEntityCounts(world) {
    const counts = {
      trees: 0,
      rabbits: 0,
      deer: 0,
      wolves: 0
    };

    for (const entity of world.entities) {
      if (entity instanceof Tree) {
        counts.trees++;
      } else if (entity instanceof Animal) {
        switch(entity.species.name) {
          case 'Rabbit':
            counts.rabbits++;
            break;
          case 'Deer':
            counts.deer++;
            break;
          case 'Wolf':
            counts.wolves++;
            break;
        }
      }
    }

    return counts;
  }
}