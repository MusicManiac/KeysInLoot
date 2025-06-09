import { IStaticLootDetails } from "@spt/models/eft/common/ILocation";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { KeysInLootModificationResult } from "./KeysInLootModificationResult";

export class ContainerItemDistributionService
{

    public ensureItemsMinimumRelativeProbabilityForContainer(
        container: IStaticLootDetails,
        keys: ITemplateItem[],
        weight: number
    ): KeysInLootModificationResult
    {
        const modification = new KeysInLootModificationResult(0, 0);
        if (!container)
        {
            return modification;
        }

        for (const key of keys)
        {
            const result = this.ensureItemMinimumRelativeProbabilityForContainer(container, key._id, weight);
            modification.add(result);
        }

        return modification;
    }

    private ensureItemMinimumRelativeProbabilityForContainer(container: IStaticLootDetails, keyTplId: string, configWeight: number): KeysInLootModificationResult
    {
        const result = new KeysInLootModificationResult(0, 0);
        const foundKeyJacket = container.itemDistribution.find(item => item.tpl === keyTplId);
        if (foundKeyJacket)
        {
            if (foundKeyJacket.relativeProbability < configWeight)
            {
                foundKeyJacket.relativeProbability = configWeight;
                result.adjustedWeights++;
            }
        }
        else
        {
            container.itemDistribution.push({
                tpl: keyTplId,
                relativeProbability: configWeight
            });
            result.addedWeights++;
        }
        return result;
    }
}
