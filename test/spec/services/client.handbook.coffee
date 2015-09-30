'use strict'

describe 'Service: client.handbook', ->

  # load the service's module
  beforeEach module 'transformApp'

  # instantiate service
  client.handbook = {}
  beforeEach inject (_client.handbook_) ->
    client.handbook = _client.handbook_

  it 'should do something', ->
    expect(!!client.handbook).toBe true
