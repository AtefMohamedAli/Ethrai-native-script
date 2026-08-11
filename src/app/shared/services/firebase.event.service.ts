import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { isAndroid } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';

import '@nativescript/firebase-analytics';
import { environment } from '../../../../environments/environment';
import { UserProfile } from '../models/user-profile';
import { UserStats } from '../models/user-stats';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseEventService {
  // TEMPORARY: Set to false to disable Firebase for testing
  private FIREBASE_ENABLED = false;

  constructor(public datepipe: DatePipe, private globalService: GlobalService) {
  }

  logScreenViewedEvent(isLoggedIn, userStats, screenName, profile) {
    if (!this.FIREBASE_ENABLED) return;
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "ethrai_screen_viewed",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn && userStats?.jobSector ? userStats.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { console.log("screen viewd event success") }, err => { console.log(err, "event failed") });
  }

  logRegisterationBeginEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "registration_begin",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { }, err => { console.log(err, "event failed") });
  }

  logSignUpEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "sign_up",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { }, err => { console.log(err, "event failed") });
  }

  logLoginEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "login",
      parameters: [
        {
          key: "login_status",
          value: 'logged_in'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { }, err => { console.log(err, "event failed") });
  }

  logLogOutEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "logout",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { }, err => { console.log(err, "event failed") });
  }

  logUpdateProfileEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "profile_update",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { console.log("profile update") }, err => { console.log(err, "event failed") });
  }
  logProfileUploadedImageEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "profile_image_uploaded",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { console.log("profile image update") }, err => { console.log(err, "event failed") });
  }

  logPasswordUpdateEvent(isLoggedIn, userStats, screenName, profile) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "password_update",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { console.log("password update success") }, err => { console.log(err, "event failed") });
  }

  logCourseClickedEvent(isLoggedIn, userStats, screenName, profile, course) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "select_item",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        // {
        // key:"items",
        // value:[{
        //   parameters:[
        {
          key: "item_id",
          value: course.id,
          type: "string"
        },
        {
          key: "item_name",
          value: course.nameAr,
          type: "string"

        },
        {
          key: "item_category",
          value: course.categoryNameEn,
          type: "string"

        },
        {
          key: "item_variant",
          value: "training",
          type: "string"

        },
        {
          key: "item_brand",
          value: "إثرائي",
          type: "string"

        },
        {
          key: "price",
          value: isAndroid ? String(course?.price ?? 0) : String(course?.applePrice ?? 0),
          type: 'double'
        },
        {
          key: "value",
          value: isAndroid ? String(course?.price ?? 0) : String((course?.applePrice ?? 0) * 0.7),
          type: 'double'
        },
        {
          key: "item_list_name",
          value: "tranining",
          type: "string"
        }
      ]
      //     }],
      //     type:"array"
      //   }
      // ]
    }).then(res => { console.log("course click success") }, err => { console.log(err, "event failed") }).catch(x => console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvv"));
  }
  logKeWebinarsClickedEvent(isLoggedIn, userStats, screenName, profile, webinar, id, isKe) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "select_item",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        // {
        // key:"items",
        // type:"array",
        // value:[{
        //   parameters:[
        {
          key: "item_id",
          value: id,
        },
        {
          key: "item_name",
          value: webinar.nameAr,
        },
        {
          key: "item_category",
          value: webinar.categoryNameAr,
        },
        {
          key: "item_variant",
          value: isKe ? "knowledge enrichment" : "e-conference",
        },
        {
          key: "item_brand",
          value: "إثرائي"
        },
        {
          key: "price",
          value: "0",
          type: 'double'
        },
        {
          key: "value",
          value: "0",
          type: 'double'
        },
        {
          key: "item_list_name",
          value: isKe ? "knowledge enrichment" : "e-conference",
        },
        {
          key: "currency",
          value: "SAR",
        }
        // ]
        // }]
        // }
        ,
        {
          key: "rating",
          value: webinar?.rating?.toString(),
        }
      ]
    }).then(res => { console.log("webinar / ke click event") }, err => { console.log(err, "event failed") });
  }

  logMyProductsCourseClickedEvent(isLoggedIn, userStats, screenName, profile, course) {
    this.setUserProperty(isLoggedIn, userStats, profile?.created);
    this.setUserID(isLoggedIn ? userStats?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "select_item",
      parameters: [
        {
          key: "login_status",
          value: isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: isLoggedIn ? userStats?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "item_id",
          value: course.courseId,
        },
        {
          key: "item_name",
          value: course.nameAr,
        },
        {
          key: "item_variant",
          value: "training",
        },
        {
          key: "item_brand",
          value: "إثرائي"
        },
        {
          key: "item_list_name",
          value: "tranining",
        },
        {
          key: "currency",
          value: "SAR",
        },
        {
          key: "rating",
          value: course.rating,
        }
      ]
    }).then(res => { }, err => { console.log(err, "event failed") });
  }

  logCourseDetailsImpressionEvent(eventName, screenName, course, videoName, duration, progressPercentage, unitName) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    if (course.enrollment) {
      if (course.enrollment.status == 'Success') {
        enrollmentStaus = 'completed'
      } else if (course.enrollment.status == 'InProgress') {
        enrollmentStaus = 'ongoing'
      }
    } else {
      enrollmentStaus = "not-started"
    }
    course.instructors.forEach(element => {
      instructorNames += element.fullNameAr + ','
    });
    course.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: eventName,
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          type: "array",
          value: [{
            parameters: [
              {
                key: "item_id",
                value: course.course.id,
                type: "string"
              },
              {
                key: "item_name",
                value: course.course.nameAr,
                type: "string"

              },
              {
                key: "item_category",
                value: categoriesNames,
                type: "string"

              },
              {
                key: "item_variant",
                value: "training",
                type: "string"

              },
              {
                key: "item_brand",
                value: "إثرائي",
                type: "string"

              },
              {
                key: "price",
                value: isAndroid ? course.course.pricing.price.toString() : course.course.applePrice.toString(),
                type: 'double'
              },
              {
                key: "value",
                value: isAndroid ? course.course.pricing.price.toString() : 0.7 * course.course.applePrice.toString(),
                type: 'double'
              },
              {
                key: "item_list_name",
                value: "tranining",
                type: "string"

              },
              {
                key: "currency",
                value: "SAR",
                type: "string"

              }
            ]
          }]
        }
        ,
        {
          key: "rating",
          value: course.statistics.rating.toString(),
        },
        {
          key: "program_id",
          value: course.course.id,
          type: "string"
        },
        ,
        {
          key: "type",
          value: "tranining",
          type: "string"
        },
        ,
        {
          key: "category",
          value: categoriesNames,
          type: "string"

        },
        {
          key: "video_name",
          value: videoName,
          type: "string"

        },
        ,
        {
          key: "no_of_reviews",
          value: course.statistics.numberOfRatings.toString(),

        },
        {
          key: "no_registration",
          value: course.statistics.enrollmentsNumber.toString(),
        },
        {
          key: "instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(course.course.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: course.course.level.toLowerCase(),
        }, {
          key: "purchasable",
          value: course.course.pricing.price ? "yes" : "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }, {
          key: "total_units",
          value: course?.course?.detailTreeStats.unitsCount.toString(),
        }, {
          key: "total_activities",
          value: course?.course?.detailTreeStats?.activitiesCount.toString(),
        }, {
          key: "total_reviews",
          value: course?.course?.detailTreeStats?.assessmentsCount.toString(),
        }, {
          key: "total_cases",
          value: course?.course?.detailTreeStats?.trainingCasesCount.toString(),
        }, {
          key: "c_program_completed_per",
          value: progressPercentage + "%",
        },
        {
          key: "unit_name",
          value: unitName
        }
      ]
    }).then(res => { console.log("Course impression event", eventName) }, err => { console.log(err, "event failed") });
  }
  logWebinarDetailsRegistrationBtnClick(screenName, webinar, duration, eventName) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    if (webinar.enrollment) {
      if (webinar.webinar.progressStatus == 'Done') {
        enrollmentStaus = 'completed'
      } else if (webinar.webinar.progressStatus == 'Pending') {
        enrollmentStaus = 'ongoing'
      }
    } else {
      enrollmentStaus = "not-started"
    }
    webinar.experts.forEach(element => {
      instructorNames += element.nameAr + ','
    });
    webinar.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: eventName,
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          value: [{
            parameters: [
              {
                key: "item_id",
                value: webinar.webinar.id,
              },
              {
                key: "item_name",
                value: webinar.webinar.nameAr,
              },
              {
                key: "item_category",
                value: categoriesNames,
              },
              {
                key: "item_variant",
                value: "e-conference",
              },
              {
                key: "item_brand",
                value: "إثرائي"
              },
              {
                key: "price",
                value: "0",
              },
              {
                key: "value",
                value: "0",
              },
              {
                key: "item_list_name",
                value: "e-conference",
              },
              {
                key: "currency",
                value: "SAR",
              },
            ]
          }],
          type: 'array'
        },
        {
          key: "rating",
          value: webinar.statistics.rating.toString(),
        },
        {
          key: "program_id",
          value: webinar.webinar.id,
        },
        ,
        {
          key: "type",
          value: "e-conference",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "no_of_reviews",
          value: webinar.statistics.numberOfRatings.toString(),
        },
        {
          key: "instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(webinar.webinar.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: webinar.webinar.level.toLowerCase(),
        }, {
          key: "purchasable",
          value: "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }, {
          key: "no_registration",
          value: webinar.statistics.enrollmentsNumber.toString(),
        }
      ]
    }).then(res => { console.log("webinar register") }, err => { console.log(err, "event failed") });
  }
  logRemoveFromCartEvent(variant, screenName, course) {
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'remove_from_cart',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          type: "array",
          value: [{
            parameters: [
              {
                key: "item_id",
                value: course.productId,
              },
              {
                key: "item_name",
                value: course.nameAr,
              },
              {
                key: "item_category",
                value: course.categoryNameAr,
              },
              {
                key: "item_variant",
                value: variant,
              },
              {
                key: "item_brand",
                value: "إثرائي"
              },
              {
                key: "price",
                value: String(isAndroid ? (course.amount ?? 0) : (course.applePrice ?? course.amount ?? 0)),
                type: 'double'
              },
              {
                key: "value",
                value: String(isAndroid ? (course.amount ?? 0) : ((course.applePrice ?? course.amount ?? 0) * 0.7)),
                type: 'double'
              },
              {
                key: "item_list_name",
                value: variant,
              },
              {
                key: "currency",
                value: "SAR",
              }
            ]
          }]
        }
      ]
    }).then(res => { console.log("remove from cart") }, err => { console.log(err, "event failed") });
  }
  logViewCartEvent(screenName) {
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'view_cart',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        },
        {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },

      ]
    }).then(res => { console.log("VIEW_CART success") }, err => { console.log(err, "event failed") });
  }

  logCourseCompletedEvent(screenName, course, videoName, duration, progressPercentage, unitName) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    enrollmentStaus = 'completed'

    course.instructors.forEach(element => {
      instructorNames += element.fullNameAr + ','
    });
    course.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'course_completed',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "program_id",
          value: course.course.id,
        },
        ,
        {
          key: "type",
          value: "tranining",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "video_name",
          value: videoName,
        },
        ,
        {
          key: "no_of_reviews",
          value: course.statistics.numberOfRatings.toString(),
        }, {
          key: "no_registration",
          value: course.statistics.enrollmentsNumber.toString(),
        },
        {
          key: "instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(course.course.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: course.course.level.toLowerCase(),
        }, {
          key: "rating",
          value: course.statistics.rating.toString(),
        }, {
          key: "purchasable",
          value: course.course.pricing.price ? "yes" : "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }, {
          key: "total_units",
          value: course?.course?.detailTreeStats.unitsCount.toString(),
        }, {
          key: "total_activities",
          value: course?.course?.detailTreeStats?.activitiesCount.toString(),
        }, {
          key: "total_reviews",
          value: course?.course?.detailTreeStats?.assessmentsCount.toString(),
        }, {
          key: "total_cases",
          value: course?.course?.detailTreeStats?.trainingCasesCount.toString(),
        }, {
          key: "program_completed_per",
          value: progressPercentage + "%",
        }, {
          key: "unit_name",
          value: unitName
        }
      ]
    }).then(res => { }, err => { console.log(err, "event failed") });
  }

  logCheckoutBeginEvent(screenName, courses) {
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "begin_checkout",
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          type: 'array',
          value: this.getCheckoutParams(courses, "checkoutBegin", null, null, null, null)
        }
      ]
    }).then(res => { console.log("BEGIN_CHECKOUT succ") }, err => { console.log(err, "event failed") });
  }

  logPaymentInfoEvent(screenName, courses, paymentMethod) {
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "add_payment_info",
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          type: 'array',
          value: this.getCheckoutParams(courses, "paymentInfo", paymentMethod, null, null, null)
        }
      ]
    }).then(res => { console.log("ADD_PAYMENT_INFO succ") }, err => { console.log(err, "event failed") });
  }
  logPurchaseEvent(screenName, courses, paymentMethod, transactionId, tax, coupon) {
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "purchase",
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          type: 'array',
          value: this.getCheckoutParams(courses, "purchase", paymentMethod, transactionId, coupon, tax)
        }
      ]
    }).then(res => { console.log("purchase event succ") }, err => { console.log(err, "event failed") });
  }
  logVideoStartedorCompletedEvent(eventName, screenName, course, videoName, duration, progressPercentage, unitName) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    if (course.enrollment) {
      if (course.enrollment.status == 'Success') {
        enrollmentStaus = 'completed'
      } else if (course.enrollment.status == 'InProgress') {
        enrollmentStaus = 'ongoing'
      }
    } else {
      enrollmentStaus = "not-started"
    }
    course.instructors.forEach(element => {
      instructorNames += element.fullNameAr + ','
    });
    course.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: eventName,
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "program_id",
          value: course.course.id,
        },
        ,
        {
          key: "type",
          value: "tranining",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "video_name",
          value: videoName,
        },
        ,
        {
          key: "no_of_reviews",
          value: course.statistics.numberOfRatings.toString(),
        },
        {
          key: "no_registration",
          value: course.statistics.enrollmentsNumber.toString(),
        },
        {
          key: "instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(course.course.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: course.course.level.toLowerCase(),
        }, {
          key: "rating",
          value: course.statistics.rating.toString(),
        }, {
          key: "purchasable",
          value: course.course.pricing.price ? "yes" : "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }, {
          key: "total_units",
          value: course?.course?.detailTreeStats.unitsCount.toString(),
        }, {
          key: "total_activities",
          value: course?.course?.detailTreeStats?.activitiesCount.toString(),
        }, {
          key: "total_reviews",
          value: course?.course?.detailTreeStats?.assessmentsCount.toString(),
        }, {
          key: "total_cases",
          value: course?.course?.detailTreeStats?.trainingCasesCount.toString(),
        }, {
          key: "program_completed_per",
          value: progressPercentage + "%",
        }, {
          key: "unit_name",
          value: unitName
        }
      ]
    }).then(res => { console.log("video start/complete event") }, err => { console.log(err, "event failed") });
  }
  logRatingSubmitEvent(screenName, comment) {
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'form_submissions',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "rating_comment",
          value: comment
        }
      ]
    }).then(res => { })
  }
  logSubmitFormEvent(screenName, eventName) {
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: eventName,
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(i => console.log("logSubmitFormEvent"))
  }
  logInternalSearchEvent(screenName, keyWord) {
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'internalsearch',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "search_keyword",
          value: keyWord
        }
      ]
    }).then(res => { console.log("internal search event success") })
  }
  logShareClickedEvent(screenName) {
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na')
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: "share_btn_click",
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }
      ]
    }).then(res => { console.log("share btn click") }, err => { console.log(err, "event failed") });
  }
  logWebinarDetailsImpressionEvent(screenName, webinar, duration) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    if (webinar.enrollment) {
      if (webinar.webinar.progressStatus == 'Done') {
        enrollmentStaus = 'completed'
      } else if (webinar.webinar.progressStatus == 'Pending') {
        enrollmentStaus = 'ongoing'
      }
    } else {
      enrollmentStaus = "not-started"
    }
    webinar.experts.forEach(element => {
      instructorNames += element.nameAr + ','
    });
    webinar.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'view_item',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
          type: "string"

        },
        {
          key: "pref_language",
          value: 'arabic',
          type: "string"

        },
        {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na',  /* IF NOT LOGGED IN */
          type: "string"

        },
        {
          key: "items",
          value: [{
            parameters: [
              {
                key: "item_id",
                value: webinar.webinar.id,
                type: "string"
              },
              {
                key: "item_name",
                value: webinar.webinar.nameAr,
                type: "string"

              },
              {
                key: "item_category",
                value: categoriesNames,
                type: "string"
              },
              {
                key: "item_variant",
                value: "e-conference",
                type: "string"
              },
              {
                key: "item_brand",
                value: "إثرائي",
                type: "string"
              },
              {
                key: "price",
                value: "0",
                type: "double"
              },
              {
                key: "value",
                value: "0",
                type: "double"

              },
              {
                key: "item_list_name",
                value: "e-conference",
                type: "string"

              },
              {
                key: "currency",
                value: "SAR",
                type: "string"
              }
            ]
          }],
          type: 'array'
        },
        {
          key: "rating",
          value: webinar.statistics.rating.toString(),
        },
        {
          key: "program_id",
          value: webinar.webinar.id,
        },
        ,
        {
          key: "type",
          value: "e-conference",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "no_of_reviews",
          value: webinar.statistics.numberOfRatings.toString(),
        },
        {
          key: "instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(webinar.webinar.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: webinar.webinar.level.toLowerCase(),
        }, {
          key: "rating",
          value: webinar.statistics.rating.toString(),
        }, {
          key: "purchasable",
          value: "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }, {
          key: "no_registration",
          value: webinar.statistics.enrollmentsNumber.toString()
        }
      ]
    }).then(res => { console.log("webinar detail impression") }, err => { console.log(err, "event failed") });
  }
  logWebinarVideoStatusEvent(eventName, screenName, webinar, duration) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    if (webinar.enrollment) {
      if (webinar.webinar.progressStatus == 'Done') {
        enrollmentStaus = 'completed'
      } else if (webinar.webinar.progressStatus == 'Pending') {
        enrollmentStaus = 'ongoing'
      }
    } else {
      enrollmentStaus = "not-started"
    }
    webinar.experts.forEach(element => {
      instructorNames += element.nameAr + ','
    });
    webinar.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: eventName,
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "program_id",
          value: webinar.webinar.id,
        },
        ,
        {
          key: "type",
          value: "e-conference",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "no_of_reviews",
          value: webinar.statistics.numberOfRatings.toString(),
        },
        {
          key: "no_registration",
          value: webinar.statistics.enrollmentsNumber.toString(),
        },
        {
          key: "instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(webinar.webinar.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: webinar.webinar.level.toLowerCase(),
        }, {
          key: "rating",
          value: webinar.statistics.rating.toString(),
        }, {
          key: "purchasable",
          value: "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }
      ]
    }).then(res => { console.log("webinar video event") }, err => { console.log(err, "event failed") });
  }
  logKeVideoStatusEvent(eventName, screenName, ke, duration) {
    let categoriesNames = "";
    ke.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: eventName,
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "program_id",
          value: ke.ke.id,
        },
        ,
        {
          key: "type",
          value: "knowledge enrichment",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "no_of_reviews",
          value: ke.statistics.numberOfRatings.toString(),
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(ke.ke.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "rating",
          value: ke.statistics.rating.toString(),
        }, {
          key: "purchasable",
          value: "no",
        },
        {
          key: "no_registration",
          value: ke.statistics.enrollmentsNumber.toString(),
        },
      ]
    }).then(res => { console.log("ke video event") }, err => { console.log(err, "event failed") });
  }
  DetailsImpressionEvent(screenName, ke, duration) {
    let categoriesNames = "";
    ke.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'view_item',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          value: [{
            parameters: [
              {
                key: "item_id",
                value: ke.ke.id,
              },
              {
                key: "item_name",
                value: ke.ke.nameAr,
              },
              {
                key: "item_category",
                value: categoriesNames,
              },
              {
                key: "item_variant",
                value: "knowledge enrichment",
              },
              {
                key: "item_brand",
                value: "إثرائي"
              },
              {
                key: "price",
                value: "0",
                type: 'double'
              },
              {
                key: "value",
                value: "0",
                type: 'double'
              },
              {
                key: "item_list_name",
                value: "knowledge enrichment"
              },
              {
                key: "currency",
                value: "SAR",
              }
            ]
          }],
          type: "array"
        },
        {
          key: "program_id",
          value: ke.ke.id,
        },
        ,
        {
          key: "type",
          value: "knowledge enrichment",
        },
        ,
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "no_of_reviews",
          value: ke.statistics.numberOfRatings.toString(),
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(ke.ke.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "rating",
          value: ke.statistics.rating.toString(),
        }, {
          key: "purchasable",
          value: "no",
        }, {
          key: "no_registration",
          value: ke.statistics.enrollmentsNumber.toString(),
        },
      ]
    }).then(res => { console.log("ke detail impression") }, err => { console.log(err, "event failed") });
  }
  setUserID(id) {
    this.setUserIdLegacy({
      userId: id
    }).then(res => { }, err => { console.log(err, "id failed") });
  }
  setUserProperty(isLoggedIn, stats, registerDate) {
    this.setUserPropertyLegacy({
      key: "usertotalordervalue",
      value: isLoggedIn ? stats?.userTotalOrderValue?.toString() : "0"
    }).then(res => { }, err => { console.log(err, "sar failed") });

    this.setUserPropertyLegacy({
      key: "programs_purchased",
      value: isLoggedIn ? stats?.programsPurchased?.toString() : "0"
    }).then(res => { }, err => { console.log(err, "purchased failed") });

    this.setUserPropertyLegacy({
      key: "programs_completed",
      value: isLoggedIn ? stats?.programsCompleted?.toString() : "0"
    }).then(res => { }, err => { console.log(err, "completed failed") });

    this.setUserPropertyLegacy({
      key: "programs_ongoing",
      value: isLoggedIn ? stats?.programsOnGoing?.toString() : "0"
    }).then(res => { }, err => { console.log(err, "ongoing failed") });

    this.setUserPropertyLegacy({
      key: "nationality",
      value: isLoggedIn ? stats?.nationality?.toString() : "na" /* IF NOT LOGGED IN */
    }).then(res => { }, err => { });

    this.setUserPropertyLegacy({
      key: "user_registered_date",
      value: isLoggedIn ? this.datepipe.transform(registerDate, 'yyyy-MM-dd') : "na"
    }).then(res => { }, err => { console.log(err, "date failed") });
  }
  setScreenName(name) {
    this.setScreenNameLegacy({
      screenName: 'ar/' + name
    }).then(res => { }, err => { console.log(err, "screen name failed") });
  }
  getTenantName(isLoggedIn) {
    let tenantName = ""
    let userTenants: any[] = this.globalService.getUserTenants() ? this.globalService.getUserTenants() : JSON.parse(this.globalService.getTenants());
    if (isLoggedIn) {
      if (this.globalService.isEthrai) {
        tenantName = userTenants.find(t => t.id == environment.ETHRAI_GUID).nameAr
      } else {
        tenantName = userTenants.find(t => t.domain == this.globalService.getTenantDomain()).nameAr
      }
    } else {
      tenantName = 'إثرائي'
    }
    return tenantName
  }
  getCheckoutParams(courses, eventType, paymentMethod, transactionId, coupon, tax) {
    let params = []
    courses?.forEach(element => {
      let arr = []
      if (isAndroid) {
        arr.push({ key: 'item_name', value: element?.productName })
        arr.push({ key: 'item_id', value: element?.id });
        arr.push({ key: 'item_category', value: element?.categoryNameAr })
        arr.push({ key: 'item_variant', value: element?.productType == 'Course' ? "training" : "path" })
        arr.push({ key: 'price', value: element?.amount.toString(), type: 'double' })
        arr.push({ key: 'value', value: element?.amount.toString(), type: 'double' })
        arr.push({ key: 'item_list_name', value: element?.productType == 'Course' ? "training" : "path" })
      } else {
        // Handle both flat cart items (productName, id, amount) and nested course objects (course.nameAr, course.id, etc.)
        const name = element?.course?.nameAr ?? element?.productName ?? 'na';
        const id = element?.course?.id ?? element?.id ?? 'na';
        const category = element?.categories?.find(cat => cat.id == element?.course?.mainCategoryId)?.nameAr ?? element?.categoryNameAr ?? 'na';
        const price = element?.course?.applePrice ?? element?.amount ?? 0;
        arr.push({ key: 'item_name', value: name })
        arr.push({ key: 'item_id', value: id });
        arr.push({ key: 'item_category', value: category })
        arr.push({ key: 'item_variant', value: element?.productType == 'Course' ? "training" : "training" })
        arr.push({ key: 'price', value: price.toString(), type: 'double' })
        arr.push({ key: 'value', value: (.7 * price).toString(), type: 'double' })
        arr.push({ key: 'item_list_name', value: "training" })
      }
      arr.push({ key: 'currency', value: 'SAR' })
      arr.push({ key: 'item_brand', value: "إثرائى" })

      if (eventType == 'paymentInfo') {
        arr.push({ key: 'payment_type', value: paymentMethod })

      } else if (eventType == 'purchase') {
        arr.push({ key: 'payment_type', value: paymentMethod, type: 'string' })
        arr.push({ key: 'transaction_id', value: transactionId, type: 'string' })
        arr.push({ key: 'tax', value: tax, type: 'double' })
        arr.push({ key: 'shipping', value: 0, type: 'double' })
        arr.push({ key: 'coupon', value: coupon, type: 'string' })

      }
      let obj = {
        parameters: arr
      }
      params.push(obj)
    });
    return params;
  }
  logAddToWishListEvent(screenName, course, videoName, duration, progressPercentage, unitName) {
    let categoriesNames = "";
    let instructorNames = "";
    let enrollmentStaus = ""
    if (course.enrollment) {
      if (course.enrollment.status == 'Success') {
        enrollmentStaus = 'completed'
      } else if (course.enrollment.status == 'InProgress') {
        enrollmentStaus = 'ongoing'
      }
    } else {
      enrollmentStaus = "not-started"
    }
    course.instructors.forEach(element => {
      instructorNames += element.fullNameAr + ','
    });
    course.categories.forEach(element => {
      categoriesNames += element.nameAr + ','
    });
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    console.log(isAndroid ? course.course.pricing.price : course.course.applePrice)

    this.logEventLegacy({
      key: 'add_to_wishlist',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest'
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn ? this.globalService.getUserStats()?.jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        }, {
          key: "items",
          type: "array",
          value: [{
            parameters: [
              {
                key: "item_id",
                value: course.course.id,
              },
              {
                key: "item_name",
                value: course.course.nameAr,
              },
              {
                key: "item_category",
                value: categoriesNames,
              },
              {
                key: "item_variant",
                value: "training",
              },
              {
                key: "item_brand",
                value: "إثرائي"
              },
              {
                key: "price",
                value: isAndroid ? course.course.pricing.price.toString() : course.course.applePrice.toString(),
              },
              {
                key: "value",
                value: isAndroid ? course.course.pricing.price.toString() : 0.7 * course.course.applePrice.toString(),
              },
              {
                key: "item_list_name",
                value: "tranining",
              },
              {
                key: "currency",
                value: "SAR",
              }
            ]
          }]
        },
        ,
        {
          key: "rating",
          value: course.statistics.rating.toString(),
        },
        {
          key: "program_id",
          value: course.course.id,
        },
        ,
        {
          key: "type",
          value: "tranining",
        },
        {
          key: "category",
          value: categoriesNames,
        },
        {
          key: "video_name",
          value: videoName,
        },
        ,
        {
          key: "no_of_reviews",
          value: course.statistics.numberOfRatings.toString(),
        },
        {
          key: "c_instructor_name",
          value: instructorNames,
        },
        {
          key: "duration",
          value: duration,
        }, {
          key: "published_date",
          value: this.datepipe.transform(course.course.publishDate, 'dd/MM/yyyy'),
        }, {
          key: "level",
          value: course.course.level.toLowerCase(),
        }, {
          key: "purchasable",
          value: course.course.pricing.price ? "yes" : "no",
        }, {
          key: "status",
          value: enrollmentStaus
        }, {
          key: "total_units",
          value: course?.course?.detailTreeStats.unitsCount.toString(),
        }, {
          key: "total_activities",
          value: course?.course?.detailTreeStats?.activitiesCount.toString(),
        }, {
          key: "total_reviews",
          value: course?.course?.detailTreeStats?.assessmentsCount.toString(),
        }, {
          key: "total_cases",
          value: course?.course?.detailTreeStats?.trainingCasesCount.toString(),
        }, {
          key: "program_completed_per",
          value: progressPercentage + "%",
        }, {
          key: "no_registration",
          value: course.statistics.enrollmentsNumber.toString()
        },
        {
          key: "unit_name",
          value: unitName
        }
      ]
    }).then(res => { console.log("ADD TO WISHLIST") }, err => { console.log(err, "event failed") }).catch();
  }

  logCourseImpressionsEvent(screenName, courses, type) {
    if (!this.FIREBASE_ENABLED) return;
    let paramsArr = []
    courses?.forEach(element => {
      let courseParam = [];
      courseParam.push({ key: 'item_name', value: element?.nameAr ?? 'na', type: 'string' })
      courseParam.push({ key: 'item_id', value: element?.id ?? 'na', type: 'string' });
      courseParam.push({ key: 'item_category', value: element?.categoryNameAr ?? 'na', type: 'string' })
      courseParam.push({ key: 'item_variant', value: type ?? 'na', type: 'string' })
      courseParam.push({ key: 'item_list_name', value: type ?? 'na', type: 'string' })
      courseParam.push({ key: 'item_brand', value: "إثرائى", type: 'string' });
      let obj = {
        parameters: courseParam
      }
      paramsArr.push(obj)
    }
    )
    this.setUserID(this.globalService.isLoggedIn ? this.globalService.getUserStats()?.userProfileId : 'na');
    this.setUserProperty(this.globalService.isLoggedIn, this.globalService.getUserStats(), this.globalService.getUserProfile()?.created);
    this.setScreenName(screenName);
    this.logEventLegacy({
      key: 'view_item_list',
      parameters: [
        {
          key: "login_status",
          value: this.globalService.isLoggedIn ? 'logged_in' : 'guest',
        },
        {
          key: "pref_language",
          value: 'arabic'
        }, {
          key: "job_sector",
          value: this.globalService.isLoggedIn && this.globalService.getUserStats()?.jobSector ? this.globalService.getUserStats().jobSector.toLowerCase() : 'na'  /* IF NOT LOGGED IN */
        },
        {
          key: "items",
          type: 'array',
          value: paramsArr
        }

      ]
    }).then(res => {/*console.log("IMPRESIION item_list event")*/ }, err => { console.log(err, "event failed") }).catch();
  }
  private transformParams(parameters: any[]): any {
    const params: any = {};
    if (!parameters) return params;
    parameters.forEach(p => {
      if (!p) return;
      if (p.type === 'array' && Array.isArray(p.value)) {
        params[p.key] = p.value.map((item: any) => this.transformParams(item.parameters));
      } else {
        const value = p.value ?? 'na';
        params[p.key] = value;
      }
    });
    return params;
  }

  private logEventLegacy(data: { key: string, parameters: any[] }): Promise<void> {
    if (!this.FIREBASE_ENABLED) return Promise.resolve();
    try {
      const params = this.transformParams(data.parameters);
      firebase().analytics().logEvent(data.key, params);
      return Promise.resolve();
    } catch (e) {
      console.error("Error logging event:", e);
      return Promise.resolve();
    }
  }

  private setUserIdLegacy(data: { userId: string }): Promise<void> {
    if (!this.FIREBASE_ENABLED) return Promise.resolve();
    try {
      const userId = data.userId ?? 'na';
      firebase().analytics().setUserId(userId);
    } catch (e) {
      console.error("Error setting user ID:", e);
    }
    return Promise.resolve();
  }

  private setUserPropertyLegacy(data: { key: string, value: string }): Promise<void> {
    if (!this.FIREBASE_ENABLED) return Promise.resolve();
    try {
      const value = data.value ?? 'na';
      firebase().analytics().setUserProperty(data.key, value);
    } catch (e) {
      console.error("Error setting user property:", e);
    }
    return Promise.resolve();
  }

  private setScreenNameLegacy(data: { screenName: string }): Promise<void> {
    try {
      firebase().analytics().logEvent('screen_view', { screen_name: data.screenName, screen_class: data.screenName });
    } catch (e) {
      console.error("Error setting screen name:", e);
    }
    return Promise.resolve();
  }
}