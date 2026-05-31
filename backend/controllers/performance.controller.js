// Mock model performance metrics
exports.getPerformanceMetrics = (req, res, next) => {
  try {
    const metrics = {
      roc_auc: 0.98,
      precision: 0.89,
      recall: 0.91,
      f1: 0.90,
      accuracy: 0.99,
      confusion_matrix: [
        [56000, 42],
        [11, 89]
      ]
    };
    
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};
