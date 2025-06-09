import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from  "@spt/models/enums/BaseClasses";

import { FileSystem } from "@spt/utils/FileSystem";
import { JsonUtil } from "@spt/utils/JsonUtil";
import path from "path";
import { ItemPriceService } from "./ItemPriceService";
import { ContainerItemDistributionService } from "./ContainerItemDistributionService";
import { KeysInLootModificationResult } from "./KeysInLootModificationResult";
import { IKeysInLootConfig } from "./IKeysInLootConfig";
import { KeysInLootMapHandler } from "./KeysInLootMapHandler";

class KeysInLoot implements IPostDBLoadMod
{
    private logger: ILogger;
    public mod: string;
    public modShortName: string;

    constructor() 
    {
        this.mod = "MusicManiac-KeysInLoot";
        this.modShortName = "KeysInLoot";
    }

    public async postDBLoad(container: DependencyContainer): Promise<void>
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        const logger = this.logger;
        logger.info(`[${this.modShortName}] ${this.mod} started loading`);

        // Resolve dependencies
        const itemHelper = container.resolve<ItemHelper>("ItemHelper");
        const db = container.resolve<DatabaseServer>("DatabaseServer");
        const fs = container.resolve<FileSystem>("FileSystem");
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");

        // Load data
        const config = await this.getConfig(fs, jsonUtil);
        const tables = db.getTables();
        const items = itemHelper.getItems();
        const maps = [
            tables.locations.bigmap, 
            tables.locations.factory4_day,
            tables.locations.factory4_night,
            tables.locations.interchange,
            tables.locations.laboratory, 
            tables.locations.lighthouse,
            tables.locations.rezervbase,
            tables.locations.sandbox,
            tables.locations.sandbox_high,
            tables.locations.shoreline,
            tables.locations.tarkovstreets,
            tables.locations.woods
        ];

        const weightService = new ContainerItemDistributionService();
        const itemPriceService = new ItemPriceService(tables);
        const result = new KeysInLootModificationResult(0, 0);
        // Modify Keys
        const keysMinimumRelativeProbability = config.keyWeight;
        const enabledForKeys = keysMinimumRelativeProbability !== 0;
        if (enabledForKeys)
        {
            const keys = items.filter(item => itemHelper.isOfBaseclass(item._id, BaseClasses.KEY_MECHANICAL));
            keys.forEach(key => itemPriceService.adjustFleaMarketPrice(key, config.keyFleaPricesMultiplier));
            keys.forEach(key => itemPriceService.adjustTraderPrice(key, config.keyTraderPricesMultiplier));

            for (const map of maps) 
            {
                const handler = new KeysInLootMapHandler(map, weightService);
                const mapResult = handler.tryHandleContainers(handler, keys, keysMinimumRelativeProbability, config.overrideLootDistribution, config.overRideLootDistributionJackets);
                result.add(mapResult);
            }
        }

        // Modify Keycards
        const keyCardsMinimumRelativeProbability = config.keycardWeight;
        const enabledForKeyCards = config.keycardWeight !== 0;
        if (enabledForKeyCards)
        {
            const keyCards = items.filter(item => itemHelper.isOfBaseclass(item._id, BaseClasses.KEYCARD));
            keyCards.forEach(keyCard => itemPriceService.adjustFleaMarketPrice(keyCard, config.keyFleaPricesMultiplier));
            keyCards.forEach(keyCard => itemPriceService.adjustTraderPrice(keyCard, config.keyTraderPricesMultiplier));

            for (const map of maps) 
            {
                const handler = new KeysInLootMapHandler(map, weightService);
                const mapResult = handler.tryHandleContainers(handler, keyCards, keyCardsMinimumRelativeProbability, config.overrideLootDistribution, config.overRideLootDistributionJackets);
                result.add(mapResult);
            }
        }

        logger.info(`[${this.modShortName}] ${result.adjustedWeights} keys weights were adjusted`);
        logger.info(`[${this.modShortName}] different keys were added ${result.addedWeights} times to jacket/duffle/dead scav loot`);

        const itemDB = tables.templates.items;
        itemDB["578f8778245977358849a9b5"]._props.Grids[0]._props.cellsH = config.cellsH;
        itemDB["578f8778245977358849a9b5"]._props.Grids[0]._props.cellsV = config.cellsV;


        logger.success(`[${this.modShortName}] ${this.mod} finished loading`);
    }

    private async getConfig(fs:FileSystem, jsonUtil: JsonUtil) : Promise<IKeysInLootConfig>
    {
        const configPath = path.resolve(__dirname, "../config.jsonc");
        const configFileContent = await fs.read(configPath);
        const configString = configFileContent.toString();
        const config = jsonUtil.deserializeJsonC<IKeysInLootConfig>(configString);
        return config;
    }
}

module.exports = { mod: new KeysInLoot() }