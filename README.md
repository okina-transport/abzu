# Abzu [![CircleCI](https://circleci.com/gh/entur/abzu/tree/master.svg?style=svg)](https://circleci.com/gh/entur/abzu/tree/master)

Stop place register frontend.
Uses stop place register backend tiamat's graphQL API

## Production

In order to build the webpack bundle and run the application, use

```
npm run build && npm run prod
```

### Configuration

We use node-convict for config: `config/convict.js`

* `TIAMAT_BASE_URL` : Where to find tiamat
* `ENDPOINTBASE` : Where th application resides, in development defaulting
  to `/` but in the test environment `/admin/nsr/`

You can serve a config file and provide a `CONFIG_URL` env to let node-convict do this for you.

## Development

To run Abzu for development, simply do:

```
npm install
npm run dev
```

Note: This will launch the application with hot reload enabled.

Default port is _8988_. This can be overrided by setting the environment
variable `port` (notice lower case).

To override timatBaseURL (GraphQL endpoint), set `TIAMAT_BASE_URL` as environment variables, e.g.

```
TIAMAT_BASE_URL=https://api-test.entur.org/stop_places/1.0/graphql port=9000 NODE_ENV=development node server.js
```


### Testing

Uses [Jest](https://facebook.github.io/jest/) to test unit and reducer testing

```
npm test
```

### Authentication

Uses Keycloak to authenticate user and read JWT, set `auth-server-url`:

```
AUTH_SERVER_URL=https://www-test.entur.org/auth port=9000 NODE_ENV=development node server.js
```

### Themes

Default theme is found in `./config/default`.

#### Add custom theme

* Create new directory: `./config/themes/{YOUR_THEME_NAME}`
* Add `logo.png` to `./config/themes/{YOUR_THEME_NAME}`
* Add `index.js` with custom fyles (cf. `defaultTheme.js`)
* Set `process.env.THEME={YOUR_THEME_NAME}`

This is WIP.

## Webpack

Webpack uses `webpack.dev.config.js` for development and `webpack.prod.config.js` for production code. Correct config is chosen based on NODE_ENV.

Webpack produces `public/bundle` which is the entire application rendered by the server. In development this file is emitted from webpack through [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) over a connect server. No file is written to disk. These facilities hot-reload.

## Create new Icons from Scalable Vector Graphic

Icons are created using SvgIcon tag. These tags contains the complete list of dots.
To recover a list of points, download a svg image from internet and open it with a text editor. Copy  < path d=xxx> tags to your SvgIcon.
Don't forget to recover viewBox attribute from the original image : it defines the display window of the icon. Setting a wrong viewBox can display blank icons.

Example of created icon using svg image:
```
const EscalatorFree = props =>
    <SvgIcon {...props}  viewBox="0 0 274.664 274.664">
        <g>
            <path d="M267.164,27.156h-76.313c-2.096,0-4.096,0.877-5.516,2.418l-75.415,81.86c-4.274-5.806-11.151-9.581-18.896-9.581H74.29
		c-12.933,0-23.454,10.521-23.454,23.454v45.688H7.5c-4.142,0-7.5,3.357-7.5,7.5v61.512c0,4.143,3.358,7.5,7.5,7.5h76.305
		c2.096,0,4.096-0.877,5.516-2.418l130.311-141.422h47.533c4.142,0,7.5-3.357,7.5-7.5V34.656
		C274.664,30.514,271.306,27.156,267.164,27.156z M74.29,116.854h16.734c3.896,0,7.176,2.652,8.151,6.244l-33.339,36.188v-33.979
		C65.836,120.646,69.628,116.854,74.29,116.854z M259.664,88.668h-43.32c-2.096,0-4.096,0.877-5.516,2.418L80.517,232.508H15
		v-46.512h43.336c2.096,0,4.096-0.877,5.516-2.418L194.14,42.156h65.524V88.668z"/>
            <path d="M82.657,90.799c17.546,0,31.821-14.275,31.821-31.822c0-17.546-14.275-31.82-31.821-31.82s-31.821,14.274-31.821,31.82
		C50.836,76.523,65.111,90.799,82.657,90.799z M82.657,42.156c9.275,0,16.821,7.546,16.821,16.82
		c0,9.275-7.546,16.822-16.821,16.822s-16.821-7.547-16.821-16.822C65.836,49.702,73.382,42.156,82.657,42.156z"/>
        </g>

    </SvgIcon>;

```



## Troubleshooting

### Issues with pngquant on linux
#### Error message:
```
error while loading shared libraries: libpng12.so.0
```

#### Cause
Ubuntu has, at the time of writing, libpng 16, not libpng 12.

#### Workaround:
```
wget -q -O /tmp/libpng12.deb http://mirrors.kernel.org/ubuntu/pool/main/libp/libpng/libpng12-0_1.2.54-1ubuntu1_amd64.deb \
  && sudo dpkg -i /tmp/libpng12.deb \
  && rm /tmp/libpng12.deb
```
