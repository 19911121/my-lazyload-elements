'use strict';

const isImageItem = (item) => {
    return item.el instanceof HTMLImageElement;
};

exports.isImageItem = isImageItem;
