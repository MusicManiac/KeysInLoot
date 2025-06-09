import { ItemCountDistribution } from "@spt/models/eft/common/ILocation";

export interface IKeysInLootConfig
{
    keyWeight: number;
    keycardWeight: number;
    keyTraderPricesMultiplier: number;
    keyFleaPricesMultiplier: number;
    overrideLootDistribution: boolean;
    overRideLootDistributionJackets: ItemCountDistribution[];
    overRideLootDistributionDuffleBags: ItemCountDistribution[];
    overRideLootDistributionDeadScavs: ItemCountDistribution[];
    cellsH: number;
    cellsV: number;
}
