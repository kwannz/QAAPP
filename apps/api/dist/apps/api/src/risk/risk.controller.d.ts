import { RiskEngineService, WithdrawalRiskInput } from './risk-engine.service';
export declare class RiskController {
    private readonly riskEngineService;
    constructor(riskEngineService: RiskEngineService);
    performRiskAssessment(input: WithdrawalRiskInput): Promise<import("./risk-engine.service").RiskAssessmentResult>;
    getRiskItems(category?: string): Promise<{
        items: ({
            id: string;
            title: string;
            description: string;
            category: string;
            severity: string;
            status: string;
            affectedUsers: number;
            potentialLoss: number;
            probability: number;
            impact: number;
            riskScore: number;
            createdAt: Date;
            updatedAt: Date;
            assignedTo: string;
            mitigationPlan: string;
            metadata: {
                withdrawalThreshold: number;
                averageAmount: number;
                detectedCount: number;
                expiredUsers?: undefined;
                averageActivity?: undefined;
                threshold?: undefined;
            };
        } | {
            id: string;
            title: string;
            description: string;
            category: string;
            severity: string;
            status: string;
            affectedUsers: number;
            potentialLoss: number;
            probability: number;
            impact: number;
            riskScore: number;
            createdAt: Date;
            updatedAt: Date;
            assignedTo: string;
            mitigationPlan: string;
            metadata: {
                expiredUsers: number;
                averageActivity: number;
                threshold: number;
                withdrawalThreshold?: undefined;
                averageAmount?: undefined;
                detectedCount?: undefined;
            };
        })[];
        total: number;
        categories: string[];
    }>;
    getRiskTrends(period?: string): Promise<{
        overview: {
            totalRisks: number;
            highRisks: number;
            mediumRisks: number;
            lowRisks: number;
            trendDirection: string;
            changePercentage: number;
        };
        timeline: {
            date: string;
            high: number;
            medium: number;
            low: number;
        }[];
        categories: {
            financial: {
                current: number;
                trend: string;
            };
            compliance: {
                current: number;
                trend: string;
            };
            technical: {
                current: number;
                trend: string;
            };
            operational: {
                current: number;
                trend: string;
            };
        };
    }>;
    getRiskScenarios(): Promise<{
        scenarios: {
            id: string;
            name: string;
            description: string;
            probability: number;
            impact: string;
            potentialLoss: number;
            timeframe: string;
            triggers: string[];
            mitigationStrategies: string[];
            status: string;
            lastUpdated: Date;
        }[];
        total: number;
    }>;
    simulateRiskScenario(scenarioId: string): Promise<{
        scenarioId: string;
        simulationId: string;
        results: {
            estimatedImpact: number;
            affectedUsers: number;
            estimatedLoss: number;
            timeToContainment: string;
            resourcesRequired: string[];
            recommendations: string[];
        };
        status: string;
        simulatedAt: Date;
    }>;
}
