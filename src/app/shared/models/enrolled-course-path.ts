import { Pricing } from "./Pricing";

export class EnrolledCoursePath{
id : string;
nameAr : string;
nameEn : string;
thumbnail : string;
categoryNameAr : string;
categoryNameEn : string;
courseCount : number;
statistics : {
   rating :number;
   numberOfRatings :number;
   viewsNumber :number;
   enrollmentsNumber:number;
   }
price : number;
isUserProfileEnrolled :boolean;
completedCourses : number;
certificateUrl : string;
isFree :boolean;
publishedDate : string;
status : number;
publishStatus :string// ['None', 'Published', 'Unpublished']
}
