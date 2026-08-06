import { Arc, Ellipse, Layer } from './canvasClasses.js';

class Animation {
    constructor({ repeat = false, maxDuration, frames = [], layer = new Layer(), x = 0, y = 0, width = 0, height = 0, speed = 1, scale = 1, onEnd }) {
        this.repeat = repeat;
        this.maxDuration = maxDuration;
        this.frames = frames.map(frame => frame.map(action => action.bind(this)));
        this.layer = layer;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.onEnd = [];
        if (onEnd) {
            this.onEnd.push(onEnd.bind(this));
        }
        this.playing = false;
        this.currentFrame = -1;
        this.startTimestamp = null;
        this.progress = 0;
        this.scale = scale;
    }

    play() {
        this.playing = true;
        this.startTimestamp = !this.startTimestamp ? Date.now() : Date.now() - this.progress;
        console.log("PLAY!");
    }

    pause() {
        this.playing = false;
        this.progress = Date.now() - this.startTimestamp;
    }

    stop() {
        this.playing = false;
        this.currentFrame = -1;
    }

    addEndCallback(callback) {
        this.onEnd.push(callback.bind(this));
    }

    nextFrame() {
        this.currentFrame += this.speed;
        if (this.currentFrame >= this.frames.length) { // animation ended
            let limitTimeElapsed = !!this.maxDuration && (this.maxDuration > 0) && (Date.now() - this.startTimestamp) > this.maxDuration;


            if (this.repeat) {
                this.currentFrame = -1;
            }
            if (!this.repeat || (this.repeat && limitTimeElapsed)) {
                this.stop();
                // Call onEnd callback if defined and if the animation is not set to repeat or if it has a maxDuration and the elapsed time is less than maxDuration
                if (this.onEnd.length) {
                    this.onEnd.forEach(callback => callback());
                }
                return;
            }
        }
    }

    drawFrame(context, drawable) {
        this.nextFrame();
        const frameActions = this.frames[this.currentFrame];
        if (frameActions && frameActions.length && drawable) {
            frameActions.forEach(action => action());
        }
        this.layer.draw(context, { x: this.x, y: this.y, scale: this.scale, width: this.width, height: this.height });
    }
}

function getExplossionAnimation(x, y, width, height, speed = 1, onEnd) {
    const arc1 = new Arc(0, 0, 0, '#ff0000');
    const arc2 = new Arc(-25, -25, 0, '#ff0000');
    const arc3 = new Arc(-25, 25, 0, '#ff0000');
    const arc4 = new Arc(25, -25, 0, '#ff0000');
    const arc5 = new Arc(25, 25, 0, '#ff0000');
    const shapes = [arc1, arc2, arc3, arc4, arc5];
    const layer = new Layer('', shapes);
    const incArc = (e, increment) => e.radius += increment;
    const toWhite = (e) => e.backgroundColor = '#ffffff';
    const toRed = (e) => e.backgroundColor = '#ff0000';
    const incArcWhite = (e, increment) => {
        incArc(e, increment);
        toWhite(e);
    }
    const incArcRed = (e, increment) => {
        incArc(e, increment);
        toRed(e);
    }
    const restart = () => {
        arc1.radius = 0;
        arc2.radius = 0;
        arc3.radius = 0;
        arc4.radius = 0;
        arc5.radius = 0;
    }
    const frames = [[restart]];
    const increment = 1;

    for (let i = 0; i < 49; i++) {
        addActionInFrame(i * 10, incArcRed.bind(null, arc1, increment));
        addActionInFrame(i * 10 + 5, incArcWhite.bind(null, arc1, increment));

        addActionInFrame(i * 10 + 5, toRed.bind(null, arc2));
        addActionInFrame(i * 10, incArcWhite.bind(null, arc2, increment));
        addActionInFrame(i * 10 + 5, toRed.bind(null, arc3));
        addActionInFrame(i * 10, incArcWhite.bind(null, arc3, increment));
        addActionInFrame(i * 10 + 5, toRed.bind(null, arc4));
        addActionInFrame(i * 10, incArcWhite.bind(null, arc4, increment));
        addActionInFrame(i * 10 + 5, toRed.bind(null, arc5));
        addActionInFrame(i * 10, incArcWhite.bind(null, arc5, increment));
    }

    function addActionInFrame(frame = 0, action) {
        frames[frame] = frames[frame] || [];
        frames[frame].push(action);
    }

    return new Animation({
        frames: frames,
        layer: layer,
        x,
        y,
        width,
        height
    })
}

