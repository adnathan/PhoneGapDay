import {Page} from 'ionic/ionic';


@Page({
  templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {
  onPageLoaded() {
    this.codePushStatus = 'Check for App Update';
    this.showPhoneInfo();

    if (window.nativeUIEnabled) {
      // Show the link to the native UI page (my-ratings)
      var elements = window.document.getElementsByClassName("view-ratings");
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
      }
    }

    if (!window.showNativeNavBar()) {
      // Show the HTML navbar, since the native one isn't shown
      var elements = window.document.getElementsByClassName("nav-bar-dynamic");
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
      }
    }
  }

  checkForAppUpdate() {
    this.codePushStatus = 'Checking for Updates...';
    window.doCodePush((syncStatus) => {
      this.codePushStatus = 'Check for App Update';
    });
  }

  showPhoneInfo() {
    // Invoke some native APIs directly.

    // You can do this with your own native code in the native folder, too.
    // For example:
    // var obj = new window.ace.NativeObject("MyClass");
    // obj.invoke("myInstanceMethod", myParam1, myParam2, (returnValue) => {});

    if (window.ace.platform == "iOS") {
      // Show "This Phone: <model> (<name>)"
      window.ace.NativeObject.invoke("UIDevice", "currentDevice", (device) => {
        device.invoke("model", (model) => {
          device.invoke("name", (name) => { this.updatePhoneText(model + " (" + name + ")"); });
        });
      });
    } else if (window.ace.platform == "Android") {
      // Show "This Phone: <model>"
      window.ace.NativeObject.getField("android.os.Build", "MODEL", (model) => {
        this.updatePhoneText(model);
      });
    }
  }

  updatePhoneText(text) {
      var elements = window.document.getElementsByClassName("phone-info");
      for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = "This Phone: " + text;
      }
  }
}
