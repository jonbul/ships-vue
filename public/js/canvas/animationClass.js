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
    }

    pause() {
        if (!this.playing) return;
        this.progress = Date.now() - this.startTimestamp;
        this.playing = false;
    }

    stop() {
        this.playing = false;
        this.currentFrame = -1;
        this.startTimestamp = null;
        this.progress = 0;
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
        if (this.playing) {
            this.nextFrame();
            const frameActions = this.frames[this.currentFrame];
            if (frameActions && frameActions.length && drawable) {
                frameActions.forEach(action => action());
            }
        }
        if (drawable) {
            this.layer.draw(context, { x: this.x, y: this.y, scale: this.scale, width: this.width, height: this.height });
        }
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

function getBlackHoleAnimation(blackHoleData) {
    const { x, y, scale, maxSize } = blackHoleData;


    const d = (maxSize / 2 / 50);
    const r = maxSize / 2 - d * 8

    const transparent = '#00000000';
    const black = '#000000';
    const white = '#ffffff';
    const shadow = '#f89500a9';

    const degToRad = (deg) => deg * Math.PI / 180;

    const ellipseRx = r * 1.5;
    const ellipseRy = r / 4;
    const ellipseRotation = degToRad(150);
    const ellipseStart = degToRad(130);
    const ellipseEnd = degToRad(50);

    const arcBorder = new Arc(0, 0, r + d * 5, transparent, shadow, d * 15);
    const arcBg = new Arc(0, 0, r + d * 8, '#000000');

    const ellBorder = new Ellipse(0, 0, ellipseRx + d * 5, ellipseRy + d * 5, ellipseRotation, transparent, shadow, d * 15, degToRad(128), degToRad(52));
    const ellBg = new Ellipse(0, 0, ellipseRx + d * 8, ellipseRy + d * 8, ellipseRotation, black, null, null, degToRad(160), degToRad(20));

    const offsets = [0, d, -d];
    let i = 0;
    const arcsToEdit = [];
    const ellipsesToEdit = [];
    for (const ox of offsets) {
        for (const oy of offsets) {
            const arc = new Arc(ox, oy, r + d * i, transparent, white, 4);
            arcsToEdit.unshift(arc);

            const ell = new Ellipse(ox, oy, ellipseRx + d * i, ellipseRy + d * 0, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
            ellipsesToEdit.unshift(ell);
            i++;
        }
    }

    const layer = new Layer('', [arcBg, ...arcsToEdit, arcBorder, ellBg, ...ellipsesToEdit, ellBorder]);

    const maxArcRadius = r + 8 * d;
    const maxEllipseRadiusX = ellipseRx + 8 * d;
    const maxEllipseRadiusY = ellipseRy + 8 * d;

    function blackHoleFrame() {
        let maxR = 0;
        for (let i = 0; i < arcsToEdit.length; i++) {
            const shape = arcsToEdit[i];
            shape.radius += d;
            if (shape.radius > maxArcRadius) {
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
        }

        this.width = maxEllipseRadiusX * 2;
        this.height = maxEllipseRadiusY * 2;
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
        scale,
    })
}

function getBlackHoleAnimations(blackHoleData) {


    const steps = 30; // duracion visual del flash
    const targetRadius = blackHoleData.maxSize / 2; // diametro final = 2 * maxSize
    const inc = targetRadius / steps;

    const arc = new Arc(targetRadius, targetRadius, 0, '#ffffff77');
    const layer = new Layer('', [arc]);

    const frames = [];
    for (let i = 0; i < steps; i++) {
        frames.push([() => { arc.radius += inc; }]); // 1 accion por frame
    }

    const flashAnimation = new Animation({
        repeat: false,
        frames,
        layer,
        x: blackHoleData.x,
        y: blackHoleData.y,
        width: blackHoleData.maxSize,
        height: blackHoleData.maxSize,
        speed: 1,
        scale: 2
    });

    const bhAnimation = getBlackHoleAnimation(blackHoleData);
    return [flashAnimation, bhAnimation];
}

export { getExplossionAnimation, getBlackHoleAnimation };