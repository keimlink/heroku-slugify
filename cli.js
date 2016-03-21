#!/usr/bin/env node

// Create a source tarball, upload it, build a slug and deploy it on Heroku.
// See https://devcenter.heroku.com/articles/build-and-release-using-the-api

require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')
var ArgumentParser = require('argparse').ArgumentParser
var child_process = require('child_process')
var fs = require('fs')
var Heroku = require('heroku-client')
var Q = require('q')
var util = require('util')

function displayInfo (app_id, version, source, timeout, interval) {
  console.info(util.format('app id: %s', app_id))
  console.info(util.format('version: %s', version))
  console.info(util.format('source tarball: %s', source))
  console.info(util.format('timeout: %d s', timeout))
  console.info(util.format('interval: %d s', interval))
}

function exec (command) {
  console.log(command)
  return Q.nfbind(child_process.exec)(command)
  .then(function (out) {
    if (out[1]) {
      var lines = out[1].split('\n')
      for (var i = 0; i < lines.length; i++) {
        console.log(lines[i])
      }
    }
  })
}

function createSourceTarball (source, directory) {
  return exec(util.format('rm -f %s', source))
  .then(function () {
    return exec(util.format('tar czvf %s -C %s/ $(ls %s/)', source, directory, directory))
    .then(function () {
      return Q.nfbind(fs.stat)(source)
    })
  })
}

function uploadSourceTarball (url, source) {
  return exec(util.format('curl "%s" -X PUT -H "Content-Type:" --data-binary @%s', url, source))
}

function createBuild (app, url, version) {
  var data = {
    source_blob: {
      url: url,
      version: version
    }
  }
  return app.builds().create(data)
}

function waitForBuild (app, build_id, timeout, interval) {
  return app.builds(build_id).info()
  .then(function (build) {
    console.log(util.format('build status: %s', build.status))
    if (timeout === 0) {
      throw new Error('Build did not succeed in time')
    }
    switch (build.status) {
      case 'failed':
        throw new Error('Build failed')
      case 'pending':
        return Q.delay(interval)
        .then(function () {
          return waitForBuild(app, build_id, timeout - interval, interval)
        })
    }
    return build
  })
}

function slugify (app_id, version, directory, source_file, timeout, interval) {
  var heroku = new Heroku({token: process.env.HEROKU_API_TOKEN})
  var app = heroku.apps(app_id)
  displayInfo(app_id, version, source_file, timeout, interval)
  return createSourceTarball(source_file, directory)
  .then(function () {
    return app.sources().create()
  })
  .then(function (source) {
    return uploadSourceTarball(source.source_blob.put_url, source_file)
    .then(function () {
      return createBuild(app, source.source_blob.get_url, version)
    })
    .then(function (build) {
      console.dir(build)
      return waitForBuild(app, build.id, timeout * 1000, interval * 1000)
    })
  })
  .fail(function (error) {
    console.error(error.stack)
    if (error.body.message) {
      console.error(error.body.message)
    }
    process.exit(1)
  })
}

function main () {
  var parser = new ArgumentParser({
    addHelp: true,
    description: 'Deploy a new Heroku slug',
    epilog: 'Create a source tarball, upload it, build a slug and deploy it on Heroku.'
  })
  parser.addArgument(
    [ '-a', '--app' ],
    {
      help: 'Heroku app id',
      required: true
    }
  )
  parser.addArgument(
    [ '-v', '--version' ],
    {
      help: 'Version to deploy',
      required: true
    }
  )
  parser.addArgument(
    [ '-d', '--directory' ],
    {
      defaultValue: 'heroku',
      help: 'Name of the directory containing the files for the tarball (default: heroku)'
    }
  )
  parser.addArgument(
    [ '-s', '--source' ],
    {
      defaultValue: 'source.tar.gz',
      help: 'File name of source tarball (default: source.tar.gz)'
    }
  )
  parser.addArgument(
    [ '-t', '--timeout' ],
    {
      defaultValue: 120,
      help: 'Timeout for build in seconds (default: 120 s)',
      type: 'int'
    }
  )
  parser.addArgument(
    [ '-i', '--interval' ],
    {
      defaultValue: 10,
      help: 'Interval to check build status in seconds (default: 10 s)',
      type: 'int'
    }
  )
  var args = parser.parseArgs()
  return slugify(args.app, args.version, args.directory, args.source, args.timeout, args.interval)
}

main()
