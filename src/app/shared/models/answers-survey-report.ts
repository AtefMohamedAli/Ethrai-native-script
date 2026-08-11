export class AnswersSurvey {
    answerCount: number;
    answerName: string;
    questionId: string;
    questionName: string;

}
export class SurveyRes {
    value: AnswersSurvey[]
}
export class Survey {
    questionsName: string;
    questionsId: string;
    answers: AnswersSurvey[]
    // agreeCompletly: number;
    // agreeto: number;
    // agree: number;
    // notAgreeCompletly: number;
    // notAgree: number;

}
