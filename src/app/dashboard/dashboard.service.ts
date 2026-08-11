import { Injectable } from '@angular/core';
import { HttpService } from '../shared/services/http.service';
import { ProductsSearchOptions } from '../shared/models/products-search-options';



@Injectable({
    providedIn: 'root',
})
export class DashboardService {


    constructor(private httpService: HttpService) {

    }

    getHighlightedCoursesByTags(limit: number) {
        return this.httpService.getAuthRequest('courses/tags/recommended/' + limit);
    }
    getUpcomingEvents(limit: number) {
        return this.httpService.getAuthRequest('Commons/products/detaillatest/' + limit);
    }
    getCategories() {
        return this.httpService.getAuthRequest('Lookups/categories');
    }
    searchProducts(body) {
        return this.httpService.postAuthRequest('Commons/products/search', body);
    }
    searchSuggestions(keyword: string, limit: number) {
        return this.httpService.getRequest('Commons/products/preview/search/' + keyword + '/' + limit);
    }
    getUserFavoriteProducts(limit: number) {
        return this.httpService.getAuthRequest('UserData/products/favorites/' + limit);
    }
    getAllCoursesByCategory(categoryId: string) {
        return this.httpService.getAuthRequest('Courses/category/' + categoryId);
    }
    getSubCategories(categoryId: string) {
        return this.httpService.getAuthRequest('Lookups/subCategories/' + categoryId);
    }
    getOnlineClasses() {
        return this.httpService.postAuthRequest('Webinars/virtualclasses/get', {})
    }
    getCourseDetails(courseId) {
        return this.httpService.getAuthRequest('Courses/' + courseId);
    }
    protected(id) {
        return this.httpService.postRequest('Courses/protected', { courseIdOrSlug: id });
    }
    getSubtitle(id, mediaType) {
        return this.httpService.getAuthRequest(`Media/subtitle/${id}?subtitleType=${mediaType}`);
    }
    getSkills() {
        return this.httpService.getAuthRequest('Lookups/skills');
    }

    getUsersFeedbacksPerCourse(courseId, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("UserData/courses/UserFeedbacks/" + courseId + "/" + pageIndex + "/" + pageSize);
    }
    getUserEnrolledCourses() {
        return this.httpService.getAuthRequest("UserData/courses/enrolled");
    }
    getInvoicedProducts() {
        return this.httpService.getAuthRequest("UserData/orders/invoicedproducts");
    }
    getEnrollment(enrollmentId) {
        return this.httpService.getAuthRequest("UserData/courses/enrollments/" + enrollmentId);
    }
    enrollInCourse(courseId) {
        return this.httpService.postAuthRequest("UserData/course/enroll/" + courseId, {});
    }
    addBookMark(body) {
        return this.httpService.postAuthRequest('UserData/products/userBookMark', body);
    }
    removeBookMark(detailId) {
        return this.httpService.postAuthRequest('UserData/products/userBookMarks/delete/' + detailId, {});
    }

    getWebinar(webinarId) {
        return this.httpService.getAuthRequest('Webinars/' + webinarId)
    }
    getWebinarFeedBacks(webinarId, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("UserData/webinars/UserFeedbacks/" + webinarId + "/" + pageIndex + "/" + pageSize)
    }

    enrollToWebinar(webinarId) {
        return this.httpService.postAuthRequest("UserData/webinar/enroll/" + webinarId, {})
    }

    getCoursePath(pathId) {
        return this.httpService.getAuthRequest("Courses/coursePath/full/" + pathId)

    }

    getcoursePathFeedBacks(pathId, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("UserData/coursePath/UserFeedbacks/" + pathId + "/" + pageIndex + "/" + pageSize)
    }

    enrollToPath(pathId) {
        return this.httpService.postAuthRequest("UserData/coursePath/" + pathId + "/enroll", {})
    }

    geKnowledgeEnrichment(keId) {
        return this.httpService.getAuthRequest("KnowledgeEnrichment/" + keId)

    }

    getKnowledgeEnrichmentFeedBacks(keId, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("KnowledgeEnrichment/UserFeedbacks/" + keId + "/" + pageIndex + "/" + pageSize)
    }

