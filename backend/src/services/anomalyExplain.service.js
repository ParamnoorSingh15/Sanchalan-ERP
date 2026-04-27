/**
 * Local explanation engine to convert anomaly scores into structured ERP security insights.
 * Includes safe extraction and fallback logic to prevent runtime disruptions.
 */

exports.generateSecurityExplanation = (event = {}) => {
    try {
        const score = typeof event.anomaly_score === 'number' ? event.anomaly_score : 0;
        const role = event.role ? String(event.role).toLowerCase() : '';
        const hour = typeof event.login_hour === 'number' ? event.login_hour : -1;
        
        // Base severity mapping: 0=LOW, 1=MEDIUM, 2=HIGH, 3=CRITICAL
        let severityLevel = 0; 
        
        if (score >= 0.90) severityLevel = 3;
        else if (score >= 0.75) severityLevel = 2;
        else if (score >= 0.50) severityLevel = 1;
        else severityLevel = 0;

        // Perform severity upward adjustments
        let adjustmentLog = [];
        if (role === 'admin' && score >= 0.70) {
            severityLevel += 1;
            adjustmentLog.push('high-risk administrative role');
        }
        if (hour >= 0 && hour <= 5) {
            severityLevel += 1;
            adjustmentLog.push('off-hours access pattern');
        }

        // Cap severity tightly at CRITICAL
        if (severityLevel > 3) severityLevel = 3;

        const severityMap = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const finalSeverity = severityMap[severityLevel];
        
        // Define suspicion flag cleanly
        const isSuspicious = score >= 0.50 || adjustmentLog.length > 0;

        // Build a readable automated reason
        let reason = `Evaluated anomaly score is ${score.toFixed(2)}.`;
        if (adjustmentLog.length > 0) {
            reason += ` Severity algorithm strictly elevated the risk due to: ${adjustmentLog.join(' and ')}.`;
        } else if (score < 0.50) {
            reason = `Event behavior conforms to normal baseline patterns.`;
        }

        // Assign standard administrative response protocols
        let recommendedAction = 'Routine observation. No immediate action required.';
        if (finalSeverity === 'CRITICAL') recommendedAction = 'Immediately suspend account access, revoke tokens, and initiate security protocol.';
        else if (finalSeverity === 'HIGH') recommendedAction = 'Review immediate session telemetry and alert IT SecOps.';
        else if (finalSeverity === 'MEDIUM') recommendedAction = 'Flag user session for secondary monitoring.';

        // Graphing hint recommendations
        let visualizationHint = 'USER_RISK_TREND';
        if (hour >= 0 && hour <= 5) visualizationHint = 'LOGIN_PATTERN_SHIFT';
        else if (score >= 0.90) visualizationHint = 'TIMELINE_SPIKE';

        return {
            severity: finalSeverity,
            is_suspicious: isSuspicious,
            reason: reason,
            recommended_action: recommendedAction,
            notification_message: `Detected ${finalSeverity} risk activity on resource [${event.resource || 'Unknown'}] by user ID [${event.user_id || 'Unknown'}].`,
            dashboard_summary: `System logged a ${finalSeverity} severity event linked to action: [${event.action || 'Unknown'}].`,
            visualization_hint: visualizationHint
        };
    } catch (error) {
        // Failsafe configuration preventing pipeline collapse
        console.error('[AnomalyExplainService] Explanation logic failed:', error.message);
        return {
            severity: 'LOW',
            is_suspicious: false,
            reason: 'Engine fallback triggered due to malformed evaluation attempt.',
            recommended_action: 'Verify input integration data structures.',
            notification_message: 'Security evaluation bypassed due to structured data failure.',
            dashboard_summary: 'Event evaluation incomplete.',
            visualization_hint: 'ACCESS_PATTERN_DEVIATION'
        };
    }
};
