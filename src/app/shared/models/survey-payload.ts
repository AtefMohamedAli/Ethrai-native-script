export class SurveyPayload{

    public enrollmentId:string;
    public surveyId:string;
    public productId:string;

    public answers:ans[]

}
export class ans{
    public questionId:string;
    public answerId:string

}
