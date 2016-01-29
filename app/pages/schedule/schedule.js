import {IonicApp, Page, Modal, Alert, NavController} from 'ionic/ionic';
import {ConferenceData} from '../../providers/conference-data';
import {UserData} from '../../providers/user-data';
import {ScheduleFilterPage} from '../schedule-filter/schedule-filter';
import {SessionDetailPage} from '../session-detail/session-detail';


@Page({
  templateUrl: 'build/pages/schedule/schedule.html'
})
export class SchedulePage {
  constructor(app: IonicApp, nav: NavController, confData: ConferenceData, user: UserData) {
    this.app = app;
    this.nav = nav;
    this.confData = confData;
    this.user = user;

    this.dayIndex = 0;
    this.queryText = '';
    this.segment = 'all';

    this.hasSessions = false;
    this.groups = [];

    this.updateSchedule();
    
    // Making this available to ace.js:
    window.schedulePage = this;

    if (window.firstLoad) {
        // See if this app was started by an app widget click
        // (Resume is handled elsewhere)
        checkForWidgetActivation();
        window.firstLoad = false;
    }
  }

  onPageDidEnter() {
    this.app.setTitle('Schedule');
    this.updateSchedule();
  }

  updateSchedule() {
    let excludeTracks = [];
    if (window.localStorage["excludeTracks"]) {
       excludeTracks = JSON.parse(window.localStorage["excludeTracks"]);
    }
    var elements = window.document.getElementsByClassName("all-segment");
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerText = (excludeTracks.length > 0 ? "Filtered" : "All");
    }

    this.confData.getTimeline(this.dayIndex, this.queryText, excludeTracks, this.segment).then(data => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
    });
  }

  presentFilter() {
    if (window.nativeUIEnabled) {
        // Navigate to a native page
        window.presentFilter();
    }
    else {
        // Show an Ionic modal dialog
        let modal = Modal.create(ScheduleFilterPage);
        modal.onDismiss(() => this.updateSchedule());
        this.nav.present(modal);
    }
  }

  goToSessionDetail(sessionData) {
    // go to the session detail page
    // and pass in the session data
    this.nav.push(SessionDetailPage, sessionData);
  }

  addFavorite(slidingItem, sessionData) {

    if (this.user.hasFavorite(sessionData.name)) {
      // They already favorited it! What should we do?
      // create an alert instance
      let alert = Alert.create({
        title: 'Favorite already added',
        message: 'Would you like to remove this session from your favorites?',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              // they clicked the cancel button, do not remove the session
              // close the sliding item and hide the option buttons
              slidingItem.close();
            }
          },
          {
            text: 'Remove',
            handler: () => {
              // they want to remove this session from their favorites
              this.user.removeFavorite(sessionData.name);

              // close the sliding item and hide the option buttons
              slidingItem.close();
            }
          }
        ]
      });
      // now present the alert on top of all other content
      this.nav.present(alert);

    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.name);

      // create an alert instance
      let alert = Alert.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }
      });
      // now present the alert on top of all other content
      this.nav.present(alert);
    }

  }

}
