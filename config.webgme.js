// DO NOT EDIT THIS FILE
// This file is automatically generated from the webgme-cli tool.
'use strict';

var config = require('webgme/config/config.default'),
    validateConfig = require('webgme/config/validator');

// FIXME: This needs to be restructured...
// The paths can be loaded from the .webgme.json
//
// The extra settings (such as enabling executors) need to be
// figured out

// This is a hack :/



config.plugin.basePaths.push("src/plugin");

config.addOn.enable = true

validateConfig(config);
module.exports = config;
