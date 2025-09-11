"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardMeta = exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const react_1 = require("react");
exports.Card = (0, react_1.forwardRef)((properties, reference) => {
    return ((0, jsx_runtime_1.jsx)(antd_1.Card, { ref: reference, ...properties }));
});
exports.Card.displayName = 'Card';
exports.CardMeta = antd_1.Card.Meta;
//# sourceMappingURL=Card.js.map