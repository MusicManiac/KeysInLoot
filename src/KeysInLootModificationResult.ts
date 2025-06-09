
export class KeysInLootModificationResult
{
    constructor(
        public adjustedWeights: number,
        public addedWeights: number
    ) 
    {}

    public add(other: KeysInLootModificationResult): void
    {
        this.adjustedWeights += other.adjustedWeights;
        this.addedWeights += other.addedWeights;
    }
}