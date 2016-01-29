import {Page, NavParams, ViewController} from 'ionic/ionic';
import {ConferenceData} from '../../providers/conference-data';


@Page({
  templateUrl: 'build/pages/schedule-filter/schedule-filter.html'
})
export class ScheduleFilterPage {
  constructor(confData: ConferenceData, navParams: NavParams, viewCtrl: ViewController) {
    this.confData = confData;
    this.navParams = navParams;
    this.viewCtrl = viewCtrl;
    this.tracks = [];

    // array of tracks that should be excluded (unchecked)
    let excludeTracks = [];
    if (window.localStorage["excludeTracks"]) {
       excludeTracks = JSON.parse(window.localStorage["excludeTracks"]);
    }

    this.confData.getTracks().then(trackNames => {

      trackNames.forEach(trackName => {
        this.tracks.push({
          name: trackName,
          isChecked: (excludeTracks.indexOf(trackName) === -1)
        });
      });

    });
  }

  deselectFilters() {
    // turn off all of the toggles
    this.tracks.forEach(track => {
      track.isChecked = false;
    });
  }

  resetFilters() {
    // reset all of the toggles to be checked
    this.tracks.forEach(track => {
      track.isChecked = true;
    });
  }

  applyFilters() {
    // Save a new array of track names to exclude
    window.localStorage["excludeTracks"] = JSON.stringify(this.tracks.filter(c => !c.isChecked).map(c => c.name));
    this.dismiss();
  }

  dismiss() {
    // using the injected ViewController this page
    // can "dismiss" itself
    this.viewCtrl.dismiss();
  }
}
