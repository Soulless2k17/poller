/* globals describe beforeEach afterEach it */
var $ = require('@qubit/jquery')
var expect = require('expect.js')
var sinon = require('sinon')
var rewire = require('rewire')
var poller = rewire('../poller')
var tock = poller.__get__('tock')
var TICK = poller.__get__('INITIAL_TICK')
var TIMEOUT = TICK * 4

describe('timemout', function () {
  var $container
  var clock
  var $foo
  var reverts

  beforeEach(function () {
    $container = $('<div class="container"/>').appendTo('body')
    $foo = $('<div class="foo"/>')
    clock = sinon.useFakeTimers()
    reverts = [poller.__set__('requestAnimationFrame', window.setTimeout)]
  })

  afterEach(function () {
    window.universal_variable = false
    $container.remove()
    poller.reset()
    clock.restore()
    while (reverts.length) reverts.pop()()
  })

  it('should call the timeout callback when the poller times out', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    poller('.foo', { timeout: TIMEOUT }).then(fooCb, barCb)

    expect(poller.isActive()).to.eql(true)
    clock.tick(TIMEOUT)
    tock()
    expect(poller.isActive()).to.eql(false)
    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(true)
  })

  it('should not call the timeout callback when the poller completes', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    poller('.foo', { timeout: TIMEOUT }).then(fooCb, barCb)

    // make it exist
    $container.append($foo)
    expect(poller.isActive()).to.eql(true)

    clock.tick(TIMEOUT)
    tock()
    expect(poller.isActive()).to.eql(false)
    expect(fooCb.called).to.be.eql(true)
    expect(barCb.called).to.be.eql(false)
  })

  it('should not call the timeout callback when the poller is cancelled', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    var poll = poller('.foo', { timeout: TIMEOUT })
    poll.then(fooCb, barCb)

    poll.stop()

    clock.tick(TIMEOUT)
    tock()
    expect(poller.isActive()).to.eql(false)
    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(false)
  })

  it('should respect custom timeout options', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    poller('.foo', { timeout: 1000 }).catch(fooCb)
    poller('.bar', { timeout: 2000 }).catch(barCb)

    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(false)
    clock.tick(1000)
    tock()
    expect(fooCb.called).to.be.eql(true)
    expect(barCb.called).to.be.eql(false)
    clock.tick(1000)
    tock()
    expect(fooCb.called).to.be.eql(true)
    expect(barCb.called).to.be.eql(true)
  })
})
