export default class Timer {
    private requestAnimationFrameId: number = NaN;
    private onEnterFrame: (delta: number) => void;
    private oldTime: number;

    constructor(cb: (delta: number) => void) {
        this.onEnterFrame = cb;
        this.oldTime = Date.now();
        return this;
    }

    public start(): void {
        this.oldTime = Date.now();
        this.onRequestAnimationFrame();
    }

    public stop(): void {
        cancelAnimationFrame(this.requestAnimationFrameId);
    }

    private onRequestAnimationFrame(): void {
        const delta = Date.now() - this.oldTime;
        this.requestAnimationFrameId = requestAnimationFrame(this.onRequestAnimationFrame.bind(this));
        this.oldTime += delta;
        this.onEnterFrame(delta);
    }
}
