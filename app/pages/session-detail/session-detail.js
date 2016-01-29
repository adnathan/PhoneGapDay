import {NavController, Page, NavParams} from 'ionic/ionic';
import {SpeakerDetailPage} from '../speaker-detail/speaker-detail';

@Page({
  templateUrl: 'build/pages/session-detail/session-detail.html'
})
export class SessionDetailPage {
  constructor(nav: NavController, navParams: NavParams) {
    this.nav = nav;
    this.navParams = navParams;
    this.session = navParams.data;
  }

  onPageDidEnter() {
    if (!window.nativeUIEnabled)
        return;

    this.popup = new window.ace.Popup();

    if (window.ace.platform == "Android") {
        // Create a cross-platform Canvas
        var canvas = new window.ace.Canvas();

        // Create an Android-specific RatingBar
        var ratingBar = new window.ace.NativeObject("android.widget.RatingBar");
        // Only allow whole-star ratings (step size == 1)
        ratingBar.invoke("setStepSize", 1);

        // Initialize the rating to the previously-set value
        var existingRatingValue = window.localStorage.getItem("rating:" + this.session.name);
        if (existingRatingValue) {
            ratingBar.invoke("setRating", Number(existingRatingValue));
        }

        // Listen for rating changes
        ratingBar.addEventListener("setOnRatingBarChangeListener", function (bar, rating) { 
            window.localStorage.setItem("rating:" + this.session.name, rating);
        }.bind(this));

        // Place the RatingBar inside the Canvas (to constrain its size)
        canvas.getChildren().add(ratingBar);

        // Place the UI inside the popup
        this.popup.setPosition(10, 50);
        this.popup.setRect({x: 10, y: 50, width: 240, height: 50});
        this.popup.setContent(canvas);
    }
    else if (window.ace.platform == "iOS") {
        // Create an iOS-specific UISegmentedControl
        var segments = new window.ace.NativeObject("UISegmentedControl");

        // Add five segments filled with 1-5 star characters (\u2605 == star)
        segments.invoke("insertSegmentWithTitle:atIndex:animated:", "\u2605", 0, false);
        segments.invoke("insertSegmentWithTitle:atIndex:animated:", "\u2605\u2605", 1, false);
        segments.invoke("insertSegmentWithTitle:atIndex:animated:", "\u2605\u2605\u2605", 2, false);
        segments.invoke("insertSegmentWithTitle:atIndex:animated:", "\u2605\u2605\u2605\u2605", 3, false);
        segments.invoke("insertSegmentWithTitle:atIndex:animated:", "\u2605\u2605\u2605\u2605\u2605", 4, false);

        // Initialize the rating to the previously-set value
        var existingRatingValue = window.localStorage.getItem("rating:" + this.session.name);
        if (existingRatingValue) {
            segments.invoke("setSelectedSegmentIndex", Number(existingRatingValue) - 1);
        }

        // Listen for rating changes
        segments.addEventListener("UIControlEventValueChanged", function () {
            segments.invoke("selectedSegmentIndex", function(index) {
                window.localStorage.setItem("rating:" + this.session.name, index + 1);
            }.bind(this));
        }.bind(this));

        // Place the UI inside the popup
        this.popup.setRect({x: 8, y: 73, width: 397, height: 32});
        this.popup.setContent(segments);
    }

    // Reveal the popup
    this.popup.show();
  }

  onPageWillLeave() {
    if (this.popup) {
      this.popup.hide();
    }
  }

  goToSpeakerDetail(speakerName) {
      this.nav.push(SpeakerDetailPage, speakerName);
  }
}
