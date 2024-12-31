import { Vector2 } from '../math/Vector2.js';

export class Entity {
  constructor(world, x, y) {
    this.world = world;
    this.x = x;
    this.y = y;
    this.age = 0;
  }

  update(deltaTime) {
    this.age += deltaTime;
  }
}