    setCourseTracking(body) {
        return this.httpService.postAuthRequest("UserData/course/enroll/tracking", body)
    }
    submitAssessmentAnswers(body) {
        return this.httpService.postAuthRequest("UserData/courses/assessments/bulk", body)
    }
    setVideoSeconds(body) {
        return this.httpService.postAuthRequest("UserData/course/enrollments/currentinfo", body)
    }
    getHighlightedCoursePerCategory(categoryId, limit) {
        return this.httpService.postAuthRequest("commons/products/highlighted/" + categoryId + "/" + limit, {});
    }
    getLastViewedCourses(limit) {
        return this.httpService.postAuthRequest("commons/products/lastviewed/" + limit, {});

    }
    getHighlyRatedCourses(limit) {
        return this.httpService.postAuthRequest("commons/products/preferred/" + limit, {});

    }
    getInstitutionalTraining() {
        return this.httpService.getAuthRequest("Lookups/pageParts/HomeTenant");

    }
    getMostEnrolledCoursePerCategory(categoryId, limit) {
        return this.httpService.getAuthRequest("Commons/products/categoriesByEnrollment/courses/" + limit + '?categoryId=' + categoryId);
    }
    getLatestWebinars(limit) {
        return this.httpService.getAuthRequest("Commons/products/detaillatest/" + limit);
    }
    getMostSearchedCourses(limit) {
        return this.httpService.postAuthRequest("commons/products/mostsearched/" + limit, {});
    }
    getSimilarCourses(limit, courseId) {
        return this.httpService.getAuthRequest("Commons/products/courses/" + courseId + "/similar/" + limit);
    }
    getSimilarPaths(limit, pathId) {
        return this.httpService.getAuthRequest("Commons/products/coursepaths/" + pathId + "/similar/" + limit);
    }
    getHighligtedProducts(categoryId, limit) {
        return this.httpService.postAuthRequest("commons/products/highlighted/" + categoryId + "/" + limit, {})
    }
    setFavoriteProducts(body) {
        return this.httpService.postAuthRequest("UserData/products/favorites", body)
    }
    removeFavoriteProducts(body) {
        return this.httpService.postAuthRequest("UserData/products/favorites/delete", body)
    }
    checkCertificate(id) {
        return this.httpService.getAuthRequest("UserData/courses/enrollments/" + id + "/certificate")
    }
    getCertificateMediaUrl(type: number, certificateCode: string) {
        return this.httpService.getAuthRequest("media/certificate/" + type + "/" + certificateCode)
    }
    /**
     * Extract certificate code from a static certificate URL.
     * e.g. "https://static.ethrai.sa/coursecerts/cr_1_17qd8d0hil31b9.pdf" → "cr_1_17qd8d0hil31b9.pdf"
     */

