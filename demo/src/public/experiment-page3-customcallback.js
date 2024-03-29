(function () {
    'use strict';

    var variants = {
        a: 40,
        b: 40
    };

    function handleVariation(variation) {
        if (Object.prototype.hasOwnProperty.call(variants, variation)) {
            var target = document.getElementById('var-' + variation);
            target.classList.remove('hidden');
        }
    }

    var wiggum = new window.TrafficCop({
        customCallback: handleVariation,
        variations: variants
    });

    wiggum.init();
})();
