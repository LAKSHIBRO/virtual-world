import { Entity } from './Entity.js';
import { TILE_SIZE, ANIMAL_STATES, CHUNK_SIZE, TERRAIN, WORLD_SIZE } from '../constants.js';

const STATES = {
  WANDERING: 'wandering',
  HUNTING: 'hunting',
  FLEEING: 'fleeing',
  RESTING: 'resting',
  SEEKING_TREE: 'seeking_tree'
};

export class Animal extends Entity {
  constructor(world, x, y, species) {
    super(world, x, y);
    this.species = species;
    this.age = 0;
    this.energy = 100;
    this.target = null;
    this.state = STATES.WANDERING;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.direction = 1;
    this.frame = 0;
    this.frameTime = 0;
    this.huntTimer = 0;
    this.nearestTree = null;
    this.timeInWater = 0;
    this.timeSinceLastKill = 0;
  }

  update(dt) {
    this.updateVitals(dt);
    if (this.isDead()) return;
    this.updateAnimation(dt);
    this.updateBehavior(dt);
    this.updateState(dt);
  }

  updateVitals(dt) {
    this.age += dt;
    this.energy = Math.max(0, this.energy - dt * 0.5);
    this.frameTime += dt;

    const tile = this.getCurrentTile();
    if (tile === TERRAIN.WATER) {
      this.timeInWater += dt;
      if (this.timeInWater >= 5) {
        this.world.removeEntity(this);
        return;
      }
    } else {
      this.timeInWater = 0;
    }

    if (this.species.name === 'Wolf') {
      this.timeSinceLastKill += dt;
      if (this.timeSinceLastKill >= 15) {
        this.world.removeEntity(this);
        return;
      }
    }
  }

  isDead() {
    if (this.age >= this.species.maxAge || this.energy <= 0) {
      this.world.removeEntity(this);
      return true;
    }
    return false;
  }

  updateAnimation(dt) {
    if (this.frameTime >= 0.2) {
      this.frameTime = 0;
      this.frame = (this.frame + 1) % 4;
    }
  }

  updateBehavior(dt) {
    if (Math.random() < 0.1) this.findNearestTree();

    if (this.species.name === 'Wolf') {
      this.updateWolfBehavior(dt);
    } else if (this.species.diet === 'herbivore') {
      this.updateHerbivoreBehavior();
    }
  }

  updateWolfBehavior(dt) {
    if (this.state === STATES.RESTING) return;
    
    if (this.state === STATES.HUNTING) {
      this.huntTimer += dt;
      if (this.huntTimer >= 5) {
        this.rest();
        return;
      }
    } else {
      this.huntTimer = 0;
    }

    const prey = this.findPrey();
    if (prey) {
      this.target = prey;
      this.state = STATES.HUNTING;
      this.energy += 20;
    } else {
      this.state = STATES.WANDERING;
    }
  }

  updateHerbivoreBehavior() {
    if (this.state === STATES.FLEEING) return;
    
    const maxRadius = this.species.name === 'Rabbit' ? TILE_SIZE * 10 : TILE_SIZE * 50;
    if (!this.nearestTree || this.getDistanceTo(this.nearestTree) > maxRadius) {
      this.state = STATES.SEEKING_TREE;
    }

    const predator = this.detectPredator();
    if (predator) {
      this.state = STATES.FLEEING;
      this.target = predator;
    }
  }

  updateState(dt) {
    switch (this.state) {
      case STATES.WANDERING: this.wander(dt); break;
      case STATES.HUNTING: this.hunt(dt); break;
      case STATES.FLEEING: this.flee(dt); break;
      case STATES.RESTING: this.rest(dt); break;
      case STATES.SEEKING_TREE: this.seekTree(dt); break;
    }

    if (this.energy < 30 && this.state !== STATES.RESTING) {
      this.rest();
    }
  }

  findPrey() {
    const entities = this.world.getNearbyEntities(this.x, this.y, TILE_SIZE * 20);
    const preyTypes = ['Deer', 'Rabbit'];
    
    for (const type of preyTypes) {
      const prey = entities.filter(e => 
        e instanceof Animal && 
        e.species.name === type &&
        e !== this &&
        this.canReach(e.x, e.y)
      );
      
      if (prey.length > 0) {
        return this.findClosest(prey);
      }
    }
    return null;
  }

