import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
const statusStyles = {
    active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: '持有中',
        icon: '🟢',
    },
    redeeming: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: '赎回中',
        icon: '🟡',
    },
    closed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: '已结束',
        icon: '⚫',
    },
    defaulted: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: '违约',
        icon: '🔴',
    },
};
const typeIcons = {
    silver: '🥈',
    gold: '🥇',
    diamond: '💎',
};
const InvestmentDashboard = React.forwardRef(({ stats, positions, onClaimRewards, onViewPosition, className, ...properties }, reference) => {
    // Magic numbers defined as constants
    const PERCENTAGE_MULTIPLIER = 100;
    const DECIMAL_PRECISION = 2;
    const MILLISECONDS_PER_SECOND = 1000;
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;
    const MILLISECONDS_PER_DAY = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
    const ANIMATION_DELAY_INCREMENT = 0.1;
    const profitLoss = stats.currentValue - stats.totalInvested;
    const profitLossPercentage = stats.totalInvested > 0
        ? ((profitLoss / stats.totalInvested) * PERCENTAGE_MULTIPLIER)
        : 0;
    return (_jsxs("div", { ref: reference, className: cn('space-y-6', className), ...properties, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "\u603B\u6295\u8D44\u91D1\u989D" }), _jsx("span", { className: "text-2xl", children: "\uD83D\uDCB0" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", stats.totalInvested.toLocaleString()] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["\u6D3B\u8DC3\u4ED3\u4F4D ", stats.activePositions, " \u4E2A"] })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "\u5F53\u524D\u4EF7\u503C" }), _jsx("span", { className: "text-2xl", children: "\uD83D\uDCC8" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["$", stats.currentValue.toLocaleString()] }), _jsxs("p", { className: cn('text-xs font-medium', profitLoss >= 0 ? 'text-green-600' : 'text-red-600'), children: [profitLoss >= 0 ? '+' : '', "$", profitLoss.toLocaleString(), "(", profitLoss >= 0 ? '+' : '', profitLossPercentage.toFixed(DECIMAL_PRECISION), "%)"] })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "\u7D2F\u8BA1\u6536\u76CA" }), _jsx("span", { className: "text-2xl", children: "\uD83C\uDFAF" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["+$", stats.totalEarnings.toLocaleString()] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "\u5386\u53F2\u603B\u6536\u76CA" })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(Card, { className: "border-primary/20 bg-primary/5", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "\u5F85\u9886\u53D6\u6536\u76CA" }), _jsx("span", { className: "text-2xl", children: "\uD83C\uDF81" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-primary", children: ["$", stats.claimableRewards.toLocaleString()] }), stats.claimableRewards > 0 && (_jsx("button", { onClick: onClaimRewards, className: "text-xs text-primary font-medium hover:underline mt-1", children: "\u7ACB\u5373\u9886\u53D6 \u2192" }))] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u6211\u7684\u6295\u8D44\u7EC4\u5408" }), _jsx(CardDescription, { children: "\u5F53\u524D\u6301\u6709\u7684\u6240\u6709\u6295\u8D44\u4ED3\u4F4D" })] }), _jsx(CardContent, { children: positions.length === 0
                            ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("span", { className: "text-6xl mb-4 block", children: "\uD83D\uDCCA" }), _jsx("p", { className: "text-muted-foreground", children: "\u6682\u65E0\u6295\u8D44\u4ED3\u4F4D" }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "\u8D2D\u4E70NFT\u4EA7\u54C1\u5F00\u59CB\u60A8\u7684\u6295\u8D44\u4E4B\u65C5" })] }))
                            : (_jsx("div", { className: "space-y-4", children: positions.map((position, index) => {
                                    const status = statusStyles[position.status];
                                    const daysRemaining = Math.ceil((new Date(position.endDate).getTime() - Date.now()) / MILLISECONDS_PER_DAY);
                                    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * ANIMATION_DELAY_INCREMENT }, className: "border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer", onClick: () => onViewPosition?.(position.id), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: typeIcons[position.productType] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: position.productName }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["\u672C\u91D1 $", position.principal.toLocaleString(), " \u2022 ", position.apr, "% APR"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "flex items-center gap-2 mb-1", children: _jsxs("span", { className: cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', status.bg, status.text), children: [status.icon, " ", status.label] }) }), _jsxs("p", { className: "text-sm font-medium", children: ["\u5F53\u524D\u4EF7\u503C: $", position.currentValue.toLocaleString()] }), position.status === 'active' && daysRemaining > 0 && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["\u5269\u4F59 ", daysRemaining, " \u5929"] }))] })] }), position.nextPayoutAt && position.nextPayoutAmount && (_jsx("div", { className: "mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\u4E0B\u6B21\u5206\u7EA2: ", new Date(position.nextPayoutAt).toLocaleDateString(), "\u2022 $", position.nextPayoutAmount.toFixed(DECIMAL_PRECISION)] }) }))] }, position.id));
                                }) })) })] })] }));
});
InvestmentDashboard.displayName = 'InvestmentDashboard';
export { InvestmentDashboard };
