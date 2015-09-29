'use strict';

describe('Service: Clients', function () {

  // load the service's module
  beforeEach(module('transformApp'));

  // instantiate service
  var Clients;
  beforeEach(inject(function (_Clients_) {
    Clients = _Clients_;
  }));

  it('should do something', function () {
    expect(!!Clients).toBe(true);
  });

});
