import { Vehicle } from "./vehicle";

export class Horse extends Vehicle {

    static readonly MAX_HP = 300;

    constructor() {
        super(Horse.MAX_HP);
    }

}