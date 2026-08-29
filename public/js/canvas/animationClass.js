import { Arc, Ellipse, Layer, Picture } from './canvasClasses.js';

class Animation {
    constructor({ repeat = false, maxDuration, frames = [], layer = new Layer(), x = 0, y = 0, width = 0, height = 0, speed = 1, scale = 1, renderingReRunFrames = 1, dynamicRender = false, onEnd }) {
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
        this.reRunFrames = renderingReRunFrames < 1 ? 1 : renderingReRunFrames;
        this.dynamicRender = !!dynamicRender;
        if (!this.dynamicRender) {
            this.render();
        }
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

    getRealDimension() {
        const x = this.x;
        const y = this.y;
        const width = this.width * this.scale;
        const height = this.height * this.scale;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        return { x, y, width, height, centerX, centerY };
    }

    render() {
        if (this.rendered) return;


        if (!this.frames || !this.frames.length) {
            throw new Error('No frames available for rendering');
        }

        if (this.width <= 0 || this.height <= 0) {
            throw new Error('Invalid animation size');
        }

        if (!this.reRunFrames || this.reRunFrames < 1) {
            this.reRunFrames = 1;
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = this.width;
        offscreenCanvas.height = this.height;

        const offscreenContext = offscreenCanvas.getContext('2d');
        if (!offscreenContext) {
            throw new Error('Failed to get 2D context from offscreen canvas');
        }

        const pictures = [];

        //for (let r = 1; r < this.reRunFrames; r++) {
        for (let i = 0; i < this.frames.length; i++) {
            const frameActions = this.frames[i];
            if (frameActions && frameActions.length) {
                frameActions.forEach(action => action());
            }

            offscreenContext.clearRect(0, 0, this.width, this.height);
            this.layer.draw(offscreenContext, { x: 0, y: 0, scale: 1, width: this.width, height: this.height });

            // Snapshot as CanvasImageSource (ImageData does not work with drawImage).
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = this.width;
            frameCanvas.height = this.height;

            const frameContext = frameCanvas.getContext('2d');
            if (!frameContext) {
                throw new Error('Failed to get 2D context from frame canvas');
            }
            frameContext.drawImage(offscreenCanvas, 0, 0);

            const picture = new Picture(
                frameCanvas, null,
                0, 0, this.width, this.height,
                0, 0, this.width, this.height
            );
            pictures.push(picture);
        }
        //}
        const picturesLength = pictures.length;
        for (let r = 1; r < this.reRunFrames; r++) {
            for (let i = 0; i < picturesLength; i++) {
                pictures.push(pictures[i]);
            }
        }
        const newFrames = pictures.map(picture => [(() => this.layer.shapes = [picture]).bind(this)]);
        this.frames = newFrames;
        this.rendered = true;
    }
}

function getExplossionAnimation(x, y, size, speed = 1, onEnd) {
    console.log(arguments);
    const pos1 = size / 4;
    const pos2 = pos1 * 2;
    const pos3 = pos1 * 3;
    const arc1 = new Arc(pos2, pos2, 0, '#ff0000');
    const arc2 = new Arc(pos1, pos1, 0, '#ff0000');
    const arc3 = new Arc(pos1, pos3, 0, '#ff0000');
    const arc4 = new Arc(pos3, pos1, 0, '#ff0000');
    const arc5 = new Arc(pos3, pos3, 0, '#ff0000');
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
    const increment = (size / 4) / 50;

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
        width: size,
        height: size
    })
}

