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

function getExplossionAnimation2(x, y, size, speed = 1, onEnd) {
    const safeSize = Math.max(40, size || 120);
    const center = safeSize / 2;
    const core = new Arc(center, center, safeSize * 0.06, 'rgba(255,245,220,0.95)');
    const fireball = new Arc(center, center, safeSize * 0.1, 'rgba(255,132,0,0.85)');
    const shockwave = new Arc(
        center,
        center,
        safeSize * 0.12,
        'rgba(255,255,255,0)',
        'rgba(255,210,120,0.95)',
        Math.max(2, safeSize * 0.03)
    );
    const smokeFront = new Ellipse(center, center, safeSize * 0.14, safeSize * 0.09, 0, 'rgba(120,120,120,0.35)');
    const smokeBack = new Ellipse(center, center, safeSize * 0.12, safeSize * 0.07, 0, 'rgba(70,70,70,0.28)');

    const sparkCount = 12;
    const sparks = [];
    const sparkMeta = [];
    for (let i = 0; i < sparkCount; i++) {
        const spark = new Arc(center, center, safeSize * 0.02, 'rgba(255,240,170,0.9)');
        sparks.push(spark);

        const angle = (Math.PI * 2 * i) / sparkCount + ((i % 3) * 0.08);
        const speedScale = 0.5 + (i % 5) * 0.14;
        sparkMeta.push({ angle, speedScale });
    }

    const layer = new Layer('', [smokeBack, shockwave, fireball, ...sparks, core, smokeFront]);
    const totalFrames = 54;
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
        const action = () => {
            const t = i / (totalFrames - 1);
            const inv = 1 - t;

            core.radius = safeSize * (0.05 + t * 0.5);
            core.backgroundColor = `rgba(255, ${Math.round(240 - 170 * t)}, ${Math.round(220 - 210 * t)}, ${Math.max(0, 0.95 * inv).toFixed(3)})`;

            fireball.radius = safeSize * (0.1 + t * 0.95);
            fireball.backgroundColor = `rgba(255, ${Math.round(130 - 90 * t)}, ${Math.round(20 * inv)}, ${Math.max(0, 0.85 * inv).toFixed(3)})`;

            shockwave.radius = safeSize * (0.14 + t * 1.45);
            shockwave.borderWidth = Math.max(1, safeSize * (0.03 * inv + 0.004));
            shockwave.borderColor = `rgba(255, ${Math.round(210 - 80 * t)}, ${Math.round(120 - 90 * t)}, ${Math.max(0, 0.95 * inv).toFixed(3)})`;

            smokeFront.radiusX = safeSize * (0.15 + t * 1.15);
            smokeFront.radiusY = safeSize * (0.08 + t * 0.55);
            smokeFront.backgroundColor = `rgba(${Math.round(130 - 50 * t)}, ${Math.round(130 - 50 * t)}, ${Math.round(130 - 50 * t)}, ${Math.max(0, 0.26 * inv).toFixed(3)})`;

            smokeBack.radiusX = safeSize * (0.12 + t * 1.35);
            smokeBack.radiusY = safeSize * (0.07 + t * 0.72);
            smokeBack.backgroundColor = `rgba(${Math.round(90 - 30 * t)}, ${Math.round(90 - 30 * t)}, ${Math.round(90 - 30 * t)}, ${Math.max(0, 0.2 * inv).toFixed(3)})`;

            for (let j = 0; j < sparks.length; j++) {
                const spark = sparks[j];
                const meta = sparkMeta[j];
                const travel = safeSize * (0.2 + 1.2 * t) * meta.speedScale;
                spark.x = center + Math.cos(meta.angle) * travel;
                spark.y = center + Math.sin(meta.angle) * travel;
                spark.radius = Math.max(0.5, safeSize * (0.022 * inv + 0.002));
                spark.backgroundColor = `rgba(255, ${Math.round(240 - 120 * t)}, ${Math.round(160 - 130 * t)}, ${Math.max(0, 0.9 * inv).toFixed(3)})`;
            }
        };
        frames.push([action]);
    }

    return new Animation({
        frames,
        layer,
        x,
        y,
        width: safeSize,
        height: safeSize,
        speed,
        dynamicRender: true,
        onEnd,
    });
}

