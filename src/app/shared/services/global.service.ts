import { Injectable } from '@angular/core';
import { ApplicationSettings, isAndroid, Utils } from '@nativescript/core'
import { UserProfile } from '../models/user-profile'
import { Category } from '../models/category'
import { SearchFilter } from '../models/search-filter';
import { environment } from '../../../../environments/environment';
import * as application from '@nativescript/core/application';
import { Toast } from '../utils/toast';
import { localize } from '@nativescript/localize';
// import { InAppBrowser } from 'nativescript-inappbrowser';
import { UserStats } from '../models/user-stats'

@Injectable({
    providedIn: 'root',
})
export class GlobalService {

    private token;
    private refreshToken: string;
    private userProfile: UserProfile = new UserProfile();
    public saudiNationalityID = '0d3b0e49-1db0-e711-80bd-0050568c6f75'
    private currentTenant: any;
    private categories: Category[];
    public isLoggedIn = false;
    public isEthrai = true;
    public currentTenantId;
    userTenants: any;
    userType: any;
    searchFilter: SearchFilter;
    keyWord: string;
    productsFilter: SearchFilter;
    previousURL: string;
    purchasesFilter: any;
    editPrefrences: boolean = false
    durationIds: string[];
    searchedProducts: any;
    public shoppinCartItemsCount: number;
    public unreadNotificationsCount: number = 0;
    stats: UserStats;
    courseListFilter: SearchFilter;
    categoryParams: any;
    certsFilter: any;
    kesFilter: SearchFilter;
    webinarsFilter: any;
    // Intl removed - not available on iOS

    setUserProfile(profile: UserProfile) {
        this.userProfile = profile;
    }

    getUserProfile() {
        return this.userProfile;
    }

    getUserInterestsIDs() {
        return this.getUserProfile().interestsIds;
    }
    getUserFullNameAr() {
        return this.userProfile.firstNameAr + ' ' + this.userProfile.fatherNameAr
    }
    getUserFirstNameAr() {
        return this.userProfile.firstNameAr
    }
    setToken(token: string) {
        this.token = token;
        ApplicationSettings.setString("token", token)
    }

    getToken() {
        if (ApplicationSettings.hasKey('token')) {
            this.token = ApplicationSettings.getString("token")
        }
        return this.token;
    }
    setIsKeepLogged(flag) {
        ApplicationSettings.setBoolean("keepLogged", flag)
    }

    getIsKeepLogged() {
        // if(ApplicationSettings.hasKey('keepLogged')){
        //    let flag=ApplicationSettings.getBoolean("keepLogged",false)
        // }
        return ApplicationSettings.getBoolean("keepLogged", false);
    }
    setEthraiTenant(flag) {
        ApplicationSettings.setBoolean("isEthrai", flag)
    }

    getEthraiTenant() {
        // if(ApplicationSettings.hasKey('isEthrai')){
        //    let flag=ApplicationSettings.getBoolean("isEthrai",true)
        // }
        return ApplicationSettings.getBoolean("isEthrai", true);
    }
    setTenantDomain(domain) {
        ApplicationSettings.setString("domain", domain)

    }
    getTenantDomain() {
        return ApplicationSettings.getString("domain", null)
    }
    setRefreshToken(token: string) {
        this.refreshToken = token;
        ApplicationSettings.setString("refreshToken", token)
    }

    getRefreshToken() {
        if (ApplicationSettings.hasKey('refreshToken')) {
            this.token = ApplicationSettings.getString("refreshToken")
        }
        return this.refreshToken;
    }
    setTokenStartDate() {
        let dateInSeconds: number = new Date().getTime() / 1000;
        ApplicationSettings.setNumber("tokenStartDate", dateInSeconds);
    }
    getTokenStartDate() {
        return ApplicationSettings.hasKey('tokenStartDate') ? ApplicationSettings.getNumber("tokenStartDate") : 0;
    }
    setTokenExpiryDuration(duration: number) {
        ApplicationSettings.setNumber("tokenExpiryDuration", duration);
    }

    getTokenExpiryDuration() {
        return ApplicationSettings.hasKey('tokenExpiryDuration') ? ApplicationSettings.getNumber("tokenExpiryDuration") : 0;
    }
    isSaudi() {
        return this.userProfile.type.includes("Saudi");
    }
    setCurrentTenant(tenant) {
        this.currentTenant = tenant;
    }
    getCurrentTenant() {
        return this.currentTenant;
    }
    setCategories(categories) {
        this.categories = categories;
    }

    getCategories() {
        return this.categories;
    }

    getSubCategories() {
        let subCategories = [
            { id: 1, nameAr: "الكل", nameEn: "All", isEthraiOnly: false },
            { id: 2, nameAr: "البرامج التدريبية", nameEn: "Training Programs", isEthraiOnly: false },
            { id: 3, nameAr: "المؤتمرات الإلكترونية", nameEn: "Online Classes", isEthraiOnly: true },
            { id: 4, nameAr: "الإضاءات الإثرائية", nameEn: "Enriching Illuminations", isEthraiOnly: true },
            { id: 5, nameAr: "المسارات التدريبية", nameEn: "Training Paths", isEthraiOnly: false },
            // {id:6,nameAr:"Broadcast",nameEn:"Broadcast"},
            // {id:7,nameAr:"Online Event",nameEn:"Online Event"},

        ]
        return subCategories;
    }
    setTenants(tenants) {
        ApplicationSettings.setString("tenants", tenants);
    }
    getTenants() {
        return ApplicationSettings.getString("tenants", null);
    }
    setUserTenants(tenants) {
        this.userTenants = tenants;
    }

