import { Game } from "../scenes/Game";

/**
 * Stores a bunch of sounds and plays them as needed.
 * If no sounds are available, play nothing.
 */
export class AudioPool {
  private sounds: Array<Phaser.Sound.BaseSound>;

  /**
   * Increments after use and wraps back to 0.
   */
  private currentIdx: number;

  constructor(game: Game, soundName: string, numberSounds: number) {
    this.currentIdx = 0;
    this.sounds = [];

    for (let i = 0; i < numberSounds; i++) {
      let sound = game.sound.add(soundName);

      this.sounds.push(sound);
    }
  }

  /**
   * Play a sound from the pool if possible.
   * @param volumePercent 0 to 1.0. If <= 0, doesn't play the sound.
   */
  public play(volumePercent: number) {
    if (volumePercent <= 0) {
      return;
    }

    const currentSound = this.sounds[
      this.currentIdx
    ] as Phaser.Sound.HTML5AudioSound;

    if (!currentSound.isPlaying) {
      currentSound.setVolume(volumePercent);
      currentSound.play();
      this.currentIdx++;

      this.currentIdx = (this.currentIdx + 1) % this.sounds.length;
    }
  }
}
