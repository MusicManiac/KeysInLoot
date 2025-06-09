import { IHandbookBase } from "@spt/models/eft/common/tables/IHandbookBase";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";

export class ItemPriceService
{
    private _handbook: IHandbookBase;
    private _fleaPrices: Record<string, number>;

    constructor(tables: IDatabaseTables)
    {
        this._handbook = tables.templates.handbook;
        this._fleaPrices = tables.templates.prices;
    }

    public adjustFleaMarketPrice(itemTemplate: ITemplateItem, multiplier: number)
    {
        const fleaItem = this._fleaPrices[itemTemplate._id];
        if (fleaItem)
        {
            this._fleaPrices[itemTemplate._id] = Math.round(fleaItem * multiplier);
        }
    }

    public adjustTraderPrice(itemTemplate: ITemplateItem, multiplier: number)
    {
        const itemToModify = this._handbook.Items.find(item => item.Id === itemTemplate._id);
        if (itemToModify)
        {
            itemToModify.Price = Math.round(itemToModify.Price * multiplier);
        }
    }
}