function getBlackHoleExplossionAnimation(x, y, size, speed = 1, onEnd) {
    const safeSize = Math.max(50, size || 140);
    const center = safeSize / 2;

    const collapseCore = new Arc(center, center, safeSize * 0.45, 'rgba(0,0,0,0.9)');
    const eventHorizon = new Arc(
        center,
        center,
        safeSize * 0.5,
        'rgba(0,0,0,0)',
        'rgba(125,80,18,0.9)',
        Math.max(2, safeSize * 0.03)
    );
    const gravityPulse = new Arc(
        center,
        center,
        safeSize * 0.16,
        'rgba(0,0,0,0)',
        'rgba(216,160,84,0.9)',
        Math.max(1, safeSize * 0.02)
    );
    const accretionA = new Ellipse(center, center, safeSize * 0.35, safeSize * 0.14, Math.PI / 6, 'rgba(219,145,62,0.22)');
    const accretionB = new Ellipse(center, center, safeSize * 0.31, safeSize * 0.12, -Math.PI / 4, 'rgba(255,212,130,0.14)');

    const debrisCount = 14;
    const debris = [];
    const debrisMeta = [];
    for (let i = 0; i < debrisCount; i++) {
        const p = new Arc(center, center, safeSize * 0.015, 'rgba(255,220,150,0.9)');
        debris.push(p);
        debrisMeta.push({
            angle: (Math.PI * 2 * i) / debrisCount + (i % 2) * 0.11,
            orbitScale: 0.65 + (i % 4) * 0.12,
            phase: i * 0.45,
        });
    }

    const layer = new Layer('', [gravityPulse, eventHorizon, accretionA, accretionB, ...debris, collapseCore]);
    const totalFrames = 64;
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
        const action = () => {
            const t = i / (totalFrames - 1);
            const inv = 1 - t;

            collapseCore.radius = safeSize * (0.48 - 0.44 * t);
            collapseCore.backgroundColor = `rgba(${Math.round(15 + 12 * inv)}, ${Math.round(10 + 8 * inv)}, ${Math.round(8 + 6 * inv)}, ${Math.max(0.45, 0.92 - t * 0.2).toFixed(3)})`;

            eventHorizon.radius = safeSize * (0.5 - 0.3 * t);
            eventHorizon.borderWidth = Math.max(1, safeSize * (0.03 * inv + 0.006));
            eventHorizon.borderColor = `rgba(${Math.round(120 + 90 * inv)}, ${Math.round(75 + 70 * inv)}, ${Math.round(18 + 30 * inv)}, ${Math.max(0.2, 0.95 * inv).toFixed(3)})`;

            gravityPulse.radius = safeSize * (0.16 + 1.0 * t);
            gravityPulse.borderWidth = Math.max(1, safeSize * (0.02 * inv));
            gravityPulse.borderColor = `rgba(${Math.round(255 - 80 * t)}, ${Math.round(215 - 120 * t)}, ${Math.round(140 - 110 * t)}, ${Math.max(0, 0.95 * inv).toFixed(3)})`;

            accretionA.radiusX = safeSize * (0.35 - 0.24 * t);
            accretionA.radiusY = safeSize * (0.14 - 0.08 * t);
            accretionA.rotation += 0.09;
            accretionA.backgroundColor = `rgba(219,145,62,${Math.max(0, 0.22 * inv).toFixed(3)})`;

            accretionB.radiusX = safeSize * (0.31 - 0.23 * t);
            accretionB.radiusY = safeSize * (0.12 - 0.07 * t);
            accretionB.rotation -= 0.11;
            accretionB.backgroundColor = `rgba(255,212,130,${Math.max(0, 0.16 * inv).toFixed(3)})`;

            for (let j = 0; j < debris.length; j++) {
                const d = debris[j];
                const meta = debrisMeta[j];
                const spiral = safeSize * (0.47 - 0.4 * t) * meta.orbitScale;
                const theta = meta.angle + meta.phase + t * 9.0;
                d.x = center + Math.cos(theta) * spiral;
                d.y = center + Math.sin(theta) * spiral;
                d.radius = Math.max(0.5, safeSize * (0.015 * inv + 0.002));
                d.backgroundColor = `rgba(${Math.round(255 - 70 * t)}, ${Math.round(225 - 130 * t)}, ${Math.round(150 - 120 * t)}, ${Math.max(0, 0.9 * inv).toFixed(3)})`;
            }
        };
        frames.push([action]);
    }

    return new Animation({
        frames,
        layer,
        x,
        y,
        width: safeSize,
        height: safeSize,
        speed,
        dynamicRender: true,
        onEnd,
    });
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

export { getExplossionAnimation, getExplossionAnimation2, getBlackHoleExplossionAnimation, getBlackHoleAnimation, getBlackHoleAnimation2 };