class Downloader {
  sayHi(name = 'Anonymous') {
    return `Hi ${name}!`;
  }
}

module.exports = {
  __esModule: true,
  get default() { return Downloader }
};