    addRatingToCourse(body) {
        return this.httpService.postAuthRequest("UserData/courses/UserFeedbacks/false", body)
    }
    getUserStats() {
        return this.httpService.getAuthRequest('Profile/stats')
    }
    getBannerImages() {
        return this.httpService.getAuthRequest('Tenants/mobile/banners')
    }
    getSearchSuggestions(keyword, limit) {
        return this.httpService.getAuthRequest('Commons/products/preview/search/' + keyword + "/" + limit)
    }
    getKesTypes() {
        return this.httpService.getAuthRequest('KnowledgeEnrichment/products')
    }
    getDurations() {
        return this.httpService.getAuthRequest('Courses/durations')
    }
    addWebinarFeedback(body) {
        return this.httpService.postAuthRequest("UserData/webinars/UserFeedbacks/false", body)
    }
    addKeFeedback(body) {
        return this.httpService.postAuthRequest("UserData/kes/UserFeedbacks/false", body);
    }
    //Training Resource 3cases 
    getAllCasesStudy(limit) {
        return this.httpService.getAuthRequest('TrainingResources/latest/' + limit);
    }
    ISEnrollmentSp(id) {
        return this.httpService.getAuthRequest('TrainingResources/ISEnrollmentSp/' + id);
    }
    getMyCasesStudy() {
        return this.httpService.postAuthRequest('TrainingResources/GetSpEByUserprofils', {});
    }
    getAllEducationalGames(limit) {
        return this.httpService.getAuthRequest('TrainingResources/EducationalGameslatest/' + limit + '/details');
    }
    getAllInteractiveExercises(limit) {
        return this.httpService.getAuthRequest('TrainingResources/InteractiveExerciseslatest/' + limit + '/details');
    }
    //Training Resource  CASESSTUDY
    StartTraining(data) {
        return this.httpService.postAuthRequest("TrainingResources/StartTraining", data)
    }
    //Training Resource 3cases DETAILS
    getCasesStudyDetail(studyPlanId) {
        return this.httpService.getAuthRequest("TrainingResources/GetStudyPlan/" + studyPlanId)
    }
    getTraingGameDetail(EGId) {
        return this.httpService.getAuthRequest("TrainingResources/GetEducationalGames/" + EGId)
    }
    getInterActiveDetail(IEId) {
        return this.httpService.getAuthRequest("TrainingResources/GetInteractiveExercises/" + IEId)
    }
    //feedback
    getInteractiveExercisesUserFeedbacks(ProductId) {
        return this.httpService.postAuthRequest("UserData/GetInteractiveExercises/UserFeedbacks/" + ProductId, ProductId)
    }
    getEducationalGamesUserFeedbacks(ProductId) {
        return this.httpService.postAuthRequest("UserData/GetEducationalGames/UserFeedbacks/" + ProductId, ProductId)
    }
    getStudyPlanUserFeedbacks(ProductId) {
        return this.httpService.postAuthRequest("UserData/GetStudyPlan/UserFeedbacks/" + ProductId, ProductId)
    }
    getInteractiveExerciseFeedBacks(id, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("UserData/InteractiveExercise/UserFeedbacks/" + id + "/" + pageIndex + "/" + pageSize)
    }
    getEducationalGamesFeedBacks(id, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("UserData/EducationalGames/UserFeedbacks/" + id + "/" + pageIndex + "/" + pageSize)
    }
    getStudyPlanFeedBacks(id, pageIndex, pageSize) {
        return this.httpService.getAuthRequest("UserData/StudyPlan/UserFeedbacks/" + id + "/" + pageIndex + "/" + pageSize)
    }
    addEducationalGamesFeedback(body) {
        return this.httpService.postAuthRequest("UserData/EducationalGames/UserFeedbacks/false", body)
    }
    addStudyPlaneFeedback(body) {
        return this.httpService.postAuthRequest("UserData/StudyPlane/UserFeedbacks/false", body)
    }
    addInteractiveExercisesFeedback(body) {
        return this.httpService.postAuthRequest("UserData/InteractiveExercises/UserFeedbacks/false", body)
    }
    survey(target) {
        return this.httpService.getAuthRequest("TrainingResources/survey/active/" + target)
    }
    courseSurvey(tenantId) {
        return this.httpService.getAuthRequest("Lookups/survey/active/Course/" + tenantId)
    }
    addSurvey(data, surveyTarget, type) {
        return this.httpService.postAuthRequest(`UserData/survey/answers?surveyTarget2=${surveyTarget}&tragettype=${type}`, data)
    }
    addCourseSurvey(data) {
        return this.httpService.postAuthRequest('UserData/survey/course/answers', data)
    }
    //similar
    getSimilarCasesStudy(id, limited) {
        return this.httpService.getAuthRequest("TrainingResources/TrainingResourcesGetRecommendedSp/" + id + "/related/" + limited)
    }
    getSimilarTraingGame(id, limited) {
        return this.httpService.getAuthRequest("TrainingResources/TrainingResourcesGetRecommendedEG/" + id + "/related/" + limited)
    }
    getSimilarInterActive(id, limited) {
        return this.httpService.getAuthRequest("TrainingResources/TrainingResourcesGetRecommendedIE/" + id + "/related/" + limited)
    }
    //InteractiveTraining
    SearchInteractiveTraining(data) {
        let payload = {}
        return this.httpService.postAuthRequest(`TrainingResources/SearchInteractiveTraining`, data)
    }
    DeleteInteractiveTraining(id) {
        return this.httpService.postAuthRequest(`TrainingResources/DeleteInteractiveTraining/` + id, {})
    }
    SaveInteractiveTraining(data, isUpdate) {
        return this.httpService.postAuthRequest(`TrainingResources/SaveInteractiveTraining/` + isUpdate, data)
    }
    getInteractiveTrainingById(id) {
        return this.httpService.getAuthRequest(`TrainingResources/GetInteractiveTraining/` + id)

    }
    //InterActiveDetails
    ChangeInteractiveTrainingStatus(id, status) {
        return this.httpService.postAuthRequest(`TrainingResources/ChangeInteractiveTrainingStatus/` + id + '/' + status, {})
    }
    FinishInteractiveTraining(id, status) {
        return this.httpService.postAuthRequest(`TrainingResources/FinishInteractiveTraining/` + id + '/' + status, {})
    }
    GetTotalInteractiveTrainingAnswers(id) {
        return this.httpService.getAuthRequest(`TrainingResources/GetTotalInteractiveTrainingAnswers/` + id)
    }
    //SearchDigitalLibrary
    SearchDigitalLibrary(type, id) {
        let typeConverted = encodeURIComponent(type);
        return this.httpService.getAuthRequest(`TrainingResources/SearchDigitalLibrary/` + typeConverted + '/' + id)
    }
    SurveyReport(id) {
        return this.httpService.getAuthRequest(`TrainingResources/SurveyReport?interactiveTrainingId=${id}`)
    }
    GuessNumbersReport(id) {
        return this.httpService.getAuthRequest(`TrainingResources/GuessNumbersReport?interactiveTrainingId=${id}`)
    }
    EvaluationReport(id) {
        return this.httpService.getAuthRequest(`TrainingResources/EvaluationReport?interactiveTrainingId=${id}`)
    }
    QuizReport(id) {
        return this.httpService.getAuthRequest(`TrainingResources/QuezReport?interactiveTrainingId=${id}`)
    }
    GetStudyPlanRating(id) {
        return this.httpService.postAuthRequest(`UserData/GetStudyPlan/Feedbacks/${id}`, {})
    }
    GetEvaluationReportRating(id) {
        return this.httpService.getAuthRequest(`TrainingResources/GetSurveyReportRating/${id}`)
    }
}
