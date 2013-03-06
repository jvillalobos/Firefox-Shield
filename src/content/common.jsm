/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

Components.utils.import("resource://gre/modules/Services.jsm");

var EXPORTED_SYMBOLS = [ "SettingsGuard" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

const PREF_HOMEPAGE = "browser.startup.homepage";
const PREF_NEW_TAB_URL = "browser.newtab.url";
const PREF_KEYWORD_URL = "keyword.URL";
const PREF_USER_AGENT = "general.useragent.override";
const PREF_BACKUP_PREFIX = "extensions.settingsguard.backup.";
const PREF_WINDOW_SHOWN = "extensions.settingsguard.windowShown";

const CUSTOM_HOMEPAGES_RE =
  /http(s)?:\/\/([^\/]+\.)?(searchqu|babylon|searchfunmoods|claro-search)\.com/;

let consoleService;

let SettingsGuard = {

  get homepage() {
    return getPref(PREF_HOMEPAGE);
  },

  get homepageChanged() {
    return hasChanged(PREF_HOMEPAGE);
  },

  get newTabURL() {
    return getPref(PREF_NEW_TAB_URL);
  },

  get newTabURLChanged() {
    return hasChanged(PREF_NEW_TAB_URL);
  },

  get keywordURL() {
    return getPref(PREF_KEYWORD_URL);
  },

  get keywordURLChanged() {
    return hasChanged(PREF_KEYWORD_URL);
  },

  get userAgent() {
    return getPref(PREF_USER_AGENT);
  },

  get userAgentChanged() {
    return hasChanged(PREF_USER_AGENT);
  },

  /**
   * Checks for changes in the preferences we monitor.
   */
  checkPrefs : function(aWindow) {
    // log("Checking for preference changes.");

    if (this.homepageChanged || this.newTabURLChanged ||
        this.keywordURLChanged || this.userAgentChanged) {
      /* log(
        "Preferences changed. Homepage: " + prefChanges.homepage +
        ", keyword URL: " +  prefChanges.keywordURL + ", new tab URL: " +
        prefChanges.newTabURL + ", user agent: " + prefChanges.userAgent); */

      // Since we're showing the preference reset window, don't show the success
      // window next time, after the reset.
      Services.prefs.setBoolPref(PREF_WINDOW_SHOWN, true);
      aWindow.openDialog(
        "chrome://settingsguard/content/alarm.xul",
        "settingsguard-alarm",
        "chrome,titlebar,toolbar,centerscreen,dialog,resizable=no");
    } else {
      // If no preferences have been changed, show a message indicating it. The
      // pref is used to make sure the message is only shown once.
      let windowShown =
        Services.prefs.prefHasUserValue(PREF_WINDOW_SHOWN) &&
        Services.prefs.getBoolPref(PREF_WINDOW_SHOWN);

      if (!windowShown) {
        Services.prefs.setBoolPref(PREF_WINDOW_SHOWN, true);
        aWindow.openDialog(
          "chrome://settingsguard/content/copacetic.xul",
          "settingsguard-ok",
          "chrome,titlebar,toolbar,centerscreen,dialog,resizable=no");
      }
    }
  },

  /**
   * Resets the preferences if they have non-default values and they are chosen
   * by the user to be reset.
   */
  maybeResetPrefs : function(
    aResetHomepage, aResetNewTabURL, aResetKeywordURL, aResetUserAgent) {
    /*log("Resetting prefs. homepage: " + aResetHomepage +
        ", newTabURL: " + aResetNewTabURL + ", keywordURL: " + aResetKeywordURL +
        ", userAgent: " + aResetUserAgent);*/

    if (this.homepageChanged) {
      maybeResetPref(PREF_HOMEPAGE, aResetHomepage);
    }

    if (this.newTabURLChanged) {
      maybeResetPref(PREF_NEW_TAB_URL, aResetNewTabURL);
    }

    if (this.keywordURLChanged) {
      maybeResetPref(PREF_KEYWORD_URL, aResetKeywordURL);
    }

    if (this.userAgentChanged) {
      maybeResetPref(PREF_USER_AGENT, aResetUserAgent);
    }
  }
};

/**
 * Gets the value of the given preference.
 */
function getPref(aPrefName) {
  let value = null;

  if (PREF_HOMEPAGE != aPrefName) {
    value = Services.prefs.getCharPref(aPrefName);
  } else {
    value =
      Services.prefs.getComplexValue(aPrefName, Ci.nsIPrefLocalizedString).data;
  }

  return value;
}

/**
 * Checks if the pref has a default value. If it doesn't, it checks if we
 * stored its value in the backup preference, meaning that the user has
 * already decided not to reset it.
 */
function hasChanged(aPrefName) {
  let changed = false;

  if (Services.prefs.prefHasUserValue(aPrefName)) {
    if (PREF_HOMEPAGE != aPrefName) {
      changed =
        !Services.prefs.prefHasUserValue(PREF_BACKUP_PREFIX + aPrefName) ||
        getPref(aPrefName) != getPref(PREF_BACKUP_PREFIX + aPrefName);
    } else {
      let value = getPref(aPrefName);
      // only check for certain homepage values, since users often change it.
      if (value.match(CUSTOM_HOMEPAGES_RE)) {
        changed =
          !Services.prefs.prefHasUserValue(PREF_BACKUP_PREFIX + aPrefName) ||
          getPref(aPrefName) != getPref(PREF_BACKUP_PREFIX + aPrefName);
      }
    }

    // log("Changed " + aPrefName + ": " + changed +".");
  }

  return changed;
}

/**
 * Determines if a preference needs to be reset. If not, it stores a backup so
 * that it isn't requested for that preference value again.
 */
function maybeResetPref(aPrefName, aResetPref) {
  if (aResetPref) {
    Services.prefs.clearUserPref(aPrefName);
  } else {
    Services.prefs.setCharPref(
      PREF_BACKUP_PREFIX + aPrefName, getPref(aPrefName));
  }
}

function log(aText) {
  if (null == consoleService) {
    consoleService =
      Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
  }

  consoleService.logStringMessage(aText);
}
