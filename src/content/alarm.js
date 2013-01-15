/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("chrome://settingsguard/content/common.jsm");

let SGAlarm = {

  init : function() {
    document.getElementById("homepage-box").hidden = !SettingsGuard.homepageChanged;
    document.getElementById("homepage").checked = SettingsGuard.homepageChanged;
    document.getElementById("newtab-url-box").hidden = !SettingsGuard.newTabURLChanged;
    document.getElementById("newtab-url").checked = SettingsGuard.newTabURLChanged;
    document.getElementById("keyword-url-box").hidden = !SettingsGuard.keywordURLChanged;
    document.getElementById("keyword-url").checked = SettingsGuard.keywordURLChanged;
    document.getElementById("user-agent-box").hidden = !SettingsGuard.userAgentChanged;
    document.getElementById("user-agent").checked = SettingsGuard.userAgentChanged;

    if (SettingsGuard.homepageChanged) {
      document.getElementById("homepage-value").value = SettingsGuard.homepage;
    }

    if (SettingsGuard.newTabURLChanged) {
      document.getElementById("newtab-url-value").value = SettingsGuard.newTabURL;
    }

    if (SettingsGuard.keywordURLChanged) {
      document.getElementById("keyword-url-value").value = SettingsGuard.keywordURL;
    }

    if (SettingsGuard.userAgentChanged) {
      document.getElementById("user-agent-value").value = SettingsGuard.userAgent;
    }
  },

  accept : function() {
    SettingsGuard.maybeResetPrefs(
      document.getElementById("homepage").checked,
      document.getElementById("newtab-url").checked,
      document.getElementById("keyword-url").checked,
      document.getElementById("user-agent").checked);

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
  "load", function() { SGAlarm.init(); }, false);
