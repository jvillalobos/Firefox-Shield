/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

function install(aData, aReason) {}

function uninstall(aData, aReason) {}

function startup(aData, aReason) {
  Components.utils.import("resource://gre/modules/Services.jsm");
  Components.utils.import("chrome://settingsguard/content/common.jsm");

  // No windows are opened yet at startup.
  if (APP_STARTUP == aReason) {
    let observer = {
        observe : function(aSubject, aTopic, aData) {
          if ("domwindowopened" == aTopic) {
            Services.ww.unregisterNotification(observer);

            let window =
              aSubject.QueryInterface(Components.interfaces.nsIDOMWindow);
            // wait for the window to load so that the SG window appears on top.
            window.addEventListener(
              "load", function() { SettingsGuard.checkPrefs(window); }, false);
          }
        }
      };

    Services.ww.registerNotification(observer);
  } else {
    SettingsGuard.checkPrefs(
      Services.wm.getMostRecentWindow("navigator:browser"));
  }
}

function shutdown(aData, aReason) {
  Components.utils.unload("resource://gre/modules/Services.jsm");
  Components.utils.unload("chrome://settingsguard/content/common.jsm");
}
