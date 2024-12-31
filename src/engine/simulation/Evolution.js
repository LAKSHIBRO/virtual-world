export class Evolution {
  constructor(world) {
    this.world = world;
    this.generationStats = new Map();
    this.timeMultiplier = 100;
  }

  update(deltaTime) {
    const actualTime = deltaTime * this.timeMultiplier;
    this.trackStats();
  }

  trackStats() {
    const stats = new Map();
    
    for (const entity of this.world.entities) {
      if (!entity.species) continue;
      
      const speciesName = entity.species.name;
      if (!stats.has(speciesName)) {
        stats.set(speciesName, {
          count: 0,
          avgSize: 0,
          avgLifespan: 0,
          avgResistance: 0
        });
      }
      
      const speciesStats = stats.get(speciesName);
      speciesStats.count++;
      speciesStats.avgSize += entity.size;
      speciesStats.avgLifespan += entity.age;
      speciesStats.avgResistance += entity.resistance;
    }

    for (const [species, data] of stats) {
      if (data.count > 0) {
        data.avgSize /= data.count;
        data.avgLifespan /= data.count;
        data.avgResistance /= data.count;
      }
      this.generationStats.set(species, data);
    }
  }

  getStats() {
    return this.generationStats;
  }
}