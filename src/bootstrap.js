/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;

let timer;

function install(aData, aReason) {}

function uninstall(aData, aReason) {}

function startup(aData, aReason) {
  Components.utils.import("chrome://firefoxshield/content/fsCommon.js");
  // wait a few seconds for the browser to start (we need a browser window to
  // be open).
  const RUN_DELAY = 5 * 1000;

  timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback(
    { notify : function() { FirefoxShield.checkPrefs(); } }, RUN_DELAY,
    Ci.nsITimer.TYPE_ONE_SHOT);
}

function shutdown(aData, aReason) {
}
