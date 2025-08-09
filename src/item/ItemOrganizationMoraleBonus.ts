/**
 * Organizations with this item will get a morale bonus
 */
export interface ItemOrganizationMoraleBonus {

    /**
     * Returns morale bonus. Number is the additional amount of units
     * that need to be slain before routing. In terms of %.
     */
    getOrganizationMoraleBonus(): number;

}