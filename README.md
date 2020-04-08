# MERN Starter

This is a MERN app boilerplate.

## Features

- MERN Stack
- Bootstrap
- Mongoose
- Babel transpiling for the Express server which allows for ES2017
- Redux
- JWT tokens
- User authentication
- App configuration in the package.json
- an installer screen
- Geolocation through Location IQ

## Usage for development

1. In the root `package.json` set your application's `name`, `displayName` and `author`
1. run `npm i`
1. duplicate `.env.sample` into `.env`
1. In the `.env`

- set the `NODE_ENV` to `development`
- set `MONGODB_URI` to the URI of your Mongo database
- set `SECRETKEY` to a random, 32 character string
- set `COOKIE_SECURE` to `false` for development, `true` for production
- set `RAPIDAPI_APP_KEY` to an app at Rapid API
- set `GITHUB_ACCESS_TOKEN` to an app token you create at GitHub
- set `REACT_APP_NAME` to "Coronavirus Dashboard"
- set `APIKEY_LOCATIONIQ` to your Location IQ API key

## For Heroku deployment

- This app uses Puppeteer which reqiuires a build pack:
  https://developers.google.com/web/tools/puppeteer/troubleshooting

- When launching puppeteer, make sure to pass the `--no-sandbox` argument

- Whitelisting Heroku dyno IP addresses to limit database access is not a good option.

## Jobs

To run a job, make sure to use `babel-node`:

```bash
npx babel-node jobs/scrapeWAState.js
```
