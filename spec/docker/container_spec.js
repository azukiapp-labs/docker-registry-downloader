import { Q, _, config, defer, async } from 'azk';
import docker from 'azk/docker';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');
var namespace = config('docker:namespace');

describe("Azk docker containers class", function() {
  this.timeout(20000);

  var stdin, outputs = { };
  var mocks = h.mockOutputs(beforeEach, outputs, function() {
    stdin  = h.makeMemoryStream();
    stdin.setRawMode = function() { };
  });

  describe("with a cotainer", function() {
    var container;

    beforeEach(() => {
      return docker.run(default_img,
        ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ],
        { stdout: mocks.stdout, stderr: mocks.stderr }
      ).then((c) => container = c);
    })

    it("should parse container name to annotations in get container list", function() {
      return docker.azkListContainers({ all: true }).then((instances) => {
        container = _.find(instances, (c) => { return c.Id == container.Id });
        h.expect(container).to.have.deep.property("Annotations.azk.type", "run");
      });
    });

    it("should parse container name to annotations to call inspect", function() {
      return docker.getContainer(container.Id).inspect().then((container) => {
        h.expect(container).to.have.deep.property("Annotations.azk.type", "run");
      });
    });
  });
});
