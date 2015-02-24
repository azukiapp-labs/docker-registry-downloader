module.exports = {
  simulate_old_azktcl_0_0_1: [

      /*
        Original: azukiapp/azktcl:0.0.1
        '893c3b17a3cf9d114b6b3e067646fa68034260485fc153f23a8e9c26d4dcb9c1'
        'b659d9ee26adfe15b87e7860d4c943dc442c53fa7666703510fafa98b1e0bae4'
        '9deee8f47a1635042d1a84ef7c6dddb6e1e1a1a7a4c4c5b57fd0d96fd65ad54d'
        '511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158'
      */

    { image: {"name":"OLD1"},
      imageInspect:
       { Architecture: 'amd64',
         Author: 'Everton Ribeiro <nuxlli@gmail.com>',
         Checksum: 'tarsum.dev+sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
         Comment: '',
         Config: [Object],
         Container: '958d153301dafc254751bdeea8f12b9b2ecbca20a2590115851158ad5dbc9051',
         ContainerConfig: [Object],
         Created: '2015-01-14T23:49:03.457490187Z',
         DockerVersion: '1.3.3',
         Id: 'OLD1',
         Os: 'linux',
         Parent: 'OLD2',
         Size: 0,
         VirtualSize: 6410335 } },

    { image: {"name":"OLD2"},
      imageInspect:
       { Architecture: 'amd64',
         Author: 'Everton Ribeiro <nuxlli@gmail.com>',
         Checksum: 'tarsum.dev+sha256:7c1e3d8aabde598315ee4f3b509b870aa09e1cf3d98001f101fa1989a3442179',
         Comment: '',
         Config: [Object],
         Container: '7bce47ceaa34b54a2eed8f2befba1c7832bf521fb11aae63a03606acbe8f5759',
         ContainerConfig: [Object],
         Created: '2015-01-14T23:49:03.118219021Z',
         DockerVersion: '1.3.3',
         Id: 'OLD2',
         Os: 'linux',
         Parent: '9deee8f47a1635042d1a84ef7c6dddb6e1e1a1a7a4c4c5b57fd0d96fd65ad54d',
         Size: 6410335,
         VirtualSize: 6410335 } },

    { image: {"name":"9deee8f47a1635042d1a84ef7c6dddb6e1e1a1a7a4c4c5b57fd0d96fd65ad54d"},
      imageInspect:
       { Architecture: 'amd64',
         Author: 'Everton Ribeiro <nuxlli@gmail.com>',
         Checksum: 'tarsum.dev+sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
         Comment: '',
         Config: [Object],
         Container: '426192c439a9bf2f8b2d0269925bebe02e145cf0090c2f38e32a59220f466635',
         ContainerConfig: [Object],
         Created: '2015-01-14T23:49:02.008738706Z',
         DockerVersion: '1.3.3',
         Id: '9deee8f47a1635042d1a84ef7c6dddb6e1e1a1a7a4c4c5b57fd0d96fd65ad54d',
         Os: 'linux',
         Parent: '511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158',
         Size: 0,
         VirtualSize: 0 } },

    { image: {"name":"511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158"},
      imageInspect:
       { Architecture: 'x86_64',
         Author: '',
         Checksum: '',
         Comment: 'Imported from -',
         Config: null,
         Container: '',
         ContainerConfig: [Object],
         Created: '2013-06-13T14:03:50.821769-07:00',
         DockerVersion: '0.4.0',
         Id: '511136ea3c5a64f264b78b5433614aec563103b4d4702f3ba7d4d2698e22c158',
         Os: '',
         Parent: '',
         Size: 0,
         VirtualSize: 0 } }
  ]
};
