import { Arc, Ellipse, Layer } from './canvasClasses.js';

class Animation {
    constructor({ repeat = false, frames = [], layer = new Layer(), x = 0, y = 0, width = 0, height = 0, speed = 1, onEnd }) {
        this.repeat = repeat;
        this.frames = frames;
        this.layer = layer;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.onEnd = onEnd;
        this.playing = false;
        this.currentFrame = -1;
    }

    play() {
        this.playing = true;
    }

    pause() {
        this.playing = false;
    }

    stop() {
        this.playing = false;
        this.currentFrame = -1;
    }

    drawFrame(context, drawable) {
        this.currentFrame += this.speed;
        if (this.currentFrame >= this.frames.length) {
            if (this.repeat) {
                this.currentFrame = -1;
            } else {
                this.stop();
            }
        }
        const frameActions = this.frames[this.currentFrame];
        if (frameActions && frameActions.length && drawable) {
            frameActions.forEach(action => action());
        }
        this.layer.draw(context, { x: this.x, y: this.y });

        if (this.onEnd && !this.repeat && this.currentFrame >= this.frames.length - 1)
            this.onEnd();
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

function getBlackHoleAnimation(x, y, r) {
    const d = r / 100;
    const transparent = '#00000000';
    const white = '#ffffff';
    const arcBorder = new Arc(0, 0, r + d * 20, '#ffffff55');
    const arcBg = new Arc(0, 0, r + d * 8, '#000000');

    const arc0 = new Arc(0, 0, r + d * 0, transparent, white, 4);
    const arc1 = new Arc(0, d, r + d * 1, transparent, white, 4);
    const arc2 = new Arc(0, -d, r + d * 2, transparent, white, 4);
    const arc3 = new Arc(d, 0, r + d * 3, transparent, white, 4);
    const arc4 = new Arc(d, d, r + d * 4, transparent, white, 4);
    const arc5 = new Arc(d, -d, r + d * 5, transparent, white, 4);
    const arc6 = new Arc(-d, 0, r + d * 6, transparent, white, 4);
    const arc7 = new Arc(-d, d, r + d * 7, transparent, white, 4);
    const arc8 = new Arc(-d, -d, r + d * 8, transparent, white, 4);


    const degToRad = (deg) => deg * Math.PI / 180;

    const ellipseRx = r * 1.5;
    const ellipseRy = r / 4;
    const ellipseRotation = degToRad(150);
    const ellipseStart = degToRad(130);
    const ellipseEnd = degToRad(50);

    const ellBg = new Ellipse(0, 0, ellipseRx + d * 8, ellipseRy, ellipseRotation, transparent, '#ffffff55', 60, ellipseStart, ellipseEnd);
    const ell0 = new Ellipse(0, 0, ellipseRx + d * 0, ellipseRy + d * 0, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell1 = new Ellipse(0, d, ellipseRx + d * 1, ellipseRy + d * 1, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell2 = new Ellipse(0, -d, ellipseRx + d * 2, ellipseRy + d * 2, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell3 = new Ellipse(d, 0, ellipseRx + d * 3, ellipseRy + d * 3, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell4 = new Ellipse(d, d, ellipseRx + d * 4, ellipseRy + d * 4, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell5 = new Ellipse(d, -d, ellipseRx + d * 5, ellipseRy + d * 5, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell6 = new Ellipse(-d, 0, ellipseRx + d * 6, ellipseRy + d * 6, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell7 = new Ellipse(-d, d, ellipseRx + d * 7, ellipseRy + d * 7, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);
    const ell8 = new Ellipse(-d, -d, ellipseRx + d * 8, ellipseRy + d * 8, ellipseRotation, transparent, white, 4, ellipseStart, ellipseEnd);

    const shapes = [arcBorder, arcBg, arc8, arc7, arc6, arc5, arc4, arc3, arc2, arc1, arc0,
        ellBg, ell8, ell7, ell6, ell5, ell4, ell3, ell2, ell1, ell0];
    const layer = new Layer('', shapes);

    const totalFrames = 10;
    const maxRadius = r + 8 * d;
    const maxEllipseRadiusX = ellipseRx + 8 * d;
    const itemsToSkip = 2;

    const arcsToEdit = [arc8, arc7, arc6, arc5, arc4, arc3, arc2, arc1, arc0];
    const ellipsesToEdit = [ell8, ell7, ell6, ell5, ell4, ell3, ell2, ell1, ell0];
    const frames = [[() => {
        for (let i = 0; i < arcsToEdit.length; i++) {
            const shape = arcsToEdit[i];
            shape.radius += d;
            if (shape.radius > maxRadius) {
                shape.radius = r;
                shapes.splice(shapes.indexOf(shape), 1);
                shapes.splice(0, itemsToSkip);
                shapes.unshift(shape);
                // following items always must be in first position
                shapes.unshift(arcBg);
                shapes.unshift(arcBorder);
            }
        }
        // TODO UN FINISHED
        for (let i = 0; i < ellipsesToEdit.length; i++) {
            const shape = ellipsesToEdit[i];
            shape.radiusX += d;
            shape.radiusY += d;
            if (shape.radiusX > maxEllipseRadiusX) {
                shape.radiusX = ellipseRx;
                shape.radiusY = ellipseRy;
                shapes.splice(shapes.indexOf(shape), 1);
                shapes.splice(0, itemsToSkip);
                shapes.unshift(shape);
                // following items always must be in first position
                shapes.unshift(arcBg);
                shapes.unshift(arcBorder);
            }
        }
    }]];

    return new Animation({
        frames,
        layer,
        x,
        y,
        width: r * 2,
        height: r * 2,
        repeat: true,
        speed: 0.5
    })

}

export { getExplossionAnimation, getBlackHoleAnimation };