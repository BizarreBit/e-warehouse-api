const cloudinary = require("cloudinary").v2;
const util = require("util");

exports.upload = util.promisify(cloudinary.uploader.upload);
exports.destroy = util.promisify(cloudinary.uploader.destroy);

exports.destroyByUrl = async (url) => {
  if (url) {
    const splited = url.split("/");
    const publicId = splited[splited.length - 1].split(".")[0];
    await this.destroy(publicId);
  }
}