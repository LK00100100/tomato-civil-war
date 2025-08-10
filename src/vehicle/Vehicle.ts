export abstract class Vehicle {

    /**
     * hit points
     */
    protected hp: number;

    constructor(hp: number) {
        this.hp = hp;
    }

    public decrementHp(hp: number) {
        this.hp -= hp;
    }

    public isDead(): boolean {
        return this.hp <= 0;
    }

}