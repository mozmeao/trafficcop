(function () {
    'use strict';

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

    var lou = new window.TrafficCop({
        id: 'my-experiment-id-4',
        variations: {
            'v=a': 40,
            'v=b': 40
        }
    });

    lou.init();

    setVariationCookie(lou);
})();
