/* globals define describe beforeEach afterEach it sinon expect */
define(function (require) {
  var _ = require('@qubit/underscore')
  var rewire = require('rewire')
  var poller = rewire('../poller')
  var validFrame = require('../lib/valid_frame')
  var validFrames = validFrame.getValidFrames()

  describe('request animation frame', function () {
    this.timeout(5000)

    var reverts, validFrameSpy

    beforeEach(function () {
      window.bgark = {}
      validFrameSpy = sinon.spy(validFrame)
      reverts = [poller.__set__('validFrame', validFrameSpy)]
    })

    afterEach(function () {
      poller.reset()
      while (reverts.length) reverts.pop()()
    })

    it('should only fire on valid frames per second', function (done) {
      poller('window.bgark.mcgee', function () {
        // Should be ~60frames === 1 second at ~60fps
        expect(validFrameSpy.callCount).to.be.below(65)
        expect(validFrameSpy.callCount).to.be.above(55)
        checkAllValidFrameCalls()
        done()
      })
      setTimeout(function () {
        window.bgark.mcgee = true
      }, 1000)
    })

    it('should only last until the backoff threshold', function (done) {
      poller('window.bgark.mcgee', function () {
        // Should be ~180frames === 3 seconds at ~60fps
        expect(validFrameSpy.callCount).to.be.below(185)
        expect(validFrameSpy.callCount).to.be.above(175)
        checkAllValidFrameCalls()
        done()
      })
      setTimeout(function () {
        window.bgark.mcgee = true
      }, 4000)
    })

    function checkAllValidFrameCalls () {
      for (var i = 0; i < validFrameSpy.callCount; i++) {
        var call = validFrameSpy.getCall(i)
        if (_.contains(validFrames, (i % 60) + 1)) {
          expect(call.returnValue).to.be.true
        } else {
          expect(call.returnValue).to.be.false
        }
      }
    }
  })
})