(function () {
    'use strict';

    var variants = {
        a: 40,
        b: 40
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
        if (Object.prototype.hasOwnProperty.call(variants, variation)) {
            var target = document.getElementById('var-' + variation);
            target.classList.remove('hidden');
        }
    }

    var wiggum = new window.TrafficCop({
        id: 'my-experiment-id-3',
        customCallback: handleVariation,
        variations: variants
    });

    wiggum.init();

    setVariationCookie(wiggum);
})();
