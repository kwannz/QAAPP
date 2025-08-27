import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
const WalletConnect = React.forwardRef(({ isConnected = false, address, balance, onConnect, onDisconnect, onSwitchNetwork, networkName = "以太坊", isCorrectNetwork = true, loading = false, className, ...props }, ref) => {
    const truncatedAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "";
    const copyToClipboard = async () => {
        if (address) {
            try {
                await navigator.clipboard.writeText(address);
                // TODO: 添加toast提示
            }
            catch (err) {
                console.error('复制失败:', err);
            }
        }
    };
    return (_jsx("div", { ref: ref, className: cn("w-full", className), ...props, children: _jsx(AnimatePresence, { mode: "wait", children: !isConnected ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, transition: { duration: 0.2 }, children: _jsxs(Card, { className: "border-dashed border-2 border-primary/20", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsxs(CardTitle, { className: "flex items-center justify-center gap-2", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDD17" }), "\u8FDE\u63A5\u94B1\u5305"] }), _jsx(CardDescription, { children: "\u8FDE\u63A5\u60A8\u7684Web3\u94B1\u5305\u4EE5\u5F00\u59CB\u6295\u8D44" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Button, { onClick: onConnect, loading: loading, className: "w-full", size: "lg", children: loading ? "连接中..." : "连接钱包" }), _jsx("div", { className: "text-xs text-muted-foreground text-center", children: "\u652F\u6301 MetaMask\u3001WalletConnect \u7B49\u4E3B\u6D41\u94B1\u5305" })] })] }) }, "disconnected")) : (_jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, transition: { duration: 0.2 }, children: _jsxs(Card, { className: cn("border-green-200 bg-green-50/50", !isCorrectNetwork && "border-yellow-200 bg-yellow-50/50"), children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-green-500 animate-pulse" }), "\u94B1\u5305\u5DF2\u8FDE\u63A5"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onDisconnect, className: "text-muted-foreground hover:text-foreground", children: "\u65AD\u5F00" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [!isCorrectNetwork && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, className: "p-3 bg-yellow-100 border border-yellow-200 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-yellow-600", children: "\u26A0\uFE0F" }), _jsxs("span", { className: "text-sm text-yellow-800", children: ["\u8BF7\u5207\u6362\u5230 ", networkName, " \u7F51\u7EDC"] })] }), _jsx(Button, { size: "sm", variant: "outline", onClick: onSwitchNetwork, className: "border-yellow-300 text-yellow-700 hover:bg-yellow-100", children: "\u5207\u6362\u7F51\u7EDC" })] }) })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-background rounded-lg border", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "\u94B1\u5305\u5730\u5740" }), _jsx("p", { className: "text-xs text-muted-foreground font-mono", children: truncatedAddress })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: copyToClipboard, className: "text-muted-foreground hover:text-foreground", children: "\uD83D\uDCCB" })] }), balance && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-background rounded-lg border", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "USDT \u4F59\u989D" }), _jsxs("p", { className: "text-lg font-bold text-primary", children: ["$", balance] })] }), _jsx("div", { className: "text-right", children: _jsx("p", { className: "text-xs text-muted-foreground", children: "\u53EF\u7528\u4E8E\u6295\u8D44" }) })] }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "\u67E5\u770B\u4EA4\u6613" }), _jsx(Button, { variant: "outline", size: "sm", children: "\u6DFB\u52A0USDT" })] })] })] }) }, "connected")) }) }));
});
WalletConnect.displayName = "WalletConnect";
export { WalletConnect };
