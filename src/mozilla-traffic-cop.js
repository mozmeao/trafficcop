/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Traffic Cop traffic redirect helper for A/B/x testing
 *
 * Example usage:
 *
 * const cop = new TrafficCop({
 *     id: 'my-experiment-cookie-id',
 *     variations: {
 *         'v=1': 25,
 *         'v=2': 25,
 *         'v=3': 25
 *     }
 * });
 *
 * cop.init();
 *
 *
 * @param Object config: Object literal containing the following:
 *      [String] id (optional): Unique string ID for cookie identification.
 *          Only needs to be unique to other currently running tests.
 *      [Function] customCallback (optional): Arbitrary function to run when
 *          a variation (or lack thereof) is chosen. This function will be
 *          passed the variation value (if chosen), or the value of
 *          noVariationValue if no variation was chosen. *Specifying this
 *          function means no redirect will occur.*
 *      Object variations (required): Object holding key/value pairs of
 *          variations and their respective traffic percentages. Example:
 *
 *          variations: {
 *              'v=1': 20,
 *              'v=2': 20,
 *              'v=3': 20
 *          }
 */
const TrafficCop = function (config) {
    'use strict';

    // make sure config is an object
    this.config = typeof config === 'object' ? config : {};

    // store cookie id
    this.id = this.config.id;

    // store variations
    this.variations = this.config.variations;

    // store total percentage of users targeted
    this.totalPercentage = 0;

    // store custom callback function (if supplied)
    this.customCallback =
        typeof this.config.customCallback === 'function'
            ? this.config.customCallback
            : null;

    this.chosenVariation = null;

    // calculate and store total percentage of variations
    for (const v in this.variations) {
        if (
            Object.prototype.hasOwnProperty.call(this.variations, v) &&
            typeof this.variations[v] === 'number'
        ) {
            // multiply by 100 to allow for percentages to the hundredth
            // (and avoid floating point math errors)
            this.totalPercentage += this.variations[v] * 100;
        }
    }

    this.totalPercentage = this.totalPercentage / 100;

    return this;
};

TrafficCop.noVariationValue = 'no-variation';

/*
 * Initialize the traffic cop. Validates variations, ensures user is not
 * currently viewing a variation, and (possibly) redirects to a variation
 */
TrafficCop.prototype.init = function () {
    // make sure config is valid (id & variations present)
    if (this.verifyConfig()) {
        // determine which (if any) variation to choose for this user/experiment
        this.chosenVariation = TrafficCop.chooseVariation(
            this.id,
            this.variations,
            this.totalPercentage
        );

        // developer specified callback takes precedence
        if (this.customCallback) {
            this.initiateCustomCallbackRoutine();
            // if no customCallback is supplied, initiate redirect routine
        } else {
            this.initiateRedirectRoutine();
        }
    }
};

/*
 * Executes the logic around firing the custom callback specified by the
 * developer.
 */
TrafficCop.prototype.initiateCustomCallbackRoutine = function () {
    // invoke the developer supplied callback, passing in the chosen variation
    this.customCallback(this.chosenVariation);
};

/*
 * Executes logic around determining variation to which the visitor will be
 * redirected. May result in no redirect.
 */
TrafficCop.prototype.initiateRedirectRoutine = function () {
    let redirectUrl;

    // make sure current page doesn't match a variation
    // (avoid infinite redirects)
    if (!TrafficCop.isRedirectVariation(this.variations)) {
        // roll the dice to see if user should be send to a variation
        redirectUrl = TrafficCop.generateRedirectUrl(this.chosenVariation);

        // if we get a variation, perform the redirect
        if (redirectUrl) {
            TrafficCop.performRedirect(redirectUrl);
        }
    }
};

/*
 * Ensures variations were provided and in total capture between 1 and 99%
 * of users.
 */
TrafficCop.prototype.verifyConfig = function () {
    // make sure totalPercent is between 0 and 100
    if (this.totalPercentage === 0 || this.totalPercentage > 100) {
        return false;
    }

    return true;
};

/*
 * Checks to see if user is currently viewing a variation.
 */
TrafficCop.isRedirectVariation = function (variations, queryString) {
    let isVariation = false;
    queryString = queryString || window.location.search;

    // check queryString for presence of variation
    for (var v in variations) {
        if (
            queryString.indexOf('?' + v) > -1 ||
            queryString.indexOf('&' + v) > -1
        ) {
            isVariation = true;
            break;
        }
    }

    return isVariation;
};

/**
 * Get the cookie value for a given ID.
 * Hat tip to https://github.com/mozmeao/cookie-helper
 * @param {String} cookie id
 * @returns {String|null} cookie value
 */
TrafficCop.getCookie = function (id) {
    if (typeof id !== 'string') {
        return null;
    }

    try {
        return (
            decodeURIComponent(
                document.cookie.replace(
                    new RegExp(
                        '(?:(?:^|.*;)\\s*' +
                            encodeURIComponent(id).replace(/[-.+*]/g, '\\$&') +
                            '\\s*\\=\\s*([^;]*).*$)|^.*$'
                    ),
                    '$1'
                )
            ) || null
        );
    } catch (e) {
        return null;
    }
};

TrafficCop.hasVariationCookie = function (id, variations) {
    const cookie = TrafficCop.getCookie(id);

    if (
        cookie &&
        (variations[cookie] || cookie === TrafficCop.noVariationValue)
    ) {
        return true;
    } else {
        return false;
    }
};

/*
 * Returns the variation chosen for the current user/experiment.
 */
TrafficCop.chooseVariation = function (id, variations, totalPercentage) {
    let random;
    let runningTotal;
    let choice = TrafficCop.noVariationValue;

    // check to see if user has a cookie from a previously visited variation
    // also make sure variation in cookie is still valid (you never know)
    if (TrafficCop.hasVariationCookie(id, variations)) {
        choice = TrafficCop.getCookie(id);
    } else {
        // conjure a random float between 1 and 100 (inclusive)
        random = Math.floor(Math.random() * 10000) + 1;
        random = random / 100;

        // make sure random number falls in the distribution range
        if (random <= totalPercentage) {
            runningTotal = 0;

            // loop through all variations
            for (const v in variations) {
                // check if random number falls within current variation range
                if (random <= variations[v] + runningTotal) {
                    // if so, we have found our variation
                    choice = v;
                    break;
                }

                // tally variation percentages for the next loop iteration
                runningTotal += variations[v];
            }
        }
    }

    return choice;
};

/*
 * Generates a random percentage (between 1 and 100, inclusive) and determines
 * which (if any) variation should be matched.
 */
TrafficCop.generateRedirectUrl = function (chosenVariation, url) {
    let hash;
    let redirect;
    let urlParts;

    // url parameter only supplied for unit tests
    url = url || window.location.href;

    // strip hash from URL (if present)
    if (url.indexOf('#') > -1) {
        urlParts = url.split('#');
        url = urlParts[0];
        hash = urlParts[1];
    }

    // if a variation was chosen, construct a new URL
    if (chosenVariation !== TrafficCop.noVariationValue) {
        redirect = url + (url.indexOf('?') > -1 ? '&' : '?') + chosenVariation;

        // re-insert hash (if originally present)
        if (hash) {
            redirect += '#' + hash;
        }
    }

    return redirect;
};

TrafficCop.performRedirect = function (redirectURL) {
    window.location.href = redirectURL;
};

module.exports = TrafficCop;
