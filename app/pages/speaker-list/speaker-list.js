import {NavController, Page, ActionSheet} from 'ionic/ionic';
import {ConferenceData} from '../../providers/conference-data';
import {SpeakerDetailPage} from '../speaker-detail/speaker-detail';
import {SessionDetailPage} from '../session-detail/session-detail';


@Page({
  templateUrl: 'build/pages/speaker-list/speaker-list.html'
})
export class SpeakerListPage {
  constructor(nav: NavController, confData: ConferenceData) {
    this.nav = nav;
    this.confData = confData;
    this.speakers = [];

    confData.getSpeakers().then(speakers => {
      this.speakers = speakers;
    });
  }

  onPageLoaded() {
      if (!window.showNativeNavBar()) {
        var elements = window.document.getElementsByClassName("nav-bar-dynamic");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "block";
        }
      }
  }

  goToSessionDetail(session) {
    this.nav.push(SessionDetailPage, session);
  }

  goToSpeakerDetail(speakerName) {
    this.nav.push(SpeakerDetailPage, speakerName);
  }

  goToSpeakerTwitter(speaker) {
    window.open(`https://twitter.com/${speaker.twitter}`);
  }
}
