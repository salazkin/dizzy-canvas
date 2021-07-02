export type Matrix = { a: number, b: number, c: number, d: number, tx: number, ty: number; };

export default class Transform {
    public x: number = 0;
    public y: number = 0;
    public scaleX: number = 1;
    public scaleY: number = 1;
    public skewX: number = 0;
    public skewY: number = 0;
    public rotation: number = 0;

    public matrix: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    public matrixUpdated: boolean = false;

    public equalScale: boolean = true;
    public noScale: boolean = true;
    public equalSkew: boolean = true;
    public noSkew: boolean = true;

    public updateInfo(): void {
        this.equalScale = (this.scaleX == this.scaleY);
        this.noScale = (this.scaleX == 1 && this.scaleY == 1);
        this.equalSkew = (this.skewX == this.skewY);
        this.noSkew = (this.skewX === 0 && this.skewY === 0);
        if (this.equalSkew) {
            this.rotation = this.skewX;
        }
    }

    public updateMatrix(): void {
        if (!this.matrixUpdated) {
            this.matrix.a = this.scaleX * Math.cos(this.skewY);
            this.matrix.b = this.scaleX * Math.sin(this.skewY);
            this.matrix.c = this.scaleY * Math.sin(-this.skewX);
            this.matrix.d = this.scaleY * Math.cos(this.skewX);
            this.matrix.tx = this.x;
            this.matrix.ty = this.y;
            this.matrixUpdated = true;
        }
    }

    public concat(local: Transform, global: Transform): void {
        if (global.noSkew && global.noScale) {
            this.x = local.x + global.x;
            this.y = local.y + global.y;
            this.scaleX = local.scaleX;
            this.scaleY = local.scaleY;
            this.skewX = local.skewX;
            this.skewY = local.skewY;
            this.matrixUpdated = false;

        } else if (global.equalScale && global.noSkew) {
            this.x = local.x * global.scaleX + global.x;
            this.y = local.y * global.scaleY + global.y;
            this.scaleX = local.scaleX * global.scaleX;
            this.scaleY = local.scaleY * global.scaleY;
            this.skewX = local.skewX;
            this.skewY = local.skewY;
            this.matrixUpdated = false;

        } else if (global.equalSkew && global.noScale) {
            const sin = Math.sin(global.skewX);
            const cos = Math.cos(global.skewY);
            const posX = local.x * cos - local.y * sin;
            const posY = local.x * sin + local.y * cos;
            this.x = posX * global.scaleX + global.x;
            this.y = posY * global.scaleY + global.y;
            this.skewX = local.skewX + global.skewX;
            this.skewY = local.skewY + global.skewY;
            this.scaleX = local.scaleX * global.scaleX;
            this.scaleY = local.scaleY * global.scaleY;
            this.matrixUpdated = false;
        } else {
            local.updateMatrix();
            global.updateMatrix();

            const m1 = local.matrix;
            const m2 = global.matrix;

            this.matrix.a = m1.a * m2.a + m1.b * m2.c;
            this.matrix.c = m1.c * m2.a + m1.d * m2.c;
            this.matrix.tx = m1.tx * m2.a + m1.ty * m2.c + m2.tx;
            this.matrix.b = m1.a * m2.b + m1.b * m2.d;
            this.matrix.d = m1.c * m2.b + m1.d * m2.d;
            this.matrix.ty = m1.tx * m2.b + m1.ty * m2.d + m2.ty;

            this.x = this.matrix.tx;
            this.y = this.matrix.ty;
            this.scaleX = Math.sqrt(this.matrix.a * this.matrix.a + this.matrix.b * this.matrix.b);
            this.scaleY = Math.sqrt(this.matrix.c * this.matrix.c + this.matrix.d * this.matrix.d);
            this.skewX = Math.atan2(-this.matrix.c, this.matrix.d);
            this.skewY = Math.atan2(this.matrix.b, this.matrix.a);
            this.matrixUpdated = true;
        }
        this.updateInfo();
    }

    public copy(target: Transform): void {
        this.x = target.x;
        this.y = target.y;
        this.scaleX = target.scaleX;
        this.scaleY = target.scaleY;
        this.skewX = target.skewX;
        this.skewY = target.skewY;
        this.rotation = target.rotation;
        this.matrixUpdated = false;
        this.updateInfo();
    }
}
