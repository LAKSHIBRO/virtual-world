import { Entity } from './Entity.js';

export class Tree extends Entity {
  constructor(world, x, y) {
    super(world, x, y);
    this.size = 0.2;
    this.maxSize = 1 + Math.random() * 0.5;
    this.growthRate = 0.1;
  }

  update(deltaTime) {
    super.update(deltaTime);
    
    if (this.size < this.maxSize) {
      this.size += this.growthRate * deltaTime;
    }
    
    if (this.size >= this.maxSize && Math.random() < 0.001 * deltaTime) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      const x = this.position.x + Math.cos(angle) * distance;
      const y = this.position.y + Math.sin(angle) * distance;
      
      if (this.world.canGrowTree(x, y)) {
        this.world.addEntity(new Tree(this.world, x, y));
      }
    }
  }
}