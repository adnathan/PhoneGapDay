window.nativeUIEnabled = true;
window.firstLoad = true;

function initializeApp() {
    if (nativeUIEnabled) {
        // Surround the WebView with native UI
        ace.load("native://app.xaml", function (page) {
            // Replace the root UI with the loaded native page
            ace.getHostPage().setContent(page);

            // Reparent the WebView inside the native page
            page.setContent(ace.getHostWebView());

            // Save the page for changing its title later
            window.nativePage = page;
        });
    }

    if (ace.platform == "Android") {
        setupWidget();
    }
}

function onTabClick(tab, index) {
    // Update the page title
    window.nativePage.setTitle(tab.getLabel());

    // Open the correct tab based on the native tab click
    window.conferenceApp.openPage(window.tabPages[index]);
}

function presentFilter(onApply) {
    // Navigate to the filter page
    ace.navigate("native://schedule-filter.xaml", function(page) {
        var excludeTracks = [];
        if (window.localStorage["excludeTracks"]) {
           excludeTracks = JSON.parse(window.localStorage["excludeTracks"]);
        }

        // Retrieve the list from the new page
        var list = page.findName("list");

        // Retrieve the done button and attach a click handler
        page.findName("doneButton").addEventListener("click", function() {
            // Build up a list of excluded tracks
            var newExcludeTracks = new Array();
            var items = list.getItems();
            for (var i = 0; i < items.size(); i++) {
                if (items.get(i) instanceof ace.ToggleSwitch) {
                    if (!items.get(i).getIsOn()) {
                        newExcludeTracks.push(items.get(i).getHeader());
                    }
                }
            }

            // Save the new filter
            window.localStorage["excludeTracks"] = JSON.stringify(newExcludeTracks);

            // Navigate back to the page with the WebView
            ace.goBack();

            // Refresh the schedule page so it loads the new data
            window.conferenceApp.openPage(window.tabPages[0]);
        });

        // Populate the list with cross-platform UI controls

        // A simple text label
        var listBoxItem = new ace.ListBoxItem();
        listBoxItem.setContent("Tracks");
        list.getItems().add(listBoxItem);

        // A ToggleSwitch for each track
        window.confData.getTracks().then(function(trackNames) {
            for (var i = 0; i < trackNames.length; i++) {
                var trackName = trackNames[i];

                var toggleSwitch = new ace.ToggleSwitch();
                toggleSwitch.setHeader(trackName);
                toggleSwitch.setIsOn(excludeTracks.indexOf(trackName) === -1);
                toggleSwitch.setPadding(18);

                list.getItems().add(toggleSwitch);
            }

            // A button that unchecks all ToggleSwitches
            var b1 = new ace.Button();
            b1.setContent("Deselect All");
            b1.addEventListener("click", function () {
                var items = list.getItems();
                // Skip the label and the two buttons
                for (var i = 1; i < items.size() - 2; i++)
                    items.get(i).setIsOn(false);
            });
            list.getItems().add(b1);

            // A button that checks all ToggleSwitches
            var b2 = new ace.Button();
            b2.setContent("Select All");
            b2.addEventListener("click", function () {
                var items = list.getItems();
                // Skip the label and the two buttons
                for (var i = 1; i < items.size() - 2; i++)
                    items.get(i).setIsOn(true);
            });
            list.getItems().add(b2);
        });
    });
}

function onMyRatingsLoad(page) {
    // Retrieve the list from the new page
    var list = page.findName("list");

    // Populate the list with cross-platform UI controls

    var numRatings = 0;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage[key];
        if (key.indexOf("rating:") == 0) {
            var item = new ace.ListBoxItem();
            var stars = "";
            var rating = Number(value);
            for (var j = 0; j < rating; j++) {
                stars += "\u2605"; // star
            }
            var stackPanel = new ace.StackPanel();
            stackPanel.setMargin(18);
            stackPanel.setOrientation("horizontal");

            var starsText = new ace.TextBlock();
            starsText.setText(stars);
            // Choose different values for each platform:
            starsText.setPadding(ace.valueOn({ android: 0,  ios: 18 }));
            starsText.setWidth(  ace.valueOn({ android: 80, ios: 85 }));
            stackPanel.getChildren().add(starsText);

            var nameText = new ace.TextBlock();
            nameText.setText(key.substring("rating:".length));
            stackPanel.getChildren().add(nameText);
 
            list.getItems().add(stackPanel);
            numRatings++;
        }
    }

    if (numRatings == 0) {
        var item = new ace.ListBoxItem();
        item.setContent("You have not rated anything.");
        list.getItems().add(item);
    }
}

