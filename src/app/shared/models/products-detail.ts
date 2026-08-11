import { ProductBriefDetail } from "./product-brief-detail"
import { WebinarBriefDetail } from "./webinar-brief-detail";

export class ProductsDetail  {
    
        courses :ProductBriefDetail[];
        webinars :WebinarBriefDetail[];
        kes :ProductBriefDetail[];
        coursesPath :ProductBriefDetail[];
        coursePaths:ProductBriefDetail[];
        totalCoursePaths:number;
        totalCourses:number;
        totalKes:number;
        totalWebinars:number;
      
}