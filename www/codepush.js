(function() {
    function displayMessage(msg) {
        navigator.notification.alert(msg, function() {}, 'App Update', 'Dismiss');
    }

    window.doCodePush = function(cb) {
        window.codePush.sync(
            function(syncStatus) {
                switch (syncStatus) {
                    // Result (final) statuses
                    case SyncStatus.UPDATE_INSTALLED:
                        // For InstallMode.ON_NEXT_RESTART, the changes will be visible after application restart.
                        displayMessage("An update was installed successfully.");
                        break;
                    case SyncStatus.UP_TO_DATE:
                        displayMessage("The application is up to date.");
                        break;
                    case SyncStatus.UPDATE_IGNORED:
                        displayMessage("The optional update was ignored.");
                        break;
                    case SyncStatus.ERROR:
                        displayMessage("An error occured while checking for updates.");
                        break;

                    // Intermediate (non final) statuses
                    case SyncStatus.CHECKING_FOR_UPDATE:
                        console.log("Checking for update...");
                        break;
                    case SyncStatus.AWAITING_USER_ACTION:
                        console.log("Alerting user...");
                        break;
                    case SyncStatus.DOWNLOADING_PACKAGE:
                        console.log("Downloading package...");
                        break;
                    case SyncStatus.INSTALLING_UPDATE:
                        console.log("Installing update...");
                        break;
                }
                cb(syncStatus);
            }, {
                installMode: InstallMode.IMMEDIATE,
                updateDialog: true
            },
            function(downloadProgress) {
                console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes + " bytes...");
            });

    };

}());
