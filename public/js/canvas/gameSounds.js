// Sound playback used to clone the <audio> element on every single shot.
// With a full NPC fleet the client receives ~35 newBullet events a second,
// so that created ~35 fresh HTMLAudioElements per second, each one loading
// and decoding shot.wav (308 KB of uncompressed PCM) into its own native
// buffer. Those buffers live outside the JS heap, so V8 felt no memory
// pressure and never hurried to collect the elements: a long session grew
// the tab to gigabytes while the JS heap stayed flat at ~10 MB.
//
// A fixed pool of preloaded elements caps the decoded audio at pool size and
// makes an overlapping shot free - the oldest voice is simply restarted,
// which is the usual way games handle rapid-fire effects anyway.
const POOL_SIZES = { shot: 8, explosion: 4 };
const DEFAULT_POOL_SIZE = 4;

class GameSounds {
    constructor() {
        this.paths = {
            explosion: '/sounds/explossion.wav',
            shot: '/sounds/shot.wav'
        };
        this.pools = {};
        this.nextVoice = {};
        for (const soundName in this.paths) {
            this.pools[soundName] = this.createPool(soundName);
            this.nextVoice[soundName] = 0;
        }
    }

    createPool(soundName) {
        const size = POOL_SIZES[soundName] || DEFAULT_POOL_SIZE;
        const pool = [];
        for (let i = 0; i < size; i++) {
            const audio = document.createElement('audio');
            audio.src = this.paths[soundName];
            audio.preload = 'auto';
            pool.push(audio);
        }
        return pool;
    }

    // The volume slider belongs to the Vue view, which has not necessarily
    // rendered when this module is first imported, so resolve it lazily and
    // re-resolve it if the view was torn down and rebuilt.
    getVolume() {
        if (!this.volumeElement || !this.volumeElement.isConnected) {
            this.volumeElement = document.getElementById('audioVolume');
        }
        const value = this.volumeElement ? Number(this.volumeElement.value) : 100;
        if (!Number.isFinite(value)) return 1;
        return Math.min(1, Math.max(0, value / 100));
    }

    shot() {
        this.play('shot');
    }

    explosion() {
        this.play('explosion');
    }

    play(soundName) {
        const pool = this.pools[soundName];
        if (!pool || !pool.length) return;

        const audio = pool[this.nextVoice[soundName]];
        this.nextVoice[soundName] = (this.nextVoice[soundName] + 1) % pool.length;

        try {
            audio.volume = this.getVolume();
            audio.currentTime = 0;
            // play() rejects when this voice gets reused before it finished,
            // which is the normal case here and must not surface as an
            // unhandled promise rejection.
            const started = audio.play();
            if (started && typeof started.catch === 'function') {
                started.catch(() => { });
            }
        } catch (e) {
            console.log('Error playing sound: ', e);
        }
    }
}

export default new GameSounds();
