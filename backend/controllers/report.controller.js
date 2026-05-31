'use strict';

exports.getExecutiveReport = async (req, res, next) => {
  try {
    const mockReport = [
      {
        id: `REP-${Date.now()}`,
        title: 'Weekly Threat Intelligence Report',
        summary: "AI analysis indicates a 15% decrease in overall fraud attempts this week. The majority of prevented losses originated from high-risk IP addresses.",
        created_at: new Date().toISOString(),
        metrics: {
          'weekly_fraud_attempts': 1245,
          'money_saved_usd': 452000.50,
          'high_risk_countries': 3,
          'ai_confidence_avg': '94.2%'
        }
      },
      {
        id: `REP-${Date.now() - 86400000}`,
        title: 'XGBoost Model Performance',
        summary: "Detailed breakdown of the XGBoost model predictions including false positive rates, recall, and SHAP value aggregations.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        metrics: {
          'true_positive_rate': '99.9%',
          'false_positive_rate': '0.01%',
          'latency_ms': 8,
          'total_predictions': 150000
        }
      }
    ];
    
    res.status(200).json({
      success: true,
      data: mockReport
    });
  } catch (error) {
    next(error);
  }
};
