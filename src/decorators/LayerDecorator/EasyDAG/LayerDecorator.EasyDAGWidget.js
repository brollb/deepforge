/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'js/Constants',
    'js/NodePropertyNames',
    'widgets/EasyDAG/EasyDAGWidget.DecoratorBase',
    'css!./LayerDecorator.EasyDAGWidget.css',
    'd3'
], function (
    CONSTANTS,
    nodePropertyNames,
    DecoratorBase
) {

    'use strict';

    var LayerDecorator,
        DECORATOR_ID = 'LayerDecorator',

    LayerDecorator = function (options) {
        var opts = _.extend({}, options);

        this._node = options.node;
        this._attrToDisplayName = {};
        this.attributeFields = {};
        this.setAttributes();

        this.color = this.color || '#9e9e9e';
        // Set width, height values
        if (!this.size) {
            this.size = {
                width: 100,
                height: 50
            };
        }

        if (!this.dense) {  // condensed size
            this.dense = {};
            this.dense.width = this.size.width;
            this.dense.height = this.size.height;
        }

        this.width = this.dense.width;
        this.height = this.dense.height;

        DecoratorBase.call(this, options);
        this.initialize();
        this.condense();
        this.logger.debug('LayerDecorator ctor'); 
    };

    _.extend(LayerDecorator.prototype, DecoratorBase.prototype);

    LayerDecorator.prototype.initialize = function() {
        this.width = this.dense.width;
        this.height = this.dense.height;

        this.$body = this.$el
            .append('path')
            .attr('class', 'layer-decorator');

        this.$name = this.$el.append('text')
            .attr('class', 'name')
            .style('font-size', '16px')  // FIXME: Move this to css
            .attr('fill', 'black');

        this.$attributes = this.$el.append('g')
            .attr('fill', '#222222');
    };

    LayerDecorator.prototype.expand = function() {
        var height,
            rx = this.size.width/2,
            ry = this.size.height/2,
            attrNames = Object.keys(this._attributes),
            displayName,
            path,
            textHeight = 15,

            // Attributes
            initialY = 20,
            attributeMargin = 10,
            leftCol,
            rightCol,
            y = 5;

        // Only expand if the node has attributes to show
        if (attrNames.length > 0) {

            // Get the height from the number of attributes
            height = y + this.dense.height + textHeight*attrNames.length;

            path = [
                `M${-rx},0`,
                `l ${this.size.width} 0`,
                `l 0 ${height}`,
                `l -${this.size.width} 0`,
                `l 0 -${height}`
            ].join(' ');

            this.$body
                .attr('d', path);

            // Shift name down
            this.$name.attr('y', '20');

            // Add the attribute fields
            y += initialY;
            leftCol = -rx + attributeMargin;
            rightCol = rx - attributeMargin;
            this.$attributes.remove();
            this.$attributes = this.$el.append('g')
                .attr('fill', '#222222');
            for (var i = attrNames.length; i--;) {
                // Create two text boxes (2nd is editable)
                y += textHeight;
                displayName = this._attrToDisplayName[attrNames[i]];
                // Attribute name
                this.$attributes.append('text')
                    .attr('y', y)
                    .attr('x', leftCol)
                    .attr('font-style', 'italic')  // FIXME: move this to css
                    .attr('class', 'attr-title')
                    .attr('text-anchor', 'start')
                    .text(`${displayName}: `);

                // Attribute value
                this.attributeFields[attrNames[i]] = this.$attributes.append('text')
                    .attr('y', y)
                    .attr('x', rightCol)
                    .attr('text-anchor', 'end')  // FIXME: move this to css
                    .text(`${this._attributes[attrNames[i]]}`)
                    .on('click', this.editAttribute.bind(this, attrNames[i], rightCol, y))
            }

            // Update width, height
            this.height = height;
            this.width = this.size.width;
            this.expanded = true;
            this.$el
                .attr('transform', `translate(${this.width/2}, 0)`);
        }

        this.onResize();
    };

    LayerDecorator.prototype.condense = function() {
        var path,
            rx = this.dense.width/2,
            ry = this.dense.height/2;

        path = [
            `M${-rx},0`,
            `a${rx},${ry} 0 1,0 ${this.dense.width},0`,
            `a${rx},${ry} 0 1,0 -${this.dense.width},0`
        ].join(' ');

        this.$body
            .attr('d', path);

        // Clear the attributes
        this.$attributes.remove();
        this.$attributes = this.$el.append('g')
            .attr('fill', '#222222');

        this.height = this.dense.height;
        this.width = this.dense.width;

        this.$name.attr('y', '0');

        this.$el
            .attr('transform', `translate(${this.width/2}, ${this.height/2})`);
        this.expanded = false;
        this.onResize();
    };

    LayerDecorator.prototype.onSelect = function() {
        this.expand();
    };

    LayerDecorator.prototype.onDeselect = function() {
        this.condense();
    };

    LayerDecorator.prototype.setAttributes = function() {
        var attrNames = Object.keys(this._node.attributes),
            name;
        this.name = this._node.baseName;  // Using the base node name for title

        this._attributes = {};
        for (var i = attrNames.length; i--;) {
            name = this.getAttributeDisplayName(attrNames[i]);
            if (name !== null) {
                this._attrToDisplayName[attrNames[i]] = name;
                this._attributes[attrNames[i]] = this._node.attributes[attrNames[i]];
            }
        }
    };

    LayerDecorator.prototype.getAttributeDisplayName = function(name) {
        if (name === 'name') {
            return null;
        }
        return name.replace(/_/g, ' ');
    };

    LayerDecorator.prototype.editAttribute = function(attr, x, y) {
        // Edit the node's attribute
        var html = this.attributeFields[attr][0][0],
            position = html.getBoundingClientRect(),

            width = Math.max(position.right-position.left, 15),
            container = $('<div>'),
            parentHtml = $('body'),
            values = this.getEnumValues(attr);

        // foreignObject was not working so we are using a tmp container
        // instead
        container.css('top', position.top);
        container.css('left', position.left);
        container.css('position', 'absolute');
        container.css('width', width);
        container.attr('id', 'CONTAINER-TMP');

        $(parentHtml).append(container);

        // Get the attribute schema
        if (values) {
            var dropdown = document.createElement('select'),
                option,
                self = this,
                arrowMargin = 30;

            for (var i = values.length; i--;) {
                option = document.createElement('option');
                option.setAttribute('value', values[i]);
                option.innerHTML = values[i];
                // set the default
                if (this._attributes[attr] === values[i]) {
                    option.setAttribute('selected', 'selected');
                }
                dropdown.appendChild(option);
            }
            dropdown.style.width = (width + arrowMargin)+ 'px';
            container.append(dropdown);
            dropdown.focus();
            // on select
            dropdown.onblur = function() {
                if (this.value !== self._attributes[attr]) {
                    self.saveAttribute(attr, this.value);
                }
                container.remove();
            };

        } else {
            container.editInPlace({
                    enableEmpty: true,
                    value: this._attributes[attr],
                    css: {'z-index': 10000,
                          'id': 'asdf',
                          'width': width,
                          'xmlns': 'http://www.w3.org/1999/xhtml'},
                    onChange: (oldValue, newValue) => {
                        this.saveAttribute(attr, newValue);
                    },
                    onFinish: function () {
                        $(this).remove();
                    }
                });
        }
    };

    LayerDecorator.prototype.render = function() {
        this.$body
            .transition()
            .attr('stroke', this.color)
            .attr('style', `fill:${this.color}`);

        this.$name
            .attr('text-anchor', 'middle')
            .text(this.name);
    };

    LayerDecorator.prototype.update = function(node) {
        this._node = node;
        // Update the attributes
        this.setAttributes();
        if (this.expanded) {
            this.expand();
        } else {
            this.condense();
        }
    };

    LayerDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    return LayerDecorator;
});
