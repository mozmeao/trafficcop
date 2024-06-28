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

    var cop = new window.TrafficCop({
        id: 'my-experiment-id-1',
        variations: {
            'v=1': 40.5,
            'v=2': 20.3,
            'v=3': 10.45,
            'v=4': 10.16,
            'v=5': 3.75,
            'v=6': 0.1
        }
    });
    cop.init();

    setVariationCookie(cop);
})();
