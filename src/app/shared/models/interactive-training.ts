import {TrainingTypeId} from "./enums/TrainingTypeId";
export class InteractiveTraining {
  public questions: Questions[];
  public nameAr: string;
  public nameEn: string;
  public trainingTypeId: string;
  public isFinished: boolean;
  public imageUrl: string;
  public isDraft: boolean;
  public isActive: boolean;
  public link: string;
  public durationInSeconds: number
  public expirationInDays: number
  public minCorrectAnswers: number
  public retries:number
  public isSurveyAnswered: boolean
  public showedQuestions:boolean
  // public tenantId: "string",
  // public userProfileId: "string",
  public id: number

}

export class Questions {
  id: string
  trainingTypeId: string
  nameAr: string
  nameEN: string
  imageUrl: string
  answers: Answer[]
  deleted: boolean
}
export class Answer {
  id: string
  nameAr: string
  nameEN: string
  imageUrl: string
  isCorrect: boolean
}

