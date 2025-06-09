
export class KeysInLootModificationResult
{
    constructor(adjustedWeights: number, addedKeys: number)
    {
        this.adjustedWeights = adjustedWeights;
        this.addedWeights = addedKeys;
    }
    public adjustedWeights: number;
    public addedWeights: number;

    public add(other: KeysInLootModificationResult): void
    {
        this.adjustedWeights = this.adjustedWeights + other.adjustedWeights;
        this.addedWeights = this.addedWeights + other.addedWeights;
    }
}
