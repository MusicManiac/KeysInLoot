import { ILocation, ItemCountDistribution, IStaticLootDetails } from "@spt/models/eft/common/ILocation";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ContainerItemDistributionService } from "./ContainerItemDistributionService";
import { KeysInLootModificationResult } from "./KeysInLootModificationResult";

export class KeysInLootMapHandler
{

    constructor(
        private location: ILocation,
        private weightService: ContainerItemDistributionService
    ) 
    {}

    public tryHandleContainers(
        handler: KeysInLootMapHandler,
        itemsOfBase: ITemplateItem[],
        minimumRelativeProbability: number,
        overrideItemCountDistribution: boolean,
        itemCountDistribution: ItemCountDistribution[]): KeysInLootModificationResult
    {
        const keyResult = new KeysInLootModificationResult(0, 0);

        const jacketContainerId = "578f8778245977358849a9b5"; // Jacket container ID
        const jacketResult = handler.tryHandleContainer(jacketContainerId, itemsOfBase, minimumRelativeProbability, overrideItemCountDistribution, itemCountDistribution);
        keyResult.add(jacketResult);

        const duffleContainerId = "578f87a3245977356274f2cb"; // Duffle bag container ID
        const duffleResult = handler.tryHandleContainer(duffleContainerId, itemsOfBase, minimumRelativeProbability, overrideItemCountDistribution, itemCountDistribution);
        keyResult.add(duffleResult);

        const deadScavContainerId = "5909e4b686f7747f5b744fa4"; // Dead Scav container ID
        const deadScavResult = handler.tryHandleContainer(deadScavContainerId, itemsOfBase, minimumRelativeProbability, overrideItemCountDistribution, itemCountDistribution);
        keyResult.add(deadScavResult);

        return keyResult;
    }

    public tryHandleContainer(
        containerId: string,
        items: ITemplateItem[],
        minimumRelativeProbability: number,
        overrideItemCountDistribution: boolean,
        itemCountDistribution: ItemCountDistribution[]
    ): KeysInLootModificationResult
    {
        try
        {
            const container = this.tryFindContainerInLocation(containerId, this.location);
            if (container)
            {
                const result = this.weightService.ensureItemsMinimumRelativeProbabilityForContainer(container, items, minimumRelativeProbability);
                if (overrideItemCountDistribution)
                {
                    container.itemcountDistribution = itemCountDistribution;
                }
                return result;
            }
            else 
            {
                console.warn(`Container ${containerId} not found in location ${this.location.base.Name}`);
                return new KeysInLootModificationResult(0, 0);
            }
        }
        catch (error)
        {
            console.error(`Error processing container ${containerId} on map ${this.location.base.Name}`, error);
            return new KeysInLootModificationResult(0, 0);
        }
    }

    private tryFindContainerInLocation(containerTplId: string, location: ILocation): IStaticLootDetails | null
    {
        if (!location.staticLoot)
        {
            return null;
        }
        const container = location.staticLoot[containerTplId];
        if (!container)
            return null;

        return container;
    }
}
