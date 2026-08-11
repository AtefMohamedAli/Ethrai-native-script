export class ProductBriefDetail {
    
        public id: string;
        public nameAr: string;
        public nameEn: string;
        public categoryId: string;
        public categoryIds: string[];
        public categoryNameEn: string;
        public categoryNameAr: string;
        public imageUrl: string;
        public price: number;
        public discountPrice: number;
        public discount: number;
        public amountWithVat: number;
        public rating: number;
        public isFavorite: boolean;
        public publishDate: Date;
        public competenciesIds: string[];
        public courseLevel: string;
        public type: string;
        public isPublished: boolean;
        public numberOfSeconds:number;
}