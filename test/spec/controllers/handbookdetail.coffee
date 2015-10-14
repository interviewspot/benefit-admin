'use strict'

describe 'Controller: HandbookdetailctrlCtrl', ->

  # load the controller's module
  beforeEach module 'transformApp'

  HandbookdetailctrlCtrl = {}

  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    HandbookdetailctrlCtrl = $controller 'HandbookdetailctrlCtrl', {
      # place here mocked dependencies
    }

  it 'should attach a list of awesomeThings to the scope', ->
    expect(HandbookdetailctrlCtrl.awesomeThings.length).toBe 3
