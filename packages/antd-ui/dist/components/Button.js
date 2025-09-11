"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const react_1 = require("react");
exports.Button = (0, react_1.forwardRef)(({ variant = 'default', ...properties }, reference) => {
    let antdType;
    switch (variant) {
        case 'default': {
            antdType = 'default';
            break;
        }
        case 'primary': {
            antdType = 'primary';
            break;
        }
        case 'dashed': {
            antdType = 'dashed';
            break;
        }
        case 'link': {
            antdType = 'link';
            break;
        }
        case 'text': {
            antdType = 'text';
            break;
        }
        default: {
            antdType = 'default';
        }
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Button, { ref: reference, type: antdType, ...properties }));
});
exports.Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map