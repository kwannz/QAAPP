"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const react_1 = require("react");
exports.Button = (0, react_1.forwardRef)(({ variant = 'default', ...props }, ref) => {
    // 映射变体到Ant Design的type
    const antdType = variant === 'primary' ? 'primary' :
        variant === 'dashed' ? 'dashed' :
            variant === 'link' ? 'link' :
                variant === 'text' ? 'text' : 'default';
    return ((0, jsx_runtime_1.jsx)(antd_1.Button, { ref: ref, type: antdType, ...props }));
});
exports.Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map