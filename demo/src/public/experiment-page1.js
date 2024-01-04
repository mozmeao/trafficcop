(function () {
    'use strict';

    var eddie = new window.TrafficCop({
        variations: {
            'v=1': 40.5,
            'v=2': 20.3,
            'v=3': 10.45,
            'v=4': 10.16,
            'v=5': 3.75,
            'v=6': 0.1
        }
    });

    eddie.init();
})();
