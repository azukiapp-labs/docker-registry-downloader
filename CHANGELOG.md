# Changelog

## 0.3.2 (2016-01-06)

* Bug
  * Fixing enable log stack traces for Bluebird

## 0.3.1 (2016-01-06)

* Bug
  * Replacing `babel-polyfill` for `babel-regenerator-runtime`, reducing the amount of dependencies and allowing greater flexibility in the use of lib;

## 0.3.0 (2016-01-05)

* Enhancements
  * Fixing `Azkfile.js` to test lib in a isolate sistem;
  * Updating dependencies and removing unused;

## 0.2.0

* Enhancements
  * [Features] removing all download and load features because is not working well
  * [Kernel] removing Q
  * [Kernel] removing q-io
  * [Kernel] including bluebird
  * [Kernel] including azk-dev

## 0.0.21

* Enhancements
  * download all layers to the same folder #5
  * show progress bar when loading layers

## 0.0.20

* Enhancements
  * remove "transpiled" lib folder from git #3
  * resume downloads from where they stop #1