function getBlackHoleAnimationBase(x, y, r, maxDuration) {
    const d = r / 50;
    const transparent = '#00000000';
    const black = '#000000';
    const white = '#ffffff';
    const shadow = '#f89500a9';

    const arcBorder = new Arc(0, 0, r + d * 5, transparent, shadow, d * 15);
    const arcBg = new Arc(0, 0, r + d * 8, '#000000');


    const degToRad = (deg) => deg * Math.PI / 180;

    const ellipseRx = r * 1.5;
    const ellipseRy = r / 4;
    const ellipseRotation = degToRad(150);
    const ellipseStart = degToRad(130);
    const ellipseEnd = degToRad(50);

    const ellBorder = new Ellipse(0, 0, ellipseRx + d * 5, ellipseRy + d * 5, ellipseRotation, transparent, shadow, d * 15, degToRad(128), degToRad(52));
    const ellBg = new Ellipse(0, 0, ellipseRx + d * 8, ellipseRy + d * 8, ellipseRotation, black, null, null, degToRad(160), degToRad(20));

    const sizes = [0, d, -d];
    let i = 0;
    const arcsToEdit = [];
    const ellipsesToEdit = [];
    for (const x of sizes) {
        for (const y of sizes) {
            const arc = new Arc(x, y, r + d * i, transparent, white, 4);
            arcsToEdit.unshift(arc);

            const ell = new Ellipse(x, y, ellipseRx + d * i, ellipseRy + d * 0, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
            ellipsesToEdit.unshift(ell);
            i++;
        }
    }

    const shapes = [arcBg, ...arcsToEdit, arcBorder, ellBg, ...ellipsesToEdit, ellBorder];
    const layer = new Layer('', shapes);

    const totalFrames = 10;
    const maxRadius = r + 8 * d;
    const maxEllipseRadiusX = ellipseRx + 8 * d;
    const itemsToSkip = 1;
    function blackHoleFrame() {
        let maxR = 0;
        for (let i = 0; i < arcsToEdit.length; i++) {
            const shape = arcsToEdit[i];
            shape.radius += d;
            if (shape.radius > maxRadius) {
                shape.radius = r;
            }
        }

        for (let i = 0; i < ellipsesToEdit.length; i++) {
            const shape = ellipsesToEdit[i];
            shape.radiusX += d;
            shape.radiusY += d;
            if (shape.radiusX > maxEllipseRadiusX) {
                shape.radiusX = ellipseRx;
                shape.radiusY = ellipseRy;
            }
            if (shape.radiusX > maxR) {
                maxR = shape.radiusX;
            }
            if (shape.radiusY > maxR) {
                maxR = shape.radiusY;
            }
        }

        this.width = maxR * 2;
        this.height = maxR * 2;
        if (this.scale < 1) {
            this.scale += 0.01;
            console.log((Date.now() - this.startTimestamp) / 1000);
        }
    }
    const frames = [[blackHoleFrame]];

    return new Animation({
        frames,
        layer,
        x,
        y,
        width: r * 2,
        height: r * 2,
        repeat: true,
        speed: 0.5,
        maxDuration,
        scale: 0.01,
    })
}

function getBlackHoleAnimations(x, y, r, maxDuration = 25000) {
    const arc = new Arc(x, y, 0, '#ffffff77');
    const layer = new Layer('', [arc]);
    const startFrames = [];

    function increaseRadius(inc) {
        arc.radius += inc;
    }

    for (let i = 0; i < 5000; i++) {
        startFrames.push(() => increaseRadius(10));
    }

    const flashAnimation = new Animation({ repeat: false, maxDuration, frames: [startFrames], layer, x, y, width: r * 2, height: r * 2, speed: 1 });


    const bhAnimation = getBlackHoleAnimationBase(x, y, r, maxDuration);

    return [flashAnimation, bhAnimation];
}

export { getExplossionAnimation, getBlackHoleAnimations, getBlackHoleAnimationBase };