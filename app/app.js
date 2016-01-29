import {App, IonicApp, Platform} from 'ionic/ionic';
import {ConferenceData} from './providers/conference-data';
import {UserData} from './providers/user-data';
import {TabsPage} from './pages/tabs/tabs';
import {LoginPage} from './pages/login/login';
import {SignupPage} from './pages/signup/signup';

import {SchedulePage} from './pages/schedule/schedule';
import {SpeakerListPage} from './pages/speaker-list/speaker-list';
import {MapPage} from './pages/map/map';
import {AboutPage} from './pages/about/about';

@App({
  templateUrl: 'build/app.html',
  providers: [ConferenceData, UserData],
  config: {}
})
class ConferenceApp {
  constructor(app: IonicApp, confData: ConferenceData, platform: Platform) {
    this.app = app;

    // load the conference data
    confData.load();

    // Show the Ionic tabs if we're not running on iOS
    // (as iOS always shows native tabs as a workaround)
    // and if we're told not to show native UI 
    if (!platform.is("ios") && !window.nativeUIEnabled) {
        this.root = TabsPage;
    }

    // create an list of pages that can be navigated to from the left menu
    // the left menu only works after login
    // the login page disables the left menu
    this.pages = [
      { title: 'Schedules', component: TabsPage, icon: 'calendar' },
      { title: 'Login', component: LoginPage, icon: 'log-in' },
      { title: 'Signup', component: SignupPage, icon: 'person-add' },
      { title: 'Logout', component: LoginPage, icon: 'log-out' },
    ];

    // Make this available to ace.js:
    window.conferenceApp = this;
    window.confData = confData;
    window.tabPages = [SchedulePage, SpeakerListPage, MapPage, AboutPage];
  }

  openPage(page) {
    // find the nav component and set what the root page should be
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    let nav = this.app.getComponent('nav');
    nav.setRoot(page).then(() => {
      // wait for the root page to be completely loaded
      // then close the menu
      // No side menu for now: this.app.getComponent('leftMenu').close();
    });
  }
}
