/*globals define, WebGMEGlobal*/
/*jshint browser: true*/

/**
 * Generated by VisualizerGenerator 0.1.0 from webgme on Thu Nov 26 2015 06:07:20 GMT-0600 (CST).
 */

define([
    'widgets/EasyDAG/EasyDAGWidget',
    './LayerItem',
    'css!./styles/ForgeFlowWidget.css'
], function (
    EasyDAGWidget,
    LayerItem
) {
    'use strict';

    var ForgeFlowWidget,
        WIDGET_CLASS = 'forge-flow';

    ForgeFlowWidget = function (logger, container) {
        EasyDAGWidget.call(this, logger, container);
        this.$el.addClass(WIDGET_CLASS);
        this.currentNodeId = null;
        this._logger.debug('ctor finished');
    };

    // FIXME: ForgeFlow is using EasyDAG's decorators
    _.extend(ForgeFlowWidget.prototype, EasyDAGWidget.prototype);

    ForgeFlowWidget.prototype.ItemClass = LayerItem;
    ForgeFlowWidget.prototype._getAddSuccessorTitle = function(item) {
        return 'Select layer to add after ' + item.desc.baseName;
    };

    ForgeFlowWidget.prototype.setupItemCallbacks = function() {
        var ItemClass = this.ItemClass;
        EasyDAGWidget.prototype.setupItemCallbacks.call(this);

        ItemClass.prototype.createLabeledDataNode = (parentId, name, classes, size) => {
            return this.createLabeledDataNode(parentId, name, classes, size);
        };
    };

    ForgeFlowWidget.prototype.addNode = function(desc) {
        if (desc.parentId === this.currentNodeId) {
            EasyDAGWidget.prototype.addNode.call(this, desc);
        }
    };

    ForgeFlowWidget.prototype.updateNode = function(desc) {
        if (desc.parentId === this.currentNodeId) {
            EasyDAGWidget.prototype.updateNode.call(this, desc);
        }
    };

    ForgeFlowWidget.prototype.removeNode = function(id) {
        if (this.connections[id] || this.items[id]) {
            EasyDAGWidget.prototype.removeNode.call(this, id);
        }
    };

    return ForgeFlowWidget;
});
