import { Pricing } from "./Pricing";

export class CourseDetails{
   id:string;
   nameEn :string;
   nameAr :string;
   imageUrl :string ;
   enrollmentsNumber :number ;
   traineesWatched :number ;
   price :Pricing =new Pricing();
   numberOfRating :number ;
   rating :number;
}
