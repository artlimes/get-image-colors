'use strict';

const getPixels = require('get-pixels')
const getRgbaPalette = require('get-rgba-palette')
const chroma = require('chroma-js')
const getSvgColors = require('get-svg-colors')
const pify = require('pify')
const path = require('path')

const patterns = {
  image: /\.(gif|jpg|png|svg)$/i,
  raster: /\.(gif|jpg|png)$/i,
  svg: /svg$/i
}

/**
 * @param input
 * @param {Object} options
 * @param {String} options.type
 * @param {String} options.count - Total number of colors to return
 * @param {String} options.quality - Quality pixel step, always > 0. 1 highest -> 10 lowest
 * @param callback
 * @returns {*}
 */
function colorPalette (input, options, callback) {
  if (typeof options === 'function') {
    callback = options
  }

  // SVG
  if (!Buffer.isBuffer(input)) {
    if (input.match(patterns.svg)) {
      return callback(null, getSvgColors(input, { flat: true }))
    }
  } else if (options.type === 'image/svg+xml') {
    return callback(null, getSvgColors(input, { flat: true }))
  }

  // PNG, GIF, JPG
  return paletteFromBitmap(input, options, callback)
}

function paletteFromBitmap (filename, options, callback) {
  if (!callback) {
    callback = options
  }

  getPixels(filename, options.type, function (err, pixels) {
    if (err) return callback(err)

    // return all colors
    const filter = function(pixels, index) {
      return true;
    };
    const colors = getRgbaPalette.bins(pixels.data, options.count, options.quality, filter);

    let palette = colors.map(function (color) {
      // add chroma and return a full object with color data
      return Object.assign(chroma(color.color), color);
    });

    console.log("palette ", palette);

    return callback(null, palette)
  });
}

module.exports = pify(colorPalette)

colorPalette(path.join(__dirname, '/multicolor.jpg'), {
  type: 'image/jpg',
  count: 10,
  quality: 1
}, function(){});