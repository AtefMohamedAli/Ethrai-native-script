import { Component, OnInit } from '@angular/core';
import { isAndroid, SearchBar } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
import { Frame } from '@nativescript/core';
import { MyProductsService } from '../my-products.service';
import { ProductBriefDetail } from '../../shared/models/product-brief-detail';
import { ProductsDetail } from '../../shared/models/products-detail';
import { GlobalService } from '../../shared/services/global.service';
import { Subcategory } from '../../shared/models/enums/subcategory';
import { WebinarBriefDetail } from '../../shared/models/webinar-brief-detail';
import { isIOS } from "@nativescript/core";
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
declare var UISearchBarStyle: any;
declare var UIImage: any;
@Component({
	moduleId: module.id,
	selector: 'favorites',
	templateUrl: './favorites.component.html',
	styleUrls: ['./favorites.component.css']
})

export class FavoritesComponent implements OnInit {

	searchPhrase: string;
    isLoading: boolean;
    categories: any;
    isLoggedIn: boolean;
    subCategories: { id: number; nameAr: string; nameEn: string; }[];
    favourites: ProductsDetail=new ProductsDetail();
    tempFavorites: ProductsDetail=new ProductsDetail();
    selectedSubCategoryId: number;
    keyword: string;
    showWebinar: boolean;
    showPath: boolean;
    showCourse: boolean;
    showKes: boolean;
    isEthrai: any;
    isEmpty: boolean;
    favLength: number;
    dialogOpen=false
	constructor(private page: Page,private router:RouterExtensions,private myProductsService:MyProductsService,
        private globalService:GlobalService,private firebaseEventService:FirebaseEventService) { 
		//page.actionBarHidden = true;
	 }
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() {
        this.isLoggedIn=this.globalService.isLoggedIn;
        
        this.selectedSubCategoryId=Subcategory.ALL;
        if(this.isLoggedIn){
            this.getFavouriteProducts();
            this.getAllCategories();
            // this.getSubCategories();
            this.isEthrai=this.globalService.isEthrai
            if(this.isEthrai){
                this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'favorites',this.globalService.getUserProfile());
            }
        }else{
            this.firebaseEventService.logScreenViewedEvent(this.isLoggedIn,null,'favorites',null);
            
        }
     }

     loadedSB(args) { 
        setTimeout(() => {
            if(isAndroid){
                args.object.android.clearFocus();
            }
        }, 200)
        
    }
    getFilteredCourses(keyword){
      return  this.favourites.courses=this.tempFavorites?.courses.filter(product=>{
            if(product.nameAr.toLowerCase().includes(keyword) ||product.nameEn.toLowerCase().includes(keyword)){
                return product;
            }
        });
    }
    getFilteredPaths(keyword){
      return  this.favourites.coursesPath=this.tempFavorites?.coursesPath.filter(product=>{
            if(product.nameAr.toLowerCase().includes(this.keyword) ||product.nameEn.toLowerCase().includes(this.keyword)){
                return product;
            }
        });
    }

    getFilteredWebinars(keyword){
       return this.favourites.webinars=this.tempFavorites?.webinars.filter(product=>{
            if(product.nameAr.toLowerCase().includes(this.keyword) ||product.nameEn.toLowerCase().includes(this.keyword)){
                return product;
            }
        });
    }
    getFilteredKnowledgeEnrichments(keyword){
        return this.favourites.kes=this.tempFavorites?.kes.filter(product=>{
            if(product.nameAr.toLowerCase().includes(this.keyword) ||product.nameEn.toLowerCase().includes(this.keyword)){
                return product;
            }
        });
    }
	onSubmit(args) {
        const searchBar = args.object as SearchBar;
        if(this.globalService.isEthrai){
            this.firebaseEventService.logInternalSearchEvent('favorites',searchBar.text)
        }
        this.keyword=searchBar.text.toLowerCase();
        this.selectedSubCategoryId=Subcategory.ALL;
        this.getFilteredCourses(this.keyword);
        this.getFilteredPaths(this.keyword);
        this.getFilteredWebinars(this.keyword);
        this.getFilteredKnowledgeEnrichments(this.keyword)
    }

    onTextChanged(e) {
        if(e.value){
            this.dialogOpen=true
        }else{
            this.onClear()
        }
    }

    onClear() {
        this.dialogOpen=false
        this.searchPhrase=""
        this.selectedSubCategoryId=Subcategory.ALL;
        this.favourites.courses=this.tempFavorites.courses;
        this.favourites.coursesPath=this.tempFavorites.coursesPath;
        this.favourites.webinars=this.tempFavorites.webinars;
        this.favourites.kes=this.tempFavorites.kes;

    }

    public searchBarLoaded(args) {
        let searchBar = <SearchBar>args.object
        if (isIOS) {
          var nativeSearchBar = searchBar.nativeView;
          nativeSearchBar.searchBarStyle = UISearchBarStyle.Prominent;
          nativeSearchBar.backgroundImage = UIImage.new();
        }
      }
    getFavouriteProducts(){
        this.isLoading=true;
        let limit=1000;
        this.myProductsService.getFavoriteProducts(limit).subscribe(
            response=>{
                this.isLoading=false;
                 this.favourites=response as ProductsDetail;
                 this.getSubCategories()
                //  this.favourites.webinars=(response as ProductsDetail).webinars.filter(item=>item.isPublished);
                //  this.favourites.courses=(response as ProductsDetail).courses.filter(item=>item.isPublished);
                //  this.favourites.coursesPath=(response as ProductsDetail).coursesPath.filter(item=>item.isPublished);
                //  this.favourites.kes=(response as ProductsDetail).kes.filter(item=>item.isPublished);
                 this.favLength=this.favourites.webinars.length+this.favourites.courses.length+
                this.favourites.coursesPath.length+this.favourites.kes.length;

                this.favLength?this.isEmpty=false:this.isEmpty=true;
                if(!this.isEmpty){
                    this.showCourse=true;
                    this.showKes=true;
                    this.showPath=true;
                    this.showWebinar=true
                }
                 this.tempFavorites=new ProductsDetail();
                 this.tempFavorites.webinars=this.favourites.webinars;
                 this.tempFavorites.courses=this.favourites.courses;
                 this.tempFavorites.coursesPath=this.favourites.coursesPath;
                 this.tempFavorites.kes=this.favourites.kes;

            },
            err=>{
                console.log(err)
            }
        )
    }

    getAllCategories(){
		this.categories=this.globalService.getCategories();
	 }

     getSubCategories(){
        if(this.globalService.isEthrai){
            if(this.favourites.coursesPath?.length>0){
                this.subCategories=this.globalService.getSubCategories();
            }else{
                this.subCategories=this.globalService.getSubCategories().filter(category=>category.id!=Subcategory.COURSE_PATHS)
            }
         }else{
            this.subCategories=this.globalService.getSubCategories().filter(category=>category.isEthraiOnly==false)
         }
	 }

     getFavProducts(id:number){
         this.selectedSubCategoryId=id;
         if(id == Subcategory.ALL){
            this.favourites.webinars=this.keyword ? this.getFilteredWebinars(this.keyword):this.tempFavorites.webinars;
            this.favourites.courses=this.keyword ? this.getFilteredCourses(this.keyword):this.tempFavorites.courses;
            this.favourites.coursesPath=this.keyword ? this.getFilteredPaths(this.keyword):this.tempFavorites.coursesPath
            this.showCourse=true;
            this.showPath=true;
            this.showWebinar=true;
            this.showKes=true;
         }else if(id == Subcategory.COURSE_PATHS){
             this.favourites.webinars=[];
             this.favourites.courses=[];
             this.favourites.kes=[];
             this.favourites.coursesPath=this.keyword ? this.getFilteredPaths(this.keyword):this.tempFavorites.coursesPath
            this.showWebinar=false;
            this.showCourse=false;
            this.showKes=false;
            this.showPath=true;
         }else if(id == Subcategory.WEBINARS){
            this.favourites.coursesPath=[];
            this.favourites.courses=[];
            this.favourites.kes=[];
            this.favourites.webinars=this.keyword ? this.getFilteredWebinars(this.keyword):this.tempFavorites.webinars;
            this.showPath=false;
            this.showCourse=false;
            this.showKes=false;
            this.showWebinar=true
        }else if(id == Subcategory.TRAINING_PROGRAMS){
            this.favourites.webinars=[];
            this.favourites.coursesPath=[];
            this.favourites.kes=[];
            this.favourites.courses=this.keyword ? this.getFilteredCourses(this.keyword):this.tempFavorites.courses
            this.showWebinar=false;
            this.showPath=false;
            this.showKes=false;
            this.showCourse=true;
        }else if(id == Subcategory.ENRICHING_ILLUMINATION){
            this.favourites.webinars=[];
            this.favourites.coursesPath=[];
            this.favourites.kes=this.keyword ? this.getFilteredKnowledgeEnrichments(this.keyword):this.tempFavorites.kes;
            this.favourites.courses=[]
            this.showWebinar=false;
            this.showPath=false;
            this.showKes=true;
            this.showCourse=false;
        }
        else{
            this.favourites.webinars=[];
            this.favourites.coursesPath=[];
            this.favourites.courses=[];
            this.favourites.kes=[];
        }
     }
     delete(type,id){
        if(type=='Ke'){
            this.favourites?.kes?.find((ke,index)=>{if(ke?.id==id)
                {this.favourites.kes.splice(index,1);
                --this.favLength;
            }})
            this.favLength?this.isEmpty=false:this.isEmpty=true;

        }else if(type=='Webinar'){
            this.favourites?.webinars?.find((ke,index)=>{if(ke?.id==id){this.favourites.webinars.splice(index,1); --this.favLength;}})
            this.favLength?this.isEmpty=false:this.isEmpty=true;
        }
        else if(type=='path'){
            this.favourites?.coursesPath?.find((ke,index)=>{if(ke?.id==id){this.favourites.coursesPath.splice(index,1)}})
            --this.favLength;
            this.favLength?this.isEmpty=false:this.isEmpty=true;
        }else if(type=='course'){
            this.favourites?.courses?.find((ke,index)=>{if(ke?.id==id){this.favourites.courses.splice(index,1)}})
            --this.favLength;
            this.favLength?this.isEmpty=false:this.isEmpty=true;
        }
        console.log("this.favLength",this.favLength)

     }
}