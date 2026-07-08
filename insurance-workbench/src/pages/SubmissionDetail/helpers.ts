export function getNextBestAction(applicationData: any): string {
  const pendingReqs = (applicationData.details && applicationData.details.requirements)
    ? applicationData.details.requirements.filter((r: any) => r.status === 'Pending')
    : [];
  if (pendingReqs.length > 0) {
    return `Request documentation or follow up for: ${pendingReqs.map((r: any) => r.name).join(', ')}.`;
  }
  const highRisk = (applicationData.aiRiskAnalysis && applicationData.aiRiskAnalysis.riskFactors)
    ? applicationData.aiRiskAnalysis.riskFactors.find((rf: any) => rf.impact === 'High')
    : null;
  if (highRisk) {
    return `Evaluate risk: ${highRisk.category} - ${highRisk.description}`;
  }
  const allReceived = (applicationData.details && applicationData.details.requirements && applicationData.details.requirements.length > 0)
    ? applicationData.details.requirements.every((r: any) => r.status === 'Received')
    : false;
  if (allReceived && (applicationData.aiRiskAnalysis?.score ?? 0) > 80) {
    return 'All requirements received and risk is low. Submit a decision.';
  }
  return 'Review case details and determine next steps.';
}
