/* For reference read the Jasmine and Sinon docs
 * Jasmine docs: http://pivotal.github.io/jasmine/
 * Sinon docs: http://sinonjs.org/docs/
 */

/* global sinon */

import TrafficCop from '../dist/index';
import CookieHelper from '@mozmeao/cookie-helper';

describe('mozilla-traffic-cop.js', function () {
    'use strict';

    beforeEach(function () {
        // actual redirect shouldn't happen in tests
        TrafficCop.performRedirect = sinon.stub();
    });

    describe('TrafficCop instantiation defaults', function () {
        it('should store supplied config', function () {
            const config = {
                variations: {
                    'v=1': 25,
                    'v=2': 15,
                    'v=3': 5
                }
            };
            const cop = new TrafficCop(config);
            expect(cop.config).toEqual(config);
        });

        it('should default to an empty object if supplied config is not an object', function () {
            const config = 'purple-monkey-dishwasher';

            const cop = new TrafficCop(config);
            expect(cop.config).toEqual({});
        });

        it('should store supplied customCallback', function () {
            const funkyFunc = sinon.stub();
            const cop = new TrafficCop({
                customCallback: funkyFunc
            });
            expect(cop.customCallback).toEqual(funkyFunc);
        });

        it('should default customCallback to null if not supplied', function () {
            const cop = new TrafficCop();
            expect(cop.customCallback).toEqual(null);
        });

        it('should set customCallback to null if not supplied with a function', function () {
            const cop = new TrafficCop({
                customCallback: 'not-a-function'
            });
            expect(cop.customCallback).toEqual(null);
        });

        it('should calculate totalPercentage based off supplied variations', function () {
            const cop = new TrafficCop({
                variations: {
                    'v=1': 25,
                    'v=2': 15,
                    'v=3': 5
                }
            });
            expect(cop.totalPercentage).toEqual(45);
        });

        it('should handle variation percentages in the tenths', function () {
            const cop = new TrafficCop({
                variations: {
                    'v=1': 10.4,
                    'v=2': 0.2,
                    'v=3': 7,
                    'v=4': 0.1
                }
            });
            expect(cop.totalPercentage).toEqual(17.7);
        });

        it('should handle variation percentages in the hundredths', function () {
            const cop = new TrafficCop({
                variations: {
                    'v=1': 9.04,
                    'v=2': 10.25,
                    'v=3': 27.3,
                    'v=4': 0.1
                }
            });
            expect(cop.totalPercentage).toEqual(46.69);
        });
    });

    describe('TrafficCop.init customCallback', function () {
        it('should call customCallback when specified', function () {
            const cop = new TrafficCop({
                customCallback: sinon.stub(),
                variations: {
                    a: 30,
                    b: 30
                }
            });

            spyOn(TrafficCop, 'chooseVariation').and.returnValue('a');
            spyOn(cop, 'customCallback');

            cop.init();

            expect(cop.customCallback).toHaveBeenCalledWith('a');
        });

        it('should not attempt a redirect if customCallback is specified', function () {
            const cop = new TrafficCop({
                customCallback: sinon.stub(),
                variations: {
                    a: 30,
                    b: 30
                }
            });

            spyOn(TrafficCop, 'generateRedirectUrl');
            spyOn(TrafficCop, 'performRedirect');

            cop.init();

            expect(TrafficCop.generateRedirectUrl).not.toHaveBeenCalled();
            expect(TrafficCop.performRedirect).not.toHaveBeenCalled();
        });
    });

    describe('TrafficCop.verifyConfig', function () {
        it('should return true for valid variations', function () {
            const cop = new TrafficCop({
                variations: {
                    'v=1': 20,
                    'v=2': 40
                }
            });

            expect(cop.verifyConfig()).toBeTruthy();
        });

        it('should return false when variations are provided', function () {
            const cop = new TrafficCop();

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return false when variation percentage is 0', function () {
            const cop = new TrafficCop({
                variations: {
                    'v=1': 0,
                    'v=2': 0
                }
            });

            expect(cop.verifyConfig()).toBeFalsy();
        });

        it('should return false when variation percentage exceeds 100', function () {
            const cop = new TrafficCop({
                variations: {
                    'v=1': 50,
                    'v=2': 60
                }
            });

            expect(cop.verifyConfig()).toBeFalsy();
        });
    });

    describe('TrafficCop.isRedirectVariation', function () {
        const variations = {
            'v=1': 40,
            'v=2': 30
        };

        it('should return false if the current queryString does not contain a variation', function () {
            expect(
                TrafficCop.isRedirectVariation(variations, '?v=3')
            ).toBeFalsy();
            expect(
                TrafficCop.isRedirectVariation(variations, '?fav=1')
            ).toBeFalsy();
            expect(
                TrafficCop.isRedirectVariation(variations, '?v=3&fav=1')
            ).toBeFalsy();
        });

        it('should return true if the current querystring contains a variation', function () {
            expect(
                TrafficCop.isRedirectVariation(variations, '?v=2')
            ).toBeTruthy();
            expect(
                TrafficCop.isRedirectVariation(variations, '?foo=bar&v=2')
            ).toBeTruthy();
            expect(
                TrafficCop.isRedirectVariation(variations, '?v=2&foo=bar')
            ).toBeTruthy();
        });
    });

    describe('TrafficCop.chooseVariation (no cookie)', function () {
        const cop = new TrafficCop({
            variations: {
                'v=3': 30,
                'v=1': 20,
                'v=2': 25.25,
                'v=4': 0.2,
                'v=5': 0.1
            }
        });

        beforeEach(function () {
            spyOn(TrafficCop, 'getCookie').and.returnValue(null);
        });

        it('should return noVariationValue if random number is greater than total percentages', function () {
            // random number >= 80 is greater than percentage total above (75.55)
            spyOn(window.Math, 'random').and.returnValue(0.7556);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual(TrafficCop.noVariationValue);
        });

        it('should choose the first variation when random number is at the start of the range', function () {
            // first variation is 30%, so 1-30
            spyOn(window.Math, 'random').and.returnValue(0.01);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=3');
        });

        it('should choose the first variation when random number is at the end of the range', function () {
            // first variation is 30%, so 1-30
            spyOn(window.Math, 'random').and.returnValue(0.29);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=3');
        });

        it('should choose the second variation when random number is at the start of the range', function () {
            // second variation is 20%, so 31-50
            spyOn(window.Math, 'random').and.returnValue(0.3);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=1');
        });

        it('should choose the second variation when random number is at the end of the range', function () {
            // second variation is 20%, so 31-50
            spyOn(window.Math, 'random').and.returnValue(0.49);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=1');
        });

        it('should choose to the third variation when random number is at the start of the range', function () {
            // third variation is 25.25%, so 51-75.25
            spyOn(window.Math, 'random').and.returnValue(0.5);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=2');
        });

        it('should choose the third variation when random number is at the end of the range', function () {
            // third variation is 25.25%, so 51-75.25
            spyOn(window.Math, 'random').and.returnValue(0.7525);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=2');
        });

        it('should choose the fourth variation when random number is at the start of the range', function () {
            // fourth variation is 0.2%, so 75.26-75.45
            spyOn(window.Math, 'random').and.returnValue(0.7526);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=4');
        });

        it('should choose the fourth variation when random number is at the end of the range', function () {
            // fourth variation is 0.2%, so 75.26-75.45
            spyOn(window.Math, 'random').and.returnValue(0.7545);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=4');
        });

        it('should choose the fifth variation when random number matches', function () {
            // fifth variation is 0.1%, so 75.46
            spyOn(window.Math, 'random').and.returnValue(0.7546);
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=5');
        });
    });

    describe('TrafficCop.chooseVariation (cookie)', function () {
        const cop = new TrafficCop({
            id: 'my-experiment-cookie-id',
            variations: {
                'v=1': 20,
                'v=2': 25.25,
                'v=3': 30
            }
        });

        it('should return previously seen variation if an experiment cookie exists', function () {
            spyOn(TrafficCop, 'getCookie').and.returnValue('v=3');
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual('v=3');
        });

        it('should return no-variation if an experiment cookie exists', function () {
            spyOn(TrafficCop, 'getCookie').and.returnValue(
                TrafficCop.noVariationValue
            );
            expect(
                TrafficCop.chooseVariation(
                    cop.id,
                    cop.variations,
                    cop.totalPercentage
                )
            ).toEqual(TrafficCop.noVariationValue);
        });
    });

    describe('TrafficCop.getCookie', function () {
        const cookieId = 'test-cookie';
        var date = new Date();
        date.setHours(date.getHours() + 48);

        beforeEach(function () {
            document.cookie = ''; // clear cookies
            CookieHelper.setItem(cookieId, 'test', date, '/');
        });

        afterEach(function () {
            document.cookie = ''; // clear cookies
        });

        it('should return the value of the cookie that is passed to the getItem method', function () {
            expect(TrafficCop.getCookie(cookieId)).toBe('test');
        });

        it('should return null if no cookie with that name is found', function () {
            expect(TrafficCop.getCookie('oatmeal-raisin')).toBeNull();
        });

        it('should return null if no id is passed', function () {
            expect(TrafficCop.getCookie()).toBeNull();
        });
    });

    describe('TrafficCop.generateRedirectUrl', function () {
        it('should generate a redirect retaining the original querystring when present', function () {
            expect(
                TrafficCop.generateRedirectUrl(
                    'v=2',
                    'https://www.mozilla.org?foo=bar'
                )
            ).toEqual('https://www.mozilla.org?foo=bar&v=2');
        });

        it('should generate a redirect retaining the original hash when present', function () {
            expect(
                TrafficCop.generateRedirectUrl(
                    'v=2',
                    'https://www.mozilla.org#hash'
                )
            ).toEqual('https://www.mozilla.org?v=2#hash');
        });

        it('should generate a redirect retaining the original querystring and hash when present', function () {
            expect(
                TrafficCop.generateRedirectUrl(
                    'v=2',
                    'https://www.mozilla.org?foo=bar#hash'
                )
            ).toEqual('https://www.mozilla.org?foo=bar&v=2#hash');
        });

        it('should not generate a redirect if no variation was chosen', function () {
            expect(
                TrafficCop.generateRedirectUrl(TrafficCop.noVariationValue)
            ).toBeFalsy();
        });
    });
});