  findNearestTree() {
    const entities = this.world.getNearbyEntities(this.x, this.y, TILE_SIZE * 15);
    const trees = entities.filter(e => 
      e.constructor.name === 'Tree' &&
      this.canReach(e.x, e.y)
    );
    this.nearestTree = trees.length > 0 ? this.findClosest(trees) : null;
  }

  detectPredator() {
    if (this.species.diet === 'carnivore') return null;
    
    const entities = this.world.getNearbyEntities(this.x, this.y, TILE_SIZE * 5);
    return entities.find(e => 
      e instanceof Animal && 
      e.species.diet === 'carnivore' &&
      e !== this
    );
  }

  findClosest(entities) {
    return entities.reduce((closest, current) => {
      const closestDist = this.getDistanceTo(closest);
      const currentDist = this.getDistanceTo(current);
      return currentDist < closestDist ? current : closest;
    });
  }

  wander(dt) {
    const speed = this.species.speed * TILE_SIZE * dt;
    const nextX = this.x + Math.cos(this.wanderAngle) * speed;
    const nextY = this.y + Math.sin(this.wanderAngle) * speed;
    
    if (!this.canMove(nextX, nextY)) {
      this.wanderAngle += Math.PI + (Math.random() - 0.5) * Math.PI;
      return;
    }

    this.wanderAngle += (Math.random() - 0.5) * Math.PI * dt;
    const dx = Math.cos(this.wanderAngle) * speed;
    this.x += dx;
    this.y += Math.sin(this.wanderAngle) * speed;
    this.direction = dx > 0 ? 1 : -1;
  }

  hunt(dt) {
    if (!this.target || !this.world.entities.includes(this.target)) {
      this.state = STATES.WANDERING;
      return;
    }

    const dist = this.getDistanceTo(this.target);
    if (this.species.diet === 'carnivore' && dist < TILE_SIZE * 1.5) {
      this.killPrey();
      return;
    }

    this.moveToward(this.target, dt * 2);
  }

  killPrey() {
    if (this.target instanceof Animal) {
      this.world.removeEntity(this.target);
      this.energy += 50;
      this.state = STATES.WANDERING;
      this.target = null;
      if (this.species.name === 'Wolf') {
        this.timeSinceLastKill = 0;
      }
    }
  }

  flee(dt) {
    if (!this.target || !this.world.entities.includes(this.target)) {
      this.state = STATES.WANDERING;
      return;
    }

    const dist = this.getDistanceTo(this.target);
    if (dist > TILE_SIZE * 10) {
      this.state = STATES.WANDERING;
      this.target = null;
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const speed = this.species.speed * TILE_SIZE * dt;
    this.x -= (dx / dist) * speed;
    this.y -= (dy / dist) * speed;
    this.direction = -dx > 0 ? 1 : -1;
  }

  rest(dt) {
    if (dt) {
      this.restTime -= dt;
      this.energy += dt * 10;
      if (this.restTime <= 0 || this.energy >= 100) {
        this.state = STATES.WANDERING;
        this.energy = Math.min(this.energy, 100);
      }
    } else {
      this.state = STATES.RESTING;
      this.restTime = 5;
      this.target = null;
    }
  }

  seekTree(dt) {
    if (!this.nearestTree) {
      this.state = STATES.WANDERING;
      return;
    }

    const dist = this.getDistanceTo(this.nearestTree);
    const maxRadius = this.species.name === 'Rabbit' ? TILE_SIZE * 8 : TILE_SIZE * 40;
    
    if (dist < maxRadius * 0.8) {
      this.state = STATES.WANDERING;
      return;
    }

    this.moveToward(this.nearestTree, dt);
  }

  moveToward(target, dt) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = this.species.speed * TILE_SIZE * dt;
    
    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
    this.direction = dx > 0 ? 1 : -1;
  }

  canMove(x, y) {
    if (this.species.diet === 'herbivore' && this.nearestTree) {
      const maxRadius = this.species.name === 'Rabbit' ? TILE_SIZE * 10 : TILE_SIZE * 50;
      if (this.getDistanceTo({x, y}) > maxRadius) return false;
    }
    return this.canReach(x, y);
  }

