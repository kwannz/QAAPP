import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
const cardStyles = {
    silver: {
        gradient: "from-slate-100 via-gray-200 to-slate-100",
        border: "border-slate-300",
        accent: "text-slate-700",
        button: "bg-slate-600 hover:bg-slate-700 text-white",
        glow: "shadow-slate-200/50",
        icon: "🥈",
    },
    gold: {
        gradient: "from-yellow-100 via-amber-200 to-yellow-100",
        border: "border-amber-300",
        accent: "text-amber-800",
        button: "bg-amber-600 hover:bg-amber-700 text-white",
        glow: "shadow-amber-200/50",
        icon: "🥇",
    },
    diamond: {
        gradient: "from-cyan-100 via-blue-200 to-indigo-200",
        border: "border-blue-300",
        accent: "text-blue-800",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        glow: "shadow-blue-200/50",
        icon: "💎",
    },
    platinum: {
        gradient: "from-purple-100 via-purple-200 to-purple-100",
        border: "border-purple-300",
        accent: "text-purple-800",
        button: "bg-purple-600 hover:bg-purple-700 text-white",
        glow: "shadow-purple-200/50",
        icon: "👑",
    },
};
const NFTCard = React.forwardRef(({ type, name, apr, lockDays, minAmount, maxAmount, currentSupply, totalSupply, isActive, onPurchase, className, ...props }, ref) => {
    const style = cardStyles[type];
    const supplyPercentage = totalSupply ? (currentSupply / totalSupply) * 100 : 0;
    const isAvailable = isActive && (totalSupply ? currentSupply < totalSupply : true);
    return (_jsx(motion.div, { ref: ref, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, whileHover: { y: -5, transition: { duration: 0.2 } }, className: cn("relative", className), ...props, children: _jsxs(Card, { className: cn("relative overflow-hidden", `bg-gradient-to-br ${style.gradient}`, style.border, `shadow-lg ${style.glow}`, "hover:shadow-xl transition-shadow duration-300", !isAvailable && "opacity-75 grayscale"), children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" }), _jsxs(CardHeader, { className: "relative z-10", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: cn("text-xl font-bold", style.accent), children: [_jsx("span", { className: "text-2xl mr-2", children: style.icon }), name] }), !isAvailable && (_jsx("span", { className: "bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full", children: "\u552E\u7F44" }))] }), _jsxs("div", { className: "flex items-baseline gap-1", children: [_jsxs("span", { className: "text-3xl font-bold text-primary", children: [apr, "%"] }), _jsx("span", { className: "text-sm text-muted-foreground", children: "\u5E74\u5316\u6536\u76CA\u7387" })] })] }), _jsxs(CardContent, { className: "relative z-10 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "\u9501\u5B9A\u671F\u9650" }), _jsxs("p", { className: "font-semibold", children: [lockDays, " \u5929"] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "\u8D77\u6295\u91D1\u989D" }), _jsxs("p", { className: "font-semibold", children: ["$", minAmount.toLocaleString()] })] })] }), maxAmount && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "\u6700\u5927\u6295\u8D44\u989D" }), _jsxs("p", { className: "font-semibold", children: ["$", maxAmount.toLocaleString()] })] })), totalSupply && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "\u4F9B\u5E94\u91CF" }), _jsxs("span", { children: [currentSupply, " / ", totalSupply] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all duration-300", style: { width: `${Math.min(supplyPercentage, 100)}%` } }) })] })), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "\u56FA\u5B9A\u6536\u76CA" }), _jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "NFT\u51ED\u8BC1" }), type === "diamond" && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: "\u9AD8\u7AEF\u4E13\u4EAB" }))] }), _jsx(Button, { className: cn("w-full mt-4", style.button), disabled: !isAvailable, onClick: onPurchase, children: isAvailable ? `立即购买 ${name}` : "暂时售罄" }), _jsxs("div", { className: "mt-4 p-3 bg-white/50 rounded-lg", children: [_jsxs("p", { className: "text-xs text-muted-foreground mb-1", children: ["\u6536\u76CA\u9884\u4F30\uFF08\u6295\u8D44 $", minAmount.toLocaleString(), "\uFF09"] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "\u6BCF\u65E5\u6536\u76CA" }), _jsxs("span", { className: "font-semibold text-green-600", children: ["$", ((minAmount * apr / 100) / 365).toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "\u603B\u6536\u76CA" }), _jsxs("span", { className: "font-semibold text-green-600", children: ["$", ((minAmount * apr / 100) * (lockDays / 365)).toFixed(2)] })] })] })] })] }) }));
});
NFTCard.displayName = "NFTCard";
export { NFTCard };
