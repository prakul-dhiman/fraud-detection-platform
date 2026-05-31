'use strict';

const axios = require('axios');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: () => require('crypto').randomUUID() } : require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Case = require('../models/Case');

// ── Helper: ML service base URL ───────────────────────────────────────────────
const ML_SERVICE_URL = () => process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ── Helper: Generate a UUID without the uuid package ─────────────────────────
const generateBatchId = () => {
  // Use Node's built-in crypto.randomUUID (Node >=14.17)
  try {
    return require('crypto').randomUUID();
  } catch {
    // Fallback: timestamp + random
    return `batch-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

// ── Helper: Build feature object from req.body ────────────────────────────────
const buildFeatures = (body) => {
  const featureKeys = [
    'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9',
    'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19',
    'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount',
  ];
  const features = {};
  for (const key of featureKeys) {
    features[key] = body[key] !== undefined ? Number(body[key]) : null;
  }
  return features;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transactions/predict
// ─────────────────────────────────────────────────────────────────────────────
const predictSingle = async (req, res, next) => {
  try {
    const features = buildFeatures(req.body);

    // Call ML service
    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL()}/predict`, features, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (mlErr) {
      const status = mlErr.response ? mlErr.response.status : 503;
      const message = mlErr.response
        ? mlErr.response.data?.message || 'ML service error'
        : 'ML service is unavailable. Please try again later.';
      return res.status(status).json({ success: false, message });
    }

    const { fraud, confidence, fraud_probability, shap_values } = mlResponse.data;

    // Generate mock enterprise fields
    const mockMerchants = ['Amazon', 'Walmart', 'Apple', 'Starbucks', 'Target', 'BestBuy', 'Netflix'];
    const mockCountries = ['US', 'CA', 'GB', 'AU', 'IN', 'FR', 'DE'];
    const merchantName = mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
    const country = mockCountries[Math.floor(Math.random() * mockCountries.length)];

    const isFraudBool = Boolean(fraud);
    const riskScore = isFraudBool 
      ? Math.floor(Math.random() * (99 - 85 + 1)) + 85 
      : Math.floor(Math.random() * (20 - 5 + 1)) + 5;

    let riskLevel = 'Safe';
    if (riskScore > 80) riskLevel = 'Critical';
    else if (riskScore > 60) riskLevel = 'High Risk';
    else if (riskScore > 40) riskLevel = 'Medium Risk';
    else if (riskScore > 20) riskLevel = 'Low Risk';

    // Persist to DB
    const transaction = await Transaction.create({
      userId: req.user._id,
      features,
      prediction: {
        isFraud: isFraudBool,
        confidence: Number(confidence),
        fraudProbability: Number(fraud_probability),
        shapValues: shap_values || {},
      },
      predictionType: 'single',
      merchantName,
      country,
      riskScore,
      riskLevel,
      status: isFraudBool ? 'Investigating' : 'Approved',
    });

    // Broadcast alert if fraud and create a Case
    if (isFraudBool) {
      const newCase = await Case.create({
        caseId: `CASE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        transactionId: transaction._id,
        priority: riskLevel === 'Critical' ? 'Critical' : (riskLevel === 'High Risk' ? 'High' : (riskLevel === 'Medium Risk' ? 'Medium' : 'Low'))
      });
      if (req.app.locals.io) {
        req.app.locals.io.emit('new_fraud_alert', transaction);
        req.app.locals.io.emit('new_case', newCase);
      }
    }

    return res.status(201).json({
      success: true,
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transactions/predict-bulk
// ─────────────────────────────────────────────────────────────────────────────
const predictBulk = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file provided. Please upload a CSV file.',
      });
    }

    // Forward the CSV file to the ML service via multipart/form-data
    const FormData = require('stream').PassThrough;
    const formData = new (require('form-data'))();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'transactions.csv',
      contentType: req.file.mimetype || 'text/csv',
    });

    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL()}/predict-bulk`, formData, {
        headers: formData.getHeaders(),
        timeout: 120000, // 2 minutes for bulk
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
    } catch (mlErr) {
      const status = mlErr.response ? mlErr.response.status : 503;
      const message = mlErr.response
        ? mlErr.response.data?.message || 'ML service error during bulk prediction'
        : 'ML service is unavailable. Please try again later.';
      return res.status(status).json({ success: false, message });
    }

    const predictions = mlResponse.data.predictions; // Expected: array of prediction objects
    if (!Array.isArray(predictions) || predictions.length === 0) {
      return res.status(502).json({
        success: false,
        message: 'ML service returned no predictions. Please check your CSV format.',
      });
    }

    const batchId = generateBatchId();

    // Build Transaction documents
    const transactionDocs = predictions.map((pred) => ({
      userId: req.user._id,
      features: buildFeatures(pred.features || pred),
      prediction: {
        isFraud: Boolean(pred.fraud),
        confidence: Number(pred.confidence),
        fraudProbability: Number(pred.fraud_probability),
        shapValues: pred.shap_values || {},
      },
      predictionType: 'bulk',
      bulkBatchId: batchId,
    }));

    // Bulk insert in chunks to prevent OOM errors on large files
    const inserted = [];
    const chunkSize = 5000;
    for (let i = 0; i < transactionDocs.length; i += chunkSize) {
      const chunk = transactionDocs.slice(i, i + chunkSize);
      const res = await Transaction.insertMany(chunk, { ordered: false });
      
      // Batch insert cases for this chunk
      const fraudTransactions = res.filter(t => t.prediction.isFraud);
      if (fraudTransactions.length > 0) {
        const casesToCreate = fraudTransactions.map(t => ({
          caseId: `CASE-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          transactionId: t._id,
          priority: 'High'
        }));
        const insertedCases = await Case.insertMany(casesToCreate, { ordered: false });
        if (req.app.locals.io && i === 0) {
          req.app.locals.io.emit('new_cases_bulk', insertedCases.slice(0, 50));
        }
      }

      // Only keep the first 100 inserted records in memory for the frontend response, 
      // otherwise returning 1M records will crash V8 stringify
      if (inserted.length < 100) {
        inserted.push(...res.slice(0, 100 - inserted.length));
      }
    }

    const fraudCount = predictions.filter(p => p.fraud).length;
    return res.status(201).json({
      success: true,
      data: {
        batchId,
        totalProcessed: transactionDocs.length,
        fraudCount,
        legitimateCount: transactionDocs.length - fraudCount,
        transactions: inserted, // Only sending first 100 for the preview table
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions/history
// Query params: page, limit, isFraud, startDate, endDate, sort
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // Filter by fraud status
    if (req.query.isFraud !== undefined) {
      filter['prediction.isFraud'] = req.query.isFraud === 'true';
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start)) filter.createdAt.$gte = start;
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end)) {
          // Include the entire end day
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions/stats
// ─────────────────────────────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate overall stats
    const [overallStats] = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          fraudCount: { $sum: { $cond: ['$prediction.isFraud', 1, 0] } },
          legitimateCount: { $sum: { $cond: ['$prediction.isFraud', 0, 1] } },
          avgConfidence: { $avg: '$prediction.confidence' },
        },
      },
    ]);

    const totalTransactions = overallStats?.totalTransactions || 0;
    const fraudCount = overallStats?.fraudCount || 0;
    const legitimateCount = overallStats?.legitimateCount || 0;
    const avgConfidence = overallStats ? parseFloat(overallStats.avgConfidence.toFixed(4)) : 0;
    const fraudPercentage = totalTransactions > 0
      ? parseFloat(((fraudCount / totalTransactions) * 100).toFixed(2))
      : 0;

    // Recent frauds by day (last 7 days)
    const recentFraudsRaw = await Transaction.aggregate([
      {
        $match: {
          userId,
          'prediction.isFraud': true,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Build a complete 7-day array (fill missing days with 0)
    const recentFrauds = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const y = day.getFullYear();
      const m = day.getMonth() + 1;
      const d = day.getDate();
      const found = recentFraudsRaw.find(
        (r) => r._id.year === y && r._id.month === m && r._id.day === d
      );
      recentFrauds.push({
        date: day.toISOString().split('T')[0],
        count: found ? found.count : 0,
      });
    }

    // Top features by average absolute SHAP value (across all user transactions)
    const shapAgg = await Transaction.aggregate([
      { $match: { userId } },
      {
        $project: {
          shapArray: { $objectToArray: '$prediction.shapValues' },
        },
      },
      { $unwind: '$shapArray' },
      {
        $group: {
          _id: '$shapArray.k',
          avgAbsShap: { $avg: { $abs: '$shapArray.v' } },
        },
      },
      { $sort: { avgAbsShap: -1 } },
      { $limit: 10 },
    ]);

    const topFeaturesByShap = shapAgg.map((item) => ({
      feature: item._id,
      avgAbsShapValue: parseFloat(item.avgAbsShap.toFixed(6)),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        fraudCount,
        legitimateCount,
        fraudPercentage,
        avgConfidence,
        recentFrauds,
        topFeaturesByShap,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions/admin/transactions  (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getAllTransactions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    if (req.query.isFraud !== undefined) {
      filter['prediction.isFraud'] = req.query.isFraud === 'true';
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start)) filter.createdAt.$gte = start;
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end)) {
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('userId', 'name email role createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions/admin/users  (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach transaction counts per user
    const userIds = users.map((u) => u._id);
    const txCounts = await Transaction.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, fraudCount: { $sum: { $cond: ['$prediction.isFraud', 1, 0] } } } },
    ]);

    const txMap = {};
    for (const t of txCounts) {
      txMap[t._id.toString()] = { count: t.count, fraudCount: t.fraudCount };
    }

    const enrichedUsers = users.map((u) => ({
      ...u,
      transactionCount: txMap[u._id.toString()]?.count || 0,
      fraudCount: txMap[u._id.toString()]?.fraudCount || 0,
    }));

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictSingle,
  predictBulk,
  getHistory,
  getStats,
  getAllTransactions,
  getAllUsers,
};
