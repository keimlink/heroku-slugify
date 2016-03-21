Heroku Slugify
==============

[![Travis](https://img.shields.io/travis/rust-lang/heroku-slugify.svg)](https://travis-ci.org/keimlink/heroku-slugify)
[![npm](https://img.shields.io/npm/v/heroku-slugify.svg)](https://www.npmjs.com/package/heroku-slugify)
[![npm](https://img.shields.io/npm/l/heroku-slugify.svg)](https://www.npmjs.com/package/heroku-slugify)
[![npm](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

A command line tool to create a source tarball, upload it, build a slug and deploy it on Heroku. The Heroku Dev Center article [Building and Releasing Using the Platform API](https://devcenter.heroku.com/articles/build-and-release-using-the-api) explains the details.

Install
-------

    $ npm install heroku-slugify --save

Usage
-----

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
