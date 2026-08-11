import { Component, OnInit } from '@angular/core';
import { SearchBar } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
import { Frame } from '@nativescript/core';
import { GlobalService } from '../../shared/services/global.service';

@Component({
	moduleId: module.id,
	selector: 'downloaded',
	templateUrl: './downloaded.component.html',
	styleUrls: ['./downloaded.component.css']
})

export class DownloadedComponent implements OnInit {

	searchPhrase: string;
    categories: any;

	constructor(private page: Page,private router:RouterExtensions,private globalService:GlobalService) { 
		//page.actionBarHidden = true;

	 }
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() {
        this.getAllCategories();
     }
	loadedSB(args) { 
        setTimeout(() => {
            args.object.dismissSoftInput();
        }, 200)
        
    }
	onSubmit(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Searching for ${searchBar.text}`);
        this.router.navigate(['search-result'],{state:{keyword:searchBar.text}});
    }

    onTextChanged(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Input changed! New value: ${searchBar.text}`);
    }

    onClear(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Clear event raised`);
    }
    getAllCategories(){
		this.categories=this.globalService.getCategories();
	 }
}