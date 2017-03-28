# Heroku Slugify

[![Build Status](https://img.shields.io/travis/keimlink/heroku-slugify.svg?style=flat-square)](https://travis-ci.org/keimlink/heroku-slugify)
[![npm version](https://img.shields.io/npm/v/heroku-slugify.svg?style=flat-square)](https://www.npmjs.com/package/heroku-slugify)
[![License](https://img.shields.io/npm/l/heroku-slugify.svg?style=flat-square)](https://www.npmjs.com/package/heroku-slugify)
[![bitHound](https://img.shields.io/bithound/dependencies/github/keimlink/heroku-slugify.svg?style=flat-square)](https://www.bithound.io/github/keimlink/heroku-slugify/master/dependencies/npm)
[![bitHound](https://img.shields.io/bithound/devDependencies/github/keimlink/heroku-slugify.svg?style=flat-square)](https://www.bithound.io/github/keimlink/heroku-slugify/master/dependencies/npm)
[![standardjs](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

A command line tool to deploy your application to Heroku without
using `git push`. It creates a source tarball, uploads it, builds a slug and
deploys it on Heroku. The Heroku Dev Center article
[Building and Releasing Using the Platform API](https://devcenter.heroku.com/articles/build-and-release-using-the-api) explains the details.

## Installation

    $ npm install heroku-slugify --global

## Configuration

`heroku-slugify` uses [node-heroku-client](https://github.com/heroku/node-heroku-client)
to talk to the Heroku API. You must set the `HEROKU_API_KEY` environment
variable, otherwise authentication will fail.

## Usage

    $ heroku-slugify --help
    usage: heroku-slugify [-h] -a APP -v VERSION [-s SOURCE] [-t TIMEOUT]
                          [-i INTERVAL]


    Deploy a new Heroku slug

    Optional arguments:
      -h, --help            Show this help message and exit.
      -a APP, --app APP     Heroku app id
      -v VERSION, --version VERSION
                            Version to deploy
      -d DIRECTORY, --directory DIRECTORY
                            Name of the directory containing the files for the
                            tarball (default: heroku)
      -s SOURCE, --source SOURCE
                            File name of source tarball (default: source.tar.gz)
      -t TIMEOUT, --timeout TIMEOUT
                            Timeout for build in seconds (default: 120 s)
      -i INTERVAL, --interval INTERVAL
                            Interval to check build status in seconds (default:
                            10 s)

    Create a source tarball, upload it, build a slug and deploy it on Heroku.

## Example: Deploying Jupyter Notebook on Heroku

A simple example is to deploy a [Jupyter Notebook](http://jupyter.readthedocs.org/)
on a Heroku Dyno. Instead of creating a Git repository and pushing it to the
`heroku` remote we just create three configuration files and deploy them using
`heroku-slugify`.

The following steps show you how to do this. You just need a
[Heroku account](https://signup.heroku.com/) to start!

By default `heroku-slugify` will collect all files in the directory `heroku` to
create the source tarball that contains the Heroku slug configuration. So your
first step is to create this directory:

    $ mkdir heroku

Now you specify the Python packages you want to install by writing them into the
`heroku/requirements.txt` file:

    $ echo "jupyter" > heroku/requirements.txt

The next step sets the Python version your Dyno will use:

    $ echo "python-3.5.1" > heroku/runtime.txt

You also need a `Procfile` to configure the Jupyter Notebook webserver:

    $ echo "web: jupyter notebook --no-browser --ip=* --port=$PORT /tmp" > heroku/Procfile

Now you should have a `heroku` directory with three files in it:

    $ tree heroku/
    heroku/
    ├── Procfile
    ├── requirements.txt
    └── runtime.txt

    0 directories, 3 files

That's all you need to deploy your Heroku Dyno!

If you don't have a Heroku app you can use for testing, create one now:

    $ heroku apps:create --no-remote

As explained in the configuration section you must set the `HEROKU_API_KEY`
environment variable, otherwise authentication will fail:

    $ export HEROKU_API_KEY=<YOUR_HEROKU_API_KEY_HERE>

Now you are ready to deploy the Jupyter Notebook using `heroku-slugify`:

    $ heroku-slugify --app <YOUR_HEROKU_APP_ID_HERE> --version 1.0
    [2016-03-21 16:22:12.637] [INFO]  app id: rocky-oasis-34863
    [2016-03-21 16:22:12.642] [INFO]  version: 1.0
    [2016-03-21 16:22:12.643] [INFO]  source tarball: source.tar.gz
    [2016-03-21 16:22:12.643] [INFO]  timeout: 120 s
    [2016-03-21 16:22:12.643] [INFO]  interval: 10 s
    [2016-03-21 16:22:12.643] [LOG]   rm -f source.tar.gz
    [2016-03-21 16:22:12.653] [LOG]   tar czvf source.tar.gz -C heroku/ $(ls heroku/)
    [2016-03-21 16:22:12.663] [LOG]   a Procfile
    [2016-03-21 16:22:12.663] [LOG]   a requirements.txt
    [2016-03-21 16:22:12.663] [LOG]   a runtime.txt
    [2016-03-21 16:22:12.663] [LOG]
    [2016-03-21 16:22:13.270] [LOG]   curl "https://s3-external-1.amazonaws.com/heroku-sources-production/heroku.com/ef0dc77f-6047-4be8-ab25-d3154215af31?AWSAccessKeyId=AKIAJURUZ6XB34ESX54A&Signature=mcxRSHmAS6hor9ekpIVb%2B5RDBBg%3D&Expires=1458577333" -X PUT -H "Content-Type:" --data-binary @source.tar.gz
    [2016-03-21 16:22:14.230] [LOG]     % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
    [2016-03-21 16:22:14.230] [LOG]                                    Dload  Upload   Total   Spent    Left  Speed
    100   272    0     0  100   272      0    286 --:--:-- --:--:-- --:--:--   286
    [2016-03-21 16:22:14.230] [LOG]
    [2016-03-21 16:22:15.830] [DIR]   { app: { id: '8ea98634-b053-44cc-a26c-d17c966dc2a7' },
      buildpacks: null,
      created_at: '2016-03-21T15:22:15+00:00',
      id: '704b7a99-bc7c-441f-b00c-4d54c5b36f16',
      output_stream_url: 'https://build-output.heroku.com/streams/8e/8ea98634-b053-44cc-a26c-d17c966dc2a7/logs/70/704b7a99-bc7c-441f-b00c-4d54c5b36f16.log?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJQUUZPBDLMDG7K7Q%2F20160321%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20160321T152215Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=8b89368f7e5c9302950592463cad4de85e7530f07b1caf0149e529278e8b3ca4',
      slug: null,
      source_blob:
       { checksum: null,
         url: 'https://s3-external-1.amazonaws.com/heroku-sources-production/heroku.com/ef0dc77f-6047-4be8-ab25-d3154215af31?AWSAccessKeyId=AKIAJURUZ6XB34ESX54A&Signature=QTPd7vWCQNXl0SbFrkJSpxeHAOk%3D&Expires=1458577333',
         version: '1.0',
         version_description: null },
      status: 'pending',
      updated_at: '2016-03-21T15:22:15+00:00',
      user:
       { email: 'markus@transcode.de',
         id: '573b6879-718b-4beb-a075-1324534e5dd8' } }
    [2016-03-21 16:22:16.413] [LOG]   build status: pending
    [2016-03-21 16:22:27.039] [LOG]   build status: pending
    [2016-03-21 16:22:37.660] [LOG]   build status: pending
    [2016-03-21 16:22:48.288] [LOG]   build status: pending
    [2016-03-21 16:22:58.891] [LOG]   build status: pending
    [2016-03-21 16:23:09.522] [LOG]   build status: pending
    [2016-03-21 16:23:20.174] [LOG]   build status: pending
    [2016-03-21 16:23:30.806] [LOG]   build status: pending
    [2016-03-21 16:23:41.403] [LOG]   build status: pending
    [2016-03-21 16:23:52.014] [LOG]   build status: pending
    [2016-03-21 16:24:02.787] [LOG]   build status: succeeded

Now open the Jupyter Notebook in your browser:

    $ heroku open --app <YOUR_HEROKU_APP_ID_HERE>

That's it! `heroku-slugify` makes it as simply as possible to deploy your
packaged application to a Heroku Dyno. You can not only deploy Python packages,
but any package format a Heroku buildpack exists for.

In case you want to destroy your Heroku Dyno, run the following command:

    $ heroku apps:destroy --app <YOUR_HEROKU_APP_ID_HERE>

## SECURITY ADVICE

Please note that anyone who has the URL of your Heroku Dyno has full access to
the host! This is just an example and not something you should run in
production!
