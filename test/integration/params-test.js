var assert = require('chai').assert
var supertest = require('supertest')
var path = require('path')
// Helper functions for the FS
var rm = require('../utils').rm
var write = require('../utils').write
// var cp = require('./utils').cp
var read = require('../utils').read

var ldnode = require('../../index')

describe('LDNODE params', function () {
  describe('suffixMeta', function () {
    describe('not passed', function () {
      it('should fallback on .meta', function () {
        var ldp = ldnode({ webid: false })
        assert.equal(ldp.locals.ldp.suffixMeta, '.meta')
      })
    })
  })

  describe('suffixAcl', function () {
    describe('not passed', function () {
      it('should fallback on .acl', function () {
        var ldp = ldnode({ webid: false })
        assert.equal(ldp.locals.ldp.suffixAcl, '.acl')
      })
    })
  })

  describe('root', function () {
    describe('not passed', function () {
      var ldp = ldnode({ webid: false })
      var server = supertest(ldp)

      it('should fallback on current working directory', function () {
        assert.equal(ldp.locals.ldp.root, process.cwd() + '/')
      })

      it('should find resource in correct path', function (done) {
        write(
          '<#current> <#temp> 123 .',
          'sampleContainer/example.ttl')

        // This assums npm test is run from the folder that contains package.js
        server.get('/test/resources/sampleContainer/example.ttl')
          .expect('Link', /http:\/\/www.w3.org\/ns\/ldp#Resource/)
          .expect(200)
          .end(function (err, res, body) {
            assert.equal(read('sampleContainer/example.ttl'), '<#current> <#temp> 123 .')
            rm('sampleContainer/example.ttl')
            done(err)
          })
      })
    })

    describe('passed', function () {
      var ldp = ldnode({root: './test/resources/', webid: false})
      var server = supertest(ldp)

      it('should fallback on current working directory', function () {
        assert.equal(ldp.locals.ldp.root, './test/resources/')
      })

      it('should find resource in correct path', function (done) {
        write(
          '<#current> <#temp> 123 .',
          'sampleContainer/example.ttl')

        // This assums npm test is run from the folder that contains package.js
        server.get('/sampleContainer/example.ttl')
          .expect('Link', /http:\/\/www.w3.org\/ns\/ldp#Resource/)
          .expect(200)
          .end(function (err, res, body) {
            assert.equal(read('sampleContainer/example.ttl'), '<#current> <#temp> 123 .')
            rm('sampleContainer/example.ttl')
            done(err)
          })
      })
    })
  })

  describe('ui-path', function () {
    let rootPath = './test/resources/'
    var ldp = ldnode({
      root: rootPath,
      apiApps: path.join(__dirname, '../resources/sampleContainer'),
      webid: false
    })
    var server = supertest(ldp)

    it('should serve static files on /api/ui', (done) => {
      server.get('/api/apps/solid.png')
        .expect(200)
        .end(done)
    })
  })
})