function deleteAllRatings(appBarButton) {
    var ratingsToDelete = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.indexOf("rating:") == 0) {
            ratingsToDelete.push(key);
        }
    }

    for (var i = 0; i < ratingsToDelete.length; i++) {
        localStorage.removeItem(ratingsToDelete[i]);
    }

    var list = appBarButton.findName("list");
    list.getItems().clear();
    var item = new ace.ListBoxItem();
    item.setContent("Your ratings have been deleted.");
    list.getItems().add(item);
}

function setupWidget() {
    // Handle the app being resumed by a widget click:
    ace.addEventListener("android.intentchanged", checkForWidgetActivation);

    if (!window.confData) {
        throw new Error("The Ionic app content is missing");
    }

    // Fill the widget with schedule info
    ace.android.appWidget.clear();
    var days = window.confData.data.schedule;
    for (var day = 0; day < days.length; day++) {
        for (var group = 0; group < days[day].groups.length; group++) {
            var groupLabel = days[day].groups[group].time.toUpperCase();

            // Add the group item
            ace.android.appWidget.add(groupLabel);

            var sessions = days[day].groups[group].sessions;
            for (var session = 0; session < sessions.length; session++) {
                var s = sessions[session];
                var label = s.name + "\n" + s.timeStart + " - " + s.timeEnd;

                // Add the event item
                ace.android.appWidget.add(label);
            }
        }
    }
}

function checkForWidgetActivation() {
    if (ace.platform != "Android") {
        return;
    }

    ace.android.getIntent().invoke("getIntExtra", "widgetSelectionIndex", -1, function (value) {
        if (value != -1) {
            // We have the index of the session we need to show
            showSessionDetailByIndex(value);

            // Show a toast, just for fun
            ace.NativeObject.getField("android.widget.Toast", "LENGTH_SHORT", function(length_short) {
                ace.NativeObject.invoke("android.widget.Toast", "makeText", ace.android.getActivity(),
                                         "Here's the event", length_short, function(toast) {
                    toast.invoke("show");
                });
            });
        }
    });
}

function showSessionDetailByIndex(index) {
    var i = 0;
    var days = window.confData.data.schedule;
    for (var day = 0; day < days.length; day++) {
        for (var group = 0; group < days[day].groups.length; group++) {
            // Group item: just ignore if this was the one clicked
            i++;
            var sessions = days[day].groups[group].sessions;
            for (var session = 0; session < sessions.length; session++) {
                var s = sessions[session];
                if (i == index) {
                    if (window.schedulePage) {
                        window.schedulePage.goToSessionDetail(s);
                    }
                    return;
                }
                i++;
            }
        }
    }
}

function showSessionDetailByName(name) {
    var days = window.confData.data.schedule;
    for (var day = 0; day < days.length; day++) {
        for (var group = 0; group < days[day].groups.length; group++) {
            var sessions = days[day].groups[group].sessions;
            for (var session = 0; session < sessions.length; session++) {
                var s = sessions[session];
                if (s.name == name) {
                    if (window.schedulePage) {
                        window.schedulePage.goToSessionDetail(s);
                    }
                    return;
                }
                i++;
            }
        }
    }
}

function showNativeNavBar() {
    if (ace.platform == "iOS") {
        // Workaround for iOS Ionic UI. Always use native navbar + tabs instead.
        return true;
    }
    else {
        return window.nativeUIEnabled;
    }
}

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        //
        // Workaround for iOS Ionic UI. Always use native navbar + tabs:
        //
        if (ace.platform == "iOS" && !window.nativeUIEnabled) {
            // Surround the WebView with native UI
            ace.load("native://app.xaml", function (page) {
                // Replace the root UI with the loaded native page
                ace.getHostPage().setContent(page);

                // Reparent the WebView inside the native page
                page.setContent(ace.getHostWebView());

                // Save the page for changing its title later
                window.nativePage = page;
            });
        }

        initializeApp();
    };

    function onPause() {
        // This application has been suspended. Save application state here.
    };

    function onResume() {
        // This application has been reactivated. Restore application state here.
    };
})();