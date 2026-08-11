export class OnlineClass{
nameAr :string;
nameEn :string;
shortDescriptionAr :string;
shortDescriptionEn :string;
descriptionAr :string;
descriptionEn :string;
publishDate :string;
startDate :string;
hijriStartDate :string;
endDate :string;
timeZone :string;
location :string;
lastRegistrationDate :string;
videoUrl :string;
shortWebinarUrl :string;
imageUrl :string;
numberOfMinutes :number;
zoomWebinarId :string;
certificateMinimumMinutes :number;
userGuideUrl :string;
order :number;
deleted :boolean;
tenantId :string;
instructorIds :string;
tagIds :string[];
progressStatus :string; // ['Pending', 'Running', 'Done'],
mainCategoryId :string;
level :string;  //'Basic', 'Intermediate', 'Advanced'],
hideStatus :string; // ['None', 'Visible', 'HiddenForNonSubscribed', 'HiddenContent', 'HiddenContentAndCertificate'],
enableCertification :boolean;
showYoutubeUrl :boolean;
youtubeUrl :string;
categoryIds :string[];
subCategoryIds :string[];
attachments;// (Array[Ethrai.Webinars.Proxy.VirtualClassAttachment], optional),
attendees ;//(Array[Ethrai.Webinars.Proxy.AttendeeModel], optional),
joinUrl :string;
transactionId :string;
meetingId :string;
organizerEmail :string;
isQuestionnaireEnabled :boolean;
isUserAnswered :boolean;
isEvaluated :boolean;
userCertificateUrl :string;
isEnrolled :boolean;
id :string;
created :string;
modified :string;
createdBy :string;
modifiedBy :string
}