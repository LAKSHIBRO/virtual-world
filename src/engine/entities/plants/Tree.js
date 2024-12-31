import { Entity } from '../Entity.js';
import { TILE_SIZE } from '../../constants.js';

export class Tree extends Entity {
  constructor(world, x, y, species) {
    super(world, x, y);
    this.species = species;
    this.size = 0.2;
    this.maxSize = 1 + Math.random() * 0.5;
    this.growthRate = species.growthRate;
    this.seedRange = species.seedRange;
    this.seedChance = species.seedChance;
    this.maturityAge = species.maturityAge;
    this.maxAge = species.maxAge;
    this.resistance = species.resistance;
    this.swayOffset = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    super.update(deltaTime);
    
    if (this.size < this.maxSize && this.age < this.maxAge) {
      this.size += this.growthRate * deltaTime;
    }
    
    if (this.size >= this.maxSize && this.age > this.maturityAge) {
      if (Math.random() < this.seedChance * deltaTime) {
        this.spreadSeed();
      }
    }

    if (this.age > this.maxAge) {
      this.world.removeEntity(this);
    }

    this.swayOffset += deltaTime;
  }

  spreadSeed() {
    const angle = Math.random() * Math.PI * 2;
    const distance = this.seedRange * (0.5 + Math.random() * 0.5);
    const seedX = this.x + Math.cos(angle) * distance;
    const seedY = this.y + Math.sin(angle) * distance;
    
    if (this.world.canGrowTree(seedX, seedY)) {
      const seedling = new Tree(this.world, seedX, seedY, this.species);
      if (Math.random() < 0.1) {
        seedling.mutate();
      }
      this.world.addEntity(seedling);
    }
  }

  mutate() {
    this.maxSize *= 0.9 + Math.random() * 0.2;
    this.growthRate *= 0.9 + Math.random() * 0.2;
    this.resistance *= 0.9 + Math.random() * 0.2;
  }

  render(ctx, camera) {
    const screenPos = camera.worldToScreen(this.x, this.y);
    const baseSize = TILE_SIZE * camera.zoom;
    const maxSize = baseSize * 2; 
    const size = Math.min(baseSize * (0.5 + this.age / 20), maxSize); 

    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.rect(
      screenPos.x - size * 0.1,
      screenPos.y - size * 0.3,
      size * 0.2,
      size * 0.4
    );
    ctx.fill();

    ctx.fillStyle = this.species.color;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      screenPos.y - size * 0.4,
      size * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}