function getBlackHoleAnimation({ x, y, maxSize, scale = 1 }) {
    const center = maxSize / 2;

    const d = ((maxSize / 2) / 50);
    const r = maxSize / 2 - d * 8

    const transparent = '#00000000';
    const black = '#000000';
    const white = '#ffffff';
    const shadow = '#99671ba9';

    const degToRad = (deg) => deg * Math.PI / 180;

    const ellipseRx = r * 1.5;
    const ellipseRy = r / 4;
    const ellipseRotation = degToRad(150);
    const ellipseStart = degToRad(130);
    const ellipseEnd = degToRad(50);

    const arcBorder = new Arc(center, center, r + d * 5, transparent, shadow, d * 15);
    const arcBg = new Arc(center, center, r + d * 8, '#000000');

    const ellBorder = new Ellipse(center, center, ellipseRx + d * 5, ellipseRy + d * 5, ellipseRotation, transparent, shadow, d * 15, degToRad(128), degToRad(52));
    const ellBg = new Ellipse(center, center, ellipseRx + d * 8, ellipseRy + d * 8, ellipseRotation, black, null, null, degToRad(160), degToRad(20));

    const offsets = [0, d, -d];
    let i = 0;
    const arcsToEdit = [];
    const ellipsesToEdit = [];
    for (const ox of offsets) {
        for (const oy of offsets) {
            const centerOX = center + ox;
            const centerOY = center + oy;
            const arc = new Arc(centerOX, centerOY, r + d * i, transparent, white, 4);
            arcsToEdit.unshift(arc);

            const ell = new Ellipse(centerOX, centerOY, ellipseRx + d * i, ellipseRy + d * 0, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
            ellipsesToEdit.unshift(ell);
            i++;
        }
    }

    const layer = new Layer('', [arcBg, ...arcsToEdit, arcBorder, ellBg, ...ellipsesToEdit, ellBorder]);

    const maxArcRadius = r + 8 * d;
    const maxEllipseRadius = ellipseRx + 8 * d;

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
            if (shape.radiusX > maxEllipseRadius) {
                shape.radiusX = ellipseRx;
                shape.radiusY = ellipseRy;
            }
        }

        const sizeScaled = maxSize * this.scale;
        this.width = sizeScaled;
        this.height = sizeScaled;
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

function getBlackHoleAnimation2({ x, y, maxSize, scale = 1 }) {
    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function safeNumber(value, fallback) {
        return Number.isFinite(value) ? value : fallback;
    }

    function createAnimationFrames(action, frameCount = 60) {
        return Array.from({ length: frameCount }, () => [action]);
    }

    function createGravityLensShape({ size, coreRadius, pullStrength, swirlSpeed }) {
        let phase = 0;
        const sampleCanvas = document.createElement('canvas');
        const sampleContext = sampleCanvas.getContext('2d');
        const center = size / 2;
        const lensRadius = size / 2;

        function tick() {
            phase = (phase + swirlSpeed) % (Math.PI * 2);
        }

        function drawAccretionGlow(context, cx, cy, localCoreRadius, localLensRadius) {
            const glow = context.createRadialGradient(cx, cy, localCoreRadius * 0.8, cx, cy, localLensRadius);
            glow.addColorStop(0, '#00000000');
            glow.addColorStop(0.35, '#d89f4a30');
            glow.addColorStop(0.7, '#8a59201a');
            glow.addColorStop(1, '#00000000');

            context.beginPath();
            context.fillStyle = glow;
            context.arc(cx, cy, localLensRadius, 0, Math.PI * 2);
            context.fill();
        }

        function drawCore(context, cx, cy, localCoreRadius) {
            context.beginPath();
            context.fillStyle = '#000000';
            context.arc(cx, cy, localCoreRadius, 0, Math.PI * 2);
            context.fill();

            context.beginPath();
            context.strokeStyle = '#2a1608';
            context.lineWidth = Math.max(1, localCoreRadius * 0.08);
            context.arc(cx, cy, localCoreRadius * 1.04, 0, Math.PI * 2);
            context.stroke();
        }

        function drawDistortion(context, cx, cy, localCoreRadius, localLensRadius) {
            if (!sampleContext || !context || !context.canvas) {
                return;
            }

            const captureRadius = Math.ceil(localLensRadius * 1.25);
            const captureSize = captureRadius * 2;
            if (captureSize <= 0) {
                return;
            }

            if (sampleCanvas.width !== captureSize || sampleCanvas.height !== captureSize) {
                sampleCanvas.width = captureSize;
                sampleCanvas.height = captureSize;
            }

            sampleContext.clearRect(0, 0, captureSize, captureSize);
            sampleContext.drawImage(
                context.canvas,
                cx - captureRadius,
                cy - captureRadius,
                captureSize,
                captureSize,
                0,
                0,
                captureSize,
                captureSize
            );

            const rings = 18;
            for (let ring = rings; ring >= 1; ring--) {
                const outer = (localLensRadius * ring) / rings;
                const inner = (localLensRadius * (ring - 1)) / rings;
                if (outer <= localCoreRadius * 0.9) {
                    continue;
                }

                const t = 1 - outer / localLensRadius;
                const warpScale = 1 - pullStrength * (t * t + 0.1);
                const swirlOffset = Math.sin(phase + ring * 0.45) * (t * localLensRadius * 0.08);
                const sourceRadius = Math.max(inner + 1, outer * warpScale);
                const sourceX = clamp(captureRadius - sourceRadius + swirlOffset, 0, captureSize - sourceRadius * 2);
                const sourceY = clamp(captureRadius - sourceRadius - swirlOffset, 0, captureSize - sourceRadius * 2);

                context.save();
                context.beginPath();
                context.arc(cx, cy, outer, 0, Math.PI * 2);
                context.arc(cx, cy, inner, 0, Math.PI * 2, true);
                context.clip();

                context.globalAlpha = 0.12 + t * 0.32;
                context.drawImage(
                    sampleCanvas,
                    sourceX,
                    sourceY,
                    sourceRadius * 2,
                    sourceRadius * 2,
                    cx - outer,
                    cy - outer,
                    outer * 2,
                    outer * 2
                );
                context.restore();
            }
        }

        return {
            draw(context, options = { x: 0, y: 0, scale: 1 }) {
                const shapeScale = safeNumber(options.scale, 1);
                const cx = safeNumber(options.x, 0) + center * shapeScale;
                const cy = safeNumber(options.y, 0) + center * shapeScale;
                const localCoreRadius = coreRadius * shapeScale;
                const localLensRadius = lensRadius * shapeScale;

                drawDistortion(context, cx, cy, localCoreRadius, localLensRadius);
                drawAccretionGlow(context, cx, cy, localCoreRadius, localLensRadius);
                drawCore(context, cx, cy, localCoreRadius);
            },
            drawResized(context) {
                this.draw(context, { x: 0, y: 0, scale: 1 });
            },
            tick,
        };
    }

    const resolvedMaxSize = Math.max(40, safeNumber(maxSize, 300));
    const resolvedScale = Math.max(0.05, safeNumber(scale, 1));
    const coreRadius = resolvedMaxSize * 0.19;
    const pullStrength = 0.42;
    const swirlSpeed = 0.06;

    const gravityLensShape = createGravityLensShape({
        size: resolvedMaxSize,
        coreRadius,
        pullStrength,
        swirlSpeed,
    });

    function blackHoleFrame2() {
        gravityLensShape.tick();
    }

    const frames = createAnimationFrames(blackHoleFrame2, 72);
    const layer = new Layer('', [gravityLensShape]);

    return new Animation({
        frames,
        layer,
        x,
        y,
        width: resolvedMaxSize,
        height: resolvedMaxSize,
        repeat: true,
        speed: 1,
        scale: resolvedScale,
        dynamicRender: true,
    });
}

export { getExplossionAnimation, getBlackHoleAnimation, getBlackHoleAnimation2 };