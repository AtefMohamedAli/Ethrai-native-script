export class UserProfile{
    public nationalId :string;
    public nationalityId:string;
    public interestsIds :string[];
    public settings :{
       disableNotification :boolean;
       disableEmailNotification :boolean;
       disableSmsNotification :boolean;
       disableInboxNotification :boolean
    };
    public isEnrollCoursesAllowed :boolean;
    public tenants :
      {
         tenantId:string,
         email:string,
         userId:string, 
         roles :string[],
         permissions ,
         lastVisitDate:Date 
      }[];
    
    public birthdate:Date 
    public firstNameAr:string=""; 
    public fatherNameAr:string=""; 
    public grandFatherNameAr:string;
    public familyNameAr:string=""; 
    public fullNameAr:string; 
    public firstNameEn:string;
    public fatherNameEn:string; 
    public grandFatherNameEn:string;
    public familyNameEn:string; 
    public fullNameEn:string; 
    public genderId:string; 
    public sectorId :number;
    public mobile:string; 
    public countryCode:string; 
    public type:string; 
    public oracleStatus:string; 
    public namesApprovalStatus:string 
    public instructorInfo :{
       type:string ,
       approvalStatus:string 
    };
    public id:string;
    public created:string; 
    public modified:string; 
    public createdBy:string; 
    public modifiedBy:string;
    public photoUrl:string;
    public birthdateHijri:string;
    public certificates?: any[];
}
