import { Game } from './src/engine/Game.js';
import './style.css';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const game = new Game(canvas);
game.start();

let isDragging = false;
let lastMousePos = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastMousePos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    game.camera.position.x -= dx / game.camera.zoom;
    game.camera.position.y -= dy / game.camera.zoom;
    
    lastMousePos = { x: e.clientX, y: e.clientY };
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
  const zoomSpeed = 0.1;
  const zoomDelta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
  game.camera.zoom = Math.max(0.1, Math.min(5, game.camera.zoom + zoomDelta));
  e.preventDefault();
});