  canReach(x, y) {
    try {
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);

      if (tileX < 0 || tileY < 0 || 
          tileX >= WORLD_SIZE * CHUNK_SIZE || 
          tileY >= WORLD_SIZE * CHUNK_SIZE) {
        return false;
      }

      const chunkX = Math.floor(tileX / CHUNK_SIZE);
      const chunkY = Math.floor(tileY / CHUNK_SIZE);
      const localX = tileX % CHUNK_SIZE;
      const localY = tileY % CHUNK_SIZE;
      const chunk = this.world.getChunkAt(chunkX * CHUNK_SIZE * TILE_SIZE, chunkY * CHUNK_SIZE * TILE_SIZE);
      
      if (!chunk) return false;
      
      const tile = chunk.getTile(localX, localY);
      if (!tile) return false;
      if (tile === TERRAIN.WATER) return false;
      if (tile === TERRAIN.STONE) return Math.random() < 0.3;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  getCurrentTile() {
    try {
      const tileX = Math.floor(this.x / TILE_SIZE);
      const tileY = Math.floor(this.y / TILE_SIZE);
      const chunkX = Math.floor(tileX / CHUNK_SIZE);
      const chunkY = Math.floor(tileY / CHUNK_SIZE);
      const localX = tileX % CHUNK_SIZE;
      const localY = tileY % CHUNK_SIZE;
      const chunk = this.world.getChunkAt(chunkX * CHUNK_SIZE * TILE_SIZE, chunkY * CHUNK_SIZE * TILE_SIZE);
      return chunk ? chunk.getTile(localX, localY) : null;
    } catch (error) {
      return null;
    }
  }

  getDistanceTo(target) {
    if (!target) return Infinity;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  render(ctx, camera) {
    const pos = camera.worldToScreen(this.x, this.y);
    const size = this.species.size * TILE_SIZE * camera.zoom;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(this.direction, 1);

    switch(this.species.name) {
      case 'Wolf': this.renderWolf(ctx, size); break;
      case 'Deer': this.renderDeer(ctx, size); break;
      case 'Rabbit': this.renderRabbit(ctx, size); break;
    }

    this.renderStateIcon(ctx, size);
    ctx.restore();
  }

  renderWolf(ctx, size) {
    const stride = Math.sin(this.frame * Math.PI / 2) * size * 0.1;
    
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = '#666666';
    [[-0.4, -stride], [-0.3, stride], [0.3, -stride], [0.4, stride]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.fillRect(x * size - size * 0.06, y + size * 0.2, size * 0.12, size * 0.4);
      ctx.closePath();
    });

    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.2);
    ctx.lineTo(size * 0.4, -size * 0.3);
    ctx.lineTo(size * 0.5, -size * 0.4);
    ctx.lineTo(size * 0.6, -size * 0.2);
    ctx.lineTo(size * 0.4, -size * 0.1);
    ctx.lineTo(-size * 0.1, -size * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.ellipse(size * 0.5, -size * 0.3, size * 0.25, size * 0.2, Math.PI / 6, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(size * 0.6, -size * 0.35, size * 0.04, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size * 0.62, -size * 0.35, size * 0.02, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  renderDeer(ctx, size) {
    const bob = Math.sin(this.frame * Math.PI / 2) * size * 0.05;
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, bob, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6B4423';
    [[-0.3, 0.2], [0.3, 0.2], [-0.4, 0.2], [0.4, 0.2]].forEach(([x, y]) => {
      ctx.fillRect(x * size - size * 0.05, bob + y * size, size * 0.1, size * 0.4);
    });

    ctx.beginPath();
    ctx.ellipse(size * 0.5, bob - size * 0.4, size * 0.2, size * 0.15, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size * 0.6, bob - size * 0.45, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  renderRabbit(ctx, size) {
    const bounce = Math.sin(this.frame * Math.PI / 2) * size * 0.1;
    
    ctx.fillStyle = '#A89F91';
    ctx.beginPath();
    ctx.ellipse(0, bounce, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(size * 0.3, bounce - size * 0.1, size * 0.2, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size * 0.4, bounce - size * 0.15, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  renderStateIcon(ctx, size) {
    const colors = {
      [STATES.HUNTING]: 'red',
      [STATES.FLEEING]: 'orange',
      [STATES.RESTING]: 'blue',
      [STATES.SEEKING_TREE]: 'brown'
    };

    ctx.fillStyle = colors[this.state] || 'yellow';
    ctx.beginPath();
    ctx.arc(0, -size - size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
}