# Virtual World Ecosystem Simulation

A dynamic ecosystem simulation featuring predator-prey relationships, environmental interactions, and emergent behaviors.

## Features

- **Dynamic World Generation**
  - Procedurally generated terrain with grass, water, sand, and stone
  - Chunk-based world loading system
  - Infinite world potential with active chunk management

- **Diverse Ecosystem**
  - Wolves (predators)
  - Deer and Rabbits (herbivores)
  - Trees with growth and reproduction

- **Realistic Behaviors**
  - Predator hunting mechanics
  - Prey escape patterns
  - Territory-based movement
  - Natural life cycles

- **Survival Mechanics**
  - Animals die in water after 5 seconds
  - Wolves must hunt successfully every 15 seconds
  - Energy management system
  - Age-based life cycles

- **Interactive Elements**
  - Spawn animals and trees
  - Camera controls with zoom
  - Real-time population monitoring

## Controls

- **T**: Place Tree
- **R**: Spawn Rabbit
- **D**: Spawn Deer
- **W**: Spawn Wolf
- **Mouse Wheel**: Zoom In/Out
- **Click**: Place selected entity

## Behavior Rules

### Wolves
- Must hunt successfully every 15 seconds to survive
- Hunt for 5 seconds before needing to rest
- Prefer deer over rabbits as prey
- Move faster when hunting

### Herbivores
- Rabbits stay within 10 tiles of trees
- Deer stay within 50 tiles of trees
- Flee from nearby predators
- Avoid water and prefer grass

### Environment
- All animals die after 5 seconds in water
- Animals can traverse stone terrain (30% chance)
- Trees grow and spread seeds naturally

## Technical Details

- Built with vanilla JavaScript
- Uses HTML5 Canvas for rendering
- Chunk-based world system for performance
- Entity-component architecture

## Acknowledgements

- Simplex Noise implementation by Jonas Wagner
- Inspired by various ecosystem simulations and Conway's Game of Life
- Canvas rendering techniques adapted from MDN Web Docs

## License

MIT License - Feel free to use and modify for your own projects.

---

Created by [Deshan] - A virtual ecosystem simulation project 