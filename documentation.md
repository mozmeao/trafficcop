# Mozilla Traffic Cop Documentation

Traffic Cop places visitors into A/B/x cohorts, and either performs a redirect or executes a developer-specified JavaScript function.

## How it works

After verifying the supplied configuration, Traffic Cop then generates a random number to choose a variation based on the supplied cohort percentages. If the supplied variations do not target 100% of visitors, the `no-variation` value may be chosen.

Traffic Cop does not set cookies to record or store data of any kind. It also does not store, send or transmit any kind of experiment data for analysis. It simply performs the task of displaying different experiment variations upon page load. It is up to you to record experiment data using whatever your standard website analytics tools may be. Likewise, if you want to set a cookie on redirect to remember which variation a website visitor has seen, it is up to you to handle cookie consent appropriately before doing so.

## Type A: Callback

If the instance of Traffic Cop is provided a `customCallback` in the config, the function supplied will be passed the variation value and executed.

Any further functionality is handled by the `customCallback`.

**For performance, and to not require any kind of `document.ready` code, it is recommended that "Type A" instances of Traffic Cop have their `.js` files placed at the bottom of the page, just before the closing `</body>` tag.**

```javascript
// example configuration for a callback function experiment
function myCallback(variation) {
    console.log('The chosen variation was ' + variation);
    // and then change button color based on variation chosen...
}

var lou = new TrafficCop({
  customCallback: myCallback,
  variations: {
    ‘a’: 10.25,
    ‘b’: 20.2,
    'c': 0.1,
    'd': 0.55
  }
});

lou.init();
```

## Type B: Redirect

If the instance of Traffic Cop is _not_ provided a `customCallback`, and if the chosen variation is _not_ `no-variation`, the visitor is redirected to the current URL with the chosen variation appended to the query string.

Any further functionality is handled by the application. (Usually loading different HTML/JS/CSS based on the query parameter.)

If the chosen variation is `no-variation`, no redirect will occur - i.e. the user is not chosen to participate in the experiment.

Any query string parameters present when a user initially lands on a page will be propagated to the variation redirect.

**To avoid content flicker, it is recommended that "Type B" instances of Traffic Cop have their `.js` files placed in the `<head>` of the page.**

```javascript
// example configuration for a redirect experiment
var wiggum = new TrafficCop({
  variations: {
    ‘v=1’: 0.15,
    ‘v=2’: 30,
    'v=3': 10.6
  }
});

wiggum.init();
```

**Note that the `variations` for redirect experiments contain a `key=value` pair.** This is not required, but does result in nicer redirect URLs, e.g. `https://www.example.com/?v=2` instead of `https://www.example.com/?2`.

### Advanced: Type B + Type A

It is possible to have both types of experiments running on the same page for the same audience. The general setup would be:

1. Place the redirect experiment in the `<head>` of the page. This will take precedence.
2. Place the callback experiment at the end of the page. This will execute regardless of query string values.

Check out the demo for a live example of this setup.

## How a variation is chosen

Variations are sorted in the order provided, and percentages are tallied to create tiers. Take the following config:

```javascript
var rex = new TrafficCop({
    variations: {
        'v=a': 15,
        'v=b': 0.25,
        'v=c': 25.6
    }
});
```

The implied tiers would be:

1. `v=a`: 1-15
2. `v=b`: 15.01 - 15.25
3. `v=c`: 15.26 - 40.31
4. (no variation chosen): 40.32-100

If the random number generated was 12.6, the user would be redirected to `?v=a`. A value of 15.2 would send the user `?v=b`, 15.6 to `?v=c`, and anything above 40.31 would result in no redirect.

**Note that Traffic Cop supports percentages into the hundredths, but no smaller.**

## Configuration

Each instance of a Traffic Cop requires one main configuration property:

- A variations object that lists all variations along with the associated percent chance of being chosen

An implementation for a redirect experiment might look like:

```javascript
var eddie = new TrafficCop({
    variations: {
        'v=1': 12.2,
        'v=2': 0.13,
        'v=3': 11.45
    }
});

eddie.init();
```

In the above example, the test will have 3 variations and will target a total of 23.78% of visitors. There will also be a 76.22% chance that `no-variation` is chosen.

### Remembering which variation a visitor has seen previously.

If you would like to try and ensure website visitors see the same experiment variation on repeat page visits, you can pass an optional experiment cookie ID to Traffic Cop when initializing an experiment:

```javascript
var eddie = new TrafficCop({
    id: 'my-experiment-cookie-id',
    variations: {
        'v=1': 12.2,
        'v=2': 0.13,
        'v=3': 11.45
    }
});

eddie.init();
```

Once Traffic Cop is initialized with an `id`, you can then set a cookie in your website code to store which variation was chosen. Traffic Cop will then check for existence of this cookie before deciding which variation to show on repeat visits.

The cookie ID should match the value of `eddie.id`, and the cookie value should match the value of `eddie.chosenVariation`. If you need help setting cookies, see [https://github.com/mozmeao/cookie-helper](https://github.com/mozmeao/cookie-helper).

Note: it is a website's responsibility to check for cookie consent before setting non-essential cookies!

## Implementation

Traffic Cop requires two JavaScript files:

1. `@mozmeao/trafficcop` (install via [NPM](https://www.npmjs.com/package/@mozmeao/trafficcop))
2. A custom `.js` file to configure and initialize an instance of Traffic Cop (and perhaps contain a callback function).

You can import the NPM package directly into your custom `.js` file to bundle everything together, using `require` or `import`:

- `import TrafficCop from '@mozmeao/trafficcop';`
- `const TrafficCop = require('@mozmeao/trafficcop');`

### Considerations

1. To prevent search engines from indexing a variation URL, we recommend adding a `<link rel="canonical">` to the `<head>` of your experiment pages that points to the URL without any variation parameters. For example, all variations for `www.example.com/product` should have the following tag:

    `<link rel="canonical" href="http://www.example.com/product">`

2. Concatenate and minify experiment-specific files before sending to production. This will reduce your file size by about **70%**!
3. Make sure your visitors consent to analytics before recording experiment data.
