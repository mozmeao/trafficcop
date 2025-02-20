(function () {
    'use strict';

    var variants = {
        a: 30,
        b: 30,
        c: 30
    };

    function setVariationCookie(exp) {
        // set cookie to expire in 24 hours
        var date = new Date();
        date.setTime(date.getTime() + 1 * 24 * 60 * 60 * 1000);
        var expires = date.toUTCString();

        window.Mozilla.Cookies.setItem(
            exp.id,
            exp.chosenVariation,
            expires,
            undefined,
            undefined,
            false,
            'lax'
        );
    }

    function handleVariation(variation) {
        // wait until DOM is ready to be manipulated...
        domReady(function () {
            // make sure variation is one we are expecting (and not noVariationValue)
            if (Object.prototype.hasOwnProperty.call(variants, variation)) {
                var target = document.getElementById('var-' + variation);
                target.classList.remove('hidden');
            }
        });
    }

    // non-jquery document ready function
    // http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
    function domReady(callback) {
        document.readyState === 'interactive' ||
        document.readyState === 'complete'
            ? callback()
            : document.addEventListener('DOMContentLoaded', callback);
    }

    var wiggum = new window.TrafficCop({
        id: 'my-experiment-id-2',
        customCallback: handleVariation,
        variations: variants
    });

    wiggum.init();

    setVariationCookie(wiggum);
})();
