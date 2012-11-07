/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("chrome://firefoxshield/content/fsCommon.js");

let FSAlarm = {
  _prefs : null,

  init : function() {
    let prefChanges = window.arguments[0];

    this._prefs =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);

    document.getElementById("homepage-box").hidden = !prefChanges.homepage;
    document.getElementById("homepage").checked = prefChanges.homepage;
    document.getElementById("newtab-url-box").hidden = !prefChanges.newTabURL;
    document.getElementById("newtab-url").checked = prefChanges.newTabURL;
    document.getElementById("keyword-url-box").hidden = !prefChanges.keywordURL;
    document.getElementById("keyword-url").checked = prefChanges.keywordURL;
    document.getElementById("user-agent-box").hidden = !prefChanges.userAgent;
    document.getElementById("user-agent").checked = prefChanges.userAgent;

    if (prefChanges.homepage) {
      document.getElementById("homepage-value").value =
        FirefoxShield.getPref(PREF_HOMEPAGE);
    }

    if (prefChanges.newTabURL) {
      document.getElementById("newtab-url-value").value =
        FirefoxShield.getPref(PREF_NEW_TAB_URL);
    }

    if (prefChanges.keywordURL) {
      document.getElementById("keyword-url-value").value =
        FirefoxShield.getPref(PREF_KEYWORD_URL);
    }

    if (prefChanges.userAgent) {
      document.getElementById("user-agent-value").value =
        FirefoxShield.getPref(PREF_USER_AGENT);
    }
  },

  accept : function() {
    let prefChanges = window.arguments[0];

    if (prefChanges.homepage) {
      FirefoxShield.resetPref(
        PREF_HOMEPAGE, document.getElementById("homepage").checked);
    }

    if (prefChanges.newTabURL) {
      FirefoxShield.resetPref(
        PREF_NEW_TAB_URL, document.getElementById("newtab-url").checked);
    }

    if (prefChanges.keywordURL) {
      FirefoxShield.resetPref(
        PREF_KEYWORD_URL, document.getElementById("keyword-url").checked);
    }

    if (prefChanges.userAgent) {
      FirefoxShield.resetPref(
        PREF_USER_AGENT, document.getElementById("user-agent").checked);
    }

    return true;
  },

  _log : function (aText) {
    if (null == this._consoleService) {
      this._consoleService =
        Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
    }

    this._consoleService.logStringMessage(aText);
  }
};

window.addEventListener(
  "load", function() { FSAlarm.init(); }, false);
