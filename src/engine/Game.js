import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';
import { World } from './world/World.js';
import { Tree } from './entities/plants/Tree.js';
import { Animal } from './entities/Animal.js';
import { TreeSpecies } from './entities/species/TreeSpecies.js';
import { AnimalSpecies } from './entities/species/AnimalSpecies.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_SIZE, CHUNK_SIZE, TILE_SIZE, TERRAIN } from './constants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.renderer = new Renderer(canvas);
    this.world = new World();
    
    this.initializeEcosystem();
    this.setupInteraction();
    
    this.lastTime = 0;
    this.running = false;
    this.selectedTool = 'tree';
    this.spawnTimer = 0;

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.camera.width = window.innerWidth;
      this.camera.height = window.innerHeight;
    });
  }

  setupInteraction() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldPos = this.camera.screenToWorld(mouseX, mouseY);
      this.placeEntity(worldPos.x, worldPos.y);
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.camera.zoomIn();
      } else {
        this.camera.zoomOut();
      }
    });

    window.addEventListener('keydown', (e) => {
      switch(e.key.toLowerCase()) {
        case 't':
          this.selectedTool = 'tree';
          break;
        case 'r':
          this.selectedTool = 'rabbit';
          break;
        case 'd':
          this.selectedTool = 'deer';
          break;
        case 'w':
          this.selectedTool = 'wolf';
          break;
        case '=':
        case '+':
          this.camera.zoomIn();
          break;
        case '-':
        case '_':
          this.camera.zoomOut();
          break;
      }
    });
  }

  placeEntity(x, y) {
    const chunk = this.world.getChunkAt(x, y);
    const localX = Math.floor(x / TILE_SIZE) % CHUNK_SIZE;
    const localY = Math.floor(y / TILE_SIZE) % CHUNK_SIZE;
    const tile = chunk.getTile(localX, localY);
    
    console.log('Placing entity at:', {x, y, localX, localY, tile});
    
    if (tile === TERRAIN.WATER || tile === TERRAIN.STONE) {
      console.log('Cannot spawn on water/stone');
      return; 
    }

    switch(this.selectedTool) {
      case 'tree': {
        const species = Object.values(TreeSpecies)[Math.floor(Math.random() * Object.values(TreeSpecies).length)];
        const tree = new Tree(this.world, x, y, species);
        this.world.addEntity(tree);
        console.log('Spawned tree');
        break;
      }
      case 'rabbit': {
        const rabbit = new Animal(this.world, x, y, AnimalSpecies.RABBIT);
        this.world.addEntity(rabbit);
        console.log('Spawned rabbit');
        break;
      }
      case 'deer': {
        const deer = new Animal(this.world, x, y, AnimalSpecies.DEER);
        this.world.addEntity(deer);
        console.log('Spawned deer');
        break;
      }
      case 'wolf': {
        const wolf = new Animal(this.world, x, y, AnimalSpecies.WOLF);
        this.world.addEntity(wolf);
        console.log('Spawned wolf');
        break;
      }
    }
  }

  initializeEcosystem() {
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      if (this.world.canGrowTree(x, y)) {
        const species = Object.values(TreeSpecies)[Math.floor(Math.random() * Object.values(TreeSpecies).length)];
        this.world.addEntity(new Tree(this.world, x, y, species));
      }
    }

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      this.world.addEntity(new Animal(this.world, x, y, AnimalSpecies.RABBIT));
    }
    
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      this.world.addEntity(new Animal(this.world, x, y, AnimalSpecies.DEER));
    }
    
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
      this.world.addEntity(new Animal(this.world, x, y, AnimalSpecies.WOLF));
    }
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.renderer.renderWorld(this.world, this.camera);
    this.renderer.renderUI(this);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(deltaTime) {
    this.world.update(deltaTime);
    this.camera.update(deltaTime);
    this.world.updateActiveChunks(this.camera);
    
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 5) {
      this.spawnTimer = 0;
      
      if (Math.random() < 0.3) {
        const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        if (this.world.canGrowTree(x, y)) {
          const species = Object.values(TreeSpecies)[Math.floor(Math.random() * Object.values(TreeSpecies).length)];
          this.world.addEntity(new Tree(this.world, x, y, species));
        }
      }
      
      if (Math.random() < 0.2) {
        const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        this.world.addEntity(new Animal(this.world, x, y, AnimalSpecies.RABBIT));
      }
      
      if (Math.random() < 0.1) {
        const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        this.world.addEntity(new Animal(this.world, x, y, AnimalSpecies.DEER));
      }
      
      if (Math.random() < 0.05) {
        const x = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        const y = Math.random() * WORLD_SIZE * CHUNK_SIZE * TILE_SIZE;
        this.world.addEntity(new Animal(this.world, x, y, AnimalSpecies.WOLF));
      }
    }
  }
}