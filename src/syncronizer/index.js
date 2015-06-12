import DockerHub      from '../docker-hub';
import DockerRegistry from '../docker-registry';
import DockerRemote   from '../docker-remote';
import { async }      from '../helpers/promises';

class Syncronizer {

  constructor(dockerode_options, request_options) {
    this._dockerode_options = dockerode_options;
    this._request_options   = request_options;

    this.dockerHub          = new DockerHub(this._request_options);
    this.dockerRegistry     = new DockerRegistry(this._request_options);
    this.dockerRemote       = new DockerRemote();
  }

  initialize() {
    return this.dockerRemote.initialize(this._dockerode_options);
  }

  getLayersDiff(hubResult, tag) {
    return async(this, function* () {
      var registry_result = yield this.getAllLayersFromRegistry(hubResult, tag);
      var registry_layers_ids = registry_result.registry_layers;

      var non_existent_locally_ids = [];

      for (var i = 0; i < registry_layers_ids.length; i++) {
        var registry_layer = registry_layers_ids[i];
        var local_layer = yield this.checkLocalLayer(registry_layer);
        if (!local_layer) {
          non_existent_locally_ids.push(registry_layer);
        }
      }

      return ({
        registry_layers_ids      : registry_layers_ids,
        non_existent_locally_ids : non_existent_locally_ids,
      });
    });
  }

  getAllLayersFromRegistry(hubResult, tag) {
    return async(this, function* () {
      // get endpoint and token from docker hub
      var imageId = yield this.dockerRegistry.getImageIdByTag(hubResult, tag);
      var registryAncestors = yield this.dockerRegistry.ancestry(hubResult, imageId);

      return ({
        hub_result      : hubResult,
        image_id        : imageId,
        registry_layers : registryAncestors
      });
    });
  }

  checkLocalLayer(image_id) {
    return async(this, function* () {
      var image = yield this.dockerRemote.getImage(image_id);
      var inspected_image = yield this.dockerRemote.inspectImage(image);
      return inspected_image;
    });
  }

  checkTotalLocalCount(layers_id_list) {
    return async(this, function* () {
      var sum_count = 0;

      for (var i = 0; i < layers_id_list.length; i++) {
        var layer_id = layers_id_list[i];
        var local_layer = yield this.checkLocalLayer(layer_id);
        if ( local_layer ) {
          sum_count = sum_count + 1;
        }
      }

      return sum_count;
    });
  }
}

module.exports = {
  __esModule: true,
  get default() { return Syncronizer; }
};
