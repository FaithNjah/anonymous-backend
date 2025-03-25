var expect = require("chai").expect;
var request = require("request");

it("Main page content", function (done) {
    request("http://localhost:4555", function (_, __, body) {
        expect(body).to.equal("working fine");
        done();
    });
});

it("Main page content length", function (done) {
    request("http://localhost:4555", function (_, __, body) {
        expect(body).to.length(12);
        done();
    });
});
