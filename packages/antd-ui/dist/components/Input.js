"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = exports.Search = exports.TextArea = exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const react_1 = require("react");
exports.Input = (0, react_1.forwardRef)((properties, reference) => {
    return ((0, jsx_runtime_1.jsx)(antd_1.Input, { ref: reference, ...properties }));
});
exports.Input.displayName = 'Input';
exports.TextArea = antd_1.Input.TextArea, exports.Search = antd_1.Input.Search, exports.Password = antd_1.Input.Password;
//# sourceMappingURL=Input.js.map