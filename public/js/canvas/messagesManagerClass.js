import { Text } from './canvasClasses.js';
const apiHost = (window.location.host.substring(0, window.location.host.indexOf(':')) || window.location.host) + ':3000';
const contantsUrl = apiHost + '/constants.js';
import { KILLWORDS } from '/js/utils/constants.js';

// How long a message takes to fade once expired. 100 frames at the game's
// 30 Hz update rate, which is what the old per-frame fade worked out to.
const MESSAGE_FADE_MS = (1000 / 30) * 100;
// Only the first six are ever drawn, and the list is pruned in draw() - which
// does not run while the tab is hidden, so without a cap a fleet's worth of
// kills during a long absence would queue up unbounded.
const MAX_MESSAGES = 50;

export default class MessagesManager {
    constructor(game) {
        this.game = game;
        this.player = game.player;
        this.canvas = game.canvas;
        this.context = game.context;
        this.messages = [];
        this.fontSize = game.fontSize;
        this.fontFamily = 'Arcade';
        this.lineHeight = game.lineHeight;
        this.y = parseInt(game.canvas.height - game.lineHeight * 6);
    }

    add(msg) {
        this.messages.push({
            text: msg,
            exp: Date.now() + 3000,
            opacity: 1
        });
        if (this.messages.length > MAX_MESSAGES) {
            this.messages.splice(0, this.messages.length - MAX_MESSAGES);
        }
    }

    addKillMessage(name1, name2) {
        if (name1 && name2) {
            const killword = KILLWORDS[parseInt(Math.random() * KILLWORDS.length)];
            this.add(`☠ ${name1} HAS ${killword} ${name2}`)
        } else if (name2) {
            this.add(`☠ ${name2} HAS BEEN DESTROYED`);
        }
    }

    getColor(alpha) {
        return `rgba(19, 255, 3, ${alpha})`;
    }

    draw() {
        const x = this.player.x - this.canvas.width / 2 + this.player.width / 2 + this.lineHeight;
        const y = this.player.y - this.canvas.height / 2 + this.player.height / 2 + this.y;
        const text = new Text('', x, y, this.fontSize, this.fontFamily);
        const now = Date.now();
        this.messages = this.messages.filter((msg, i) => {
            // Timed, not counted down per draw: draw() only runs while the
            // tab is visible, so a fade of "0.01 per frame" made every
            // message that expired while the tab was in the background
            // survive to be shown, all at once, on coming back. Now they are
            // simply over by the time anyone looks.
            msg.opacity = now > msg.exp
                ? Math.max(0, 1 - (now - msg.exp) / MESSAGE_FADE_MS)
                : 1;
            if (msg.opacity > 0 && i < 6) {
                text.color = this.getColor(msg.opacity);
                text.text = msg.text;
                text.y = y + this.lineHeight * i;
                text.draw(this.context);
            }
            return msg.opacity > 0;
        });
    }
}