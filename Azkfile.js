/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  'docker-registry-downloader': {
    // Dependent systems
    depends: [],
    // More images:  http://images.azk.io
    image: { "dockerfile": "Dockerfile" },
    // Steps to execute before running instances
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    scalable: false,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      "/azk/#{manifest.dir}/lib": persistent('lib'),
      "/azk/#{manifest.dir}/node_modules": persistent('node_modules-#{system.name}'),
    },
    envs: {
      // set instances variables
      NODE_ENV: "dev",
    },
    docker_extra: {
      HostConfig: { Privileged: true },
    }
  },
});
