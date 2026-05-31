'use strict';

const mongoose = require('mongoose');

// ── Feature sub-schema (Time, V1-V28, Amount) ─────────────────────────────────
const featureSchema = new mongoose.Schema(
  {
    Time:   { type: Number, default: null },
    V1:     { type: Number, default: null },
    V2:     { type: Number, default: null },
    V3:     { type: Number, default: null },
    V4:     { type: Number, default: null },
    V5:     { type: Number, default: null },
    V6:     { type: Number, default: null },
    V7:     { type: Number, default: null },
    V8:     { type: Number, default: null },
    V9:     { type: Number, default: null },
    V10:    { type: Number, default: null },
    V11:    { type: Number, default: null },
    V12:    { type: Number, default: null },
    V13:    { type: Number, default: null },
    V14:    { type: Number, default: null },
    V15:    { type: Number, default: null },
    V16:    { type: Number, default: null },
    V17:    { type: Number, default: null },
    V18:    { type: Number, default: null },
    V19:    { type: Number, default: null },
    V20:    { type: Number, default: null },
    V21:    { type: Number, default: null },
    V22:    { type: Number, default: null },
    V23:    { type: Number, default: null },
    V24:    { type: Number, default: null },
    V25:    { type: Number, default: null },
    V26:    { type: Number, default: null },
    V27:    { type: Number, default: null },
    V28:    { type: Number, default: null },
    Amount: { type: Number, default: null },
  },
  { _id: false }
);

// ── Prediction sub-schema ────────────────────────────────────────────────────
const predictionSchema = new mongoose.Schema(
  {
    isFraud: {
      type: Boolean,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    fraudProbability: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    shapValues: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { _id: false }
);

// ── Main Transaction Schema ──────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    features: {
      type: featureSchema,
      required: [true, 'Transaction features are required'],
    },
    prediction: {
      type: predictionSchema,
      required: [true, 'Prediction result is required'],
    },
    predictionType: {
      type: String,
      enum: {
        values: ['single', 'bulk'],
        message: 'Prediction type must be "single" or "bulk"',
      },
      required: [true, 'Prediction type is required'],
    },
    bulkBatchId: {
      type: String,
      default: null,
      index: true,
    },
    merchantName: {
      type: String,
    },
    country: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Investigating', 'Resolved', 'Auto-Blocked', 'Approved'],
      default: 'Approved',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Safe', 'Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
transactionSchema.index({ userId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'prediction.isFraud': 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, 'prediction.isFraud': 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
