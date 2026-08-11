import { ProductBriefDetail } from "./product-brief-detail";

export class ProductsSearchOptions {

        keyword :string;
        categoryId :string;
        pricingType :string ;//'All', 'Paid', 'Free'
        pricingSortingType :string //'None', 'Asc', 'Desc'
        pageSize: number;
        pageIndex :number;
        levels: string[];
        minRating: number;
        minHours: number;
        maxHours: number;
        webinarWatchTypes :string[]
        publishDateSortingType:string
}