    getUserTenants() {
        return this.userTenants;
    }

    setUserType(type) {
        this.userType = type
    }
    getUserType() {
        return this.userType
    }

    setSearchFilter(searchFilter: SearchFilter) {
        this.searchFilter = searchFilter;
    }
    getSearchFilter() {
        return this.searchFilter;
    }

    setMyProductsFilter(searchFilter: SearchFilter) {
        this.productsFilter = searchFilter;
    }
    getMyProductsFilter() {
        return this.productsFilter;
    }

    setVideoQuality(quality) {
        ApplicationSettings.setString("quality", quality);
    }
    getVideoQuality() {
        return ApplicationSettings.getString('quality');
    }

    setAutoPlayNextVideo(isAuto) {
        ApplicationSettings.setBoolean("autoPlay", isAuto);
    }
    isAutoPlayNextVideo() {
        return ApplicationSettings.getBoolean('autoPlay', false);
    }

    setPurchasesFilter(searchFilter) {
        this.purchasesFilter = searchFilter;
    }
    getPurchasesFilter() {
        return this.purchasesFilter;
    }
    setSelectedDurations(durationsId: string[]) {
        this.durationIds = durationsId
    }
    getSelectedDurations() {
        return this.durationIds;
    }
    getUserCurrentEmail() {
        let ethraiId = environment.ETHRAI_GUID;
        let email;
        if (this.isEthrai) {
            email = this.userProfile?.tenants?.find(tenant => tenant.tenantId == ethraiId)?.email
        } else {
            email = this.userProfile?.tenants?.find(tenant => tenant.tenantId == this.currentTenantId)?.email
        }
        // Fallback: if no specific tenant match, return first available tenant email
        if (!email && this.userProfile?.tenants?.length > 0) {
            email = this.userProfile.tenants[0].email;
        }
        return email;
    }
    setSearchedResult(products) {
        this.searchedProducts = products;
    }
    getSearchedResult() {
        return this.searchedProducts
    }
    setSearchedKeyword(products) {
        this.keyWord = products;
    }
    getSearchedKeyword() {
        return this.keyWord
    }
    toast(msg: string) {
        Toast.show(msg);
    }

    setInAppFailedRequests(request) {
        let newRequests: any[] = []
        let requests = this.getInAppFailedRequests();
        if (requests) {
            newRequests = JSON.parse(requests);
        }
        if (!newRequests.some(req => req == request)) {
            ApplicationSettings.setString("requests", JSON.stringify(newRequests))
        }
    }

    getInAppFailedRequests() {
        return ApplicationSettings.getString("requests")
    }

    editInAppFailedRequests(payload) {
        let requests = this.getInAppFailedRequests();
        let allRequests: any[] = []

        if (requests) {
            allRequests = JSON.parse(requests);
            let reqToDeleteIndex = allRequests.findIndex((req) => req == payload)
            if (reqToDeleteIndex !== -1) {
                allRequests.splice(reqToDeleteIndex, 1)
                ApplicationSettings.setString("requests", JSON.stringify(allRequests))
            }
        }
    }
    async openLink(url) {
        
            Utils.openUrl(url);
        
    }

    setUserStats(stats) {
        this.stats = stats
    }
    getUserStats() {
        return this.stats
    }
    setLoginCredintials(credintials) {
        ApplicationSettings.setString("credintials", credintials);

    }
    getLoginCredintials() {
        return ApplicationSettings.getString("credintials");
    }
    clearLoginCredintials() {
        ApplicationSettings.remove("credintials");
    }
    addDeletedAccount(email: string) {
        let deleted = this.getDeletedAccounts();
        if (!deleted.includes(email.toLowerCase())) {
            deleted.push(email.toLowerCase());
            ApplicationSettings.setString("deletedAccounts", JSON.stringify(deleted));
        }
    }
    isAccountDeleted(email: string): boolean {
        return this.getDeletedAccounts().includes(email.toLowerCase());
    }
    getDeletedAccounts(): string[] {
        let raw = ApplicationSettings.getString("deletedAccounts", "[]");
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }
    setSearchedKeyWord(keyWord) {
        this.keyWord = keyWord
    }
    getSearchedKeyWord() {
        return this.keyWord
    }
    setCourseListFilter(searchFilter: SearchFilter) {
        this.courseListFilter = searchFilter;
    }
    getCourseListFilter() {
        return this.courseListFilter;
    }
    setCategoryParams(params) {
        this.categoryParams = params;
    }
    getCategoryParams() {
        return this.categoryParams;
    }
    setCertsFilter(searchFilter: SearchFilter) {
        this.certsFilter = searchFilter;
    }
    getCertsFilter() {
        return this.certsFilter;
    }
    setKesFilter(searchFilter: SearchFilter) {
        this.kesFilter = searchFilter;
    }
    getKesFilter() {
        return this.kesFilter;
    }
    setWebinarsFilter(searchFilter: SearchFilter) {
        this.webinarsFilter = searchFilter;
    }
    getWebinarsFilter() {
        return this.webinarsFilter;
    }
    getRatingsFilter() {
        // Using simple string formatting instead of Intl (not available on iOS)
        let ratings = [
            { rate: 4.5, text: "4.5 فأكثر", isChecked: false },
            { rate: 4, text: "4 فأكثر", isChecked: false },
            { rate: 3.5, text: "3.5 فأكثر", isChecked: false },
            { rate: 3, text: "3 فأكثر", isChecked: false },
        ]
        return ratings;
    }
}
