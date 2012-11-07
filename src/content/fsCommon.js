/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var EXPORTED_SYMBOLS =
  [ "FirefoxShield", "PREF_HOMEPAGE", "PREF_NEW_TAB_URL", "PREF_KEYWORD_URL",
    "PREF_USER_AGENT" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

const PREF_HOMEPAGE = "browser.startup.homepage";
const PREF_NEW_TAB_URL = "browser.newtab.url";
const PREF_KEYWORD_URL = "keyword.URL";
const PREF_USER_AGENT = "general.useragent.override";
const PREF_BACKUP_PREFIX = "extensions.firefoxshield.backup.";
const PREF_WINDOW_SHOWN = "extensions.firefoxshield.windowShown";

const CUSTOM_HOMEPAGES_RE =
  /http(s)?:\/\/([^\/]+\.)?(searchqu|babylon|searchfunmoods)\.com/;

let prefs =
  Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
let consoleService;

let FirefoxShield = {
  /**
   * Checks for changes in the preferences we monitor.
   */
  checkPrefs : function() {
    // log("Checking for preference changes.");

    let wm =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    let win = wm.getMostRecentWindow("navigator:browser");

    let prefChanges =
      {
        homepage : hasChanged(PREF_HOMEPAGE),
        keywordURL : hasChanged(PREF_KEYWORD_URL),
        newTabURL : hasChanged(PREF_NEW_TAB_URL),
        userAgent : hasChanged(PREF_USER_AGENT)
      };

    if (prefChanges.homepage || prefChanges.keywordURL ||
        prefChanges.newTabURL || prefChanges.userAgent) {
      /* log(
        "Preferences changed. Homepage: " + prefChanges.homepage +
        ", keyword URL: " +  prefChanges.keywordURL + ", new tab URL: " +
        prefChanges.newTabURL + ", user agent: " + prefChanges.userAgent); */

      // Since we're showing the preference reset window, don't show the success
      // window next time, after the reset.
      prefs.setBoolPref(PREF_WINDOW_SHOWN, true);
      win.openDialog(
        "chrome://firefoxshield/content/fsAlarm.xul",
        "firefoxshield-alarm",
        "chrome,titlebar,toolbar,centerscreen,dialog,resizable=no",
        prefChanges);
    } else {
      // If no preferences have been changed, show a message indicating it. The
      // pref is used to make sure the message is only shown once.
      let windowShown =
        prefs.prefHasUserValue(PREF_WINDOW_SHOWN) &&
        prefs.getBoolPref(PREF_WINDOW_SHOWN);

      if (!windowShown) {
        prefs.setBoolPref(PREF_WINDOW_SHOWN, true);

        let promptService =
          Cc["@mozilla.org/embedcomp/prompt-service;1"].
            getService(Ci.nsIPromptService);
        let bundle =
          Cc["@mozilla.org/intl/stringbundle;1"].
            getService(Ci.nsIStringBundleService).
              createBundle("chrome://firefoxshield/locale/fsAlarm.properties");

        promptService.alert(
          win, bundle.GetStringFromName("firefoxshield.alert.title"),
          bundle.GetStringFromName("firefoxshield.alert.label"));
      }
    }
  },

  /**
   * Gets the value of the given preference.
   */
  getPref : function(aPrefName) {
    let value = null;

    if (PREF_HOMEPAGE != aPrefName) {
      value = prefs.getCharPref(aPrefName);
    } else {
      value = prefs.getComplexValue(aPrefName, Ci.nsIPrefLocalizedString).data;
    }

    return value;
  },

  /**
   * Determines if a preference needs to be reset. If not, it stores a backup so
   * that it isn't requested for that preference value again.
   */
  resetPref : function(aPrefName, aMustReset) {
    if (aMustReset) {
      prefs.clearUserPref(aPrefName);
    } else {
      prefs.setCharPref(
        PREF_BACKUP_PREFIX + aPrefName, prefs.getCharPref(aPrefName));
    }
  }
};

/**
 * Checks if the pref has a default value. If it doesn't, it checks if we
 * stored its value in the backup preference, meaning that the user has
 * already decided not to reset it.
 */
function hasChanged(aPrefName) {
  let changed = false;

  if (prefs.prefHasUserValue(aPrefName)) {
    if (PREF_HOMEPAGE != aPrefName) {
      changed =
        !prefs.prefHasUserValue(PREF_BACKUP_PREFIX + aPrefName) ||
        FirefoxShield.getPref(aPrefName) !=
        FirefoxShield.getPref(PREF_BACKUP_PREFIX + aPrefName);
    } else {
      let value = FirefoxShield.getPref(aPrefName);
      // only check for certain homepage values, since users often change it.
      if (value.match(CUSTOM_HOMEPAGES_RE)) {
        changed =
          !prefs.prefHasUserValue(PREF_BACKUP_PREFIX + aPrefName) ||
          FirefoxShield.getPref(aPrefName) !=
          FirefoxShield.getPref(PREF_BACKUP_PREFIX + aPrefName);
      }
    }

    // log("Changed " + aPrefName + ": " + changed +".");
  }

  return changed;
}

function log(aText) {
  if (null == consoleService) {
    consoleService =
      Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
  }

  consoleService.logStringMessage(aText);
}
