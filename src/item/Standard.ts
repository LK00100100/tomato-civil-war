import { ItemOrganizationMoraleBonus } from "./ItemOrganizationMoraleBonus";
import { Pike } from "./Pike";

/**
 * Standards are pikes with a flag.
 * They provide a passive morale boost to only the organization they are in.
 */
export class Standard extends Pike implements ItemOrganizationMoraleBonus{
    private static readonly BASE_ITEM_NAME = "item-melee-standard";

    private fullItemName = Standard.BASE_ITEM_NAME;

    //TODO: use enum later
    /**
     * 
     * @param flagName flag to draw
     */
    constructor(flagName: string){
        super();
        this.fullItemName = `${Standard.BASE_ITEM_NAME}-${flagName}`
    }
    
    public override getItemName(): string {
        return this.fullItemName;
    }

    getOrganizationMoraleBonus(): number {
        return 10;
    }

}