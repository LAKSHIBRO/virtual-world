export class Climate {
  constructor(world) {
    this.world = world;
    this.temperature = 20;
    this.rainfall = 0;
    this.season = 'summer';
    this.seasonProgress = 0;
    this.timeMultiplier = 100;
  }

  update(deltaTime) {
    const actualTime = deltaTime * this.timeMultiplier;
    this.seasonProgress += actualTime / (90 * 24 * 60 * 60); 
    
    if (this.seasonProgress >= 1) {
      this.seasonProgress = 0;
      this.changeSeason();
    }

    this.updateTemperature(actualTime);
    this.updateRainfall(actualTime);
  }

  changeSeason() {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(this.season);
    this.season = seasons[(currentIndex + 1) % 4];
  }

  updateTemperature(deltaTime) {
    const baseTemp = {
      spring: 15,
      summer: 25,
      autumn: 15,
      winter: 5
    }[this.season];

    
    const dayProgress = (this.world.time % (24 * 60 * 60)) / (24 * 60 * 60);
    const dailyVariation = Math.sin(dayProgress * Math.PI * 2) * 5;

    this.temperature = baseTemp + dailyVariation;
  }

  updateRainfall(deltaTime) {
    if (Math.random() < 0.001 * deltaTime) {
      this.rainfall = Math.random() * 10;
    } else {
      this.rainfall = Math.max(0, this.rainfall - 0.1 * deltaTime);
    }
  }
}