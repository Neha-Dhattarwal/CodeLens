
/* 
  THIS FILE IS FOR BACKEND USAGE. 
  COPY TO: ./models/Schema.js
*/

import mongoose from 'mongoose';

const RepoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  description: String,
  architecture: String,
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  stars: Number,
  forks: Number,
  primaryLanguage: String,
  createdAt: { type: Date, default: Date.now }
});

const FileSchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo', required: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String, enum: ['file', 'directory'], required: true },
  explanation: String,
  functions: [String],
  imports: [String],
  language: String,
  content: String
});

const DependencySchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo', required: true },
  sourceFile: { type: String, required: true },
  targetFile: { type: String, required: true },
  type: { type: String, enum: ['import', 'reference'], default: 'import' }
});

export const Repo = mongoose.model('Repo', RepoSchema);
export const FileRecord = mongoose.model('File', FileSchema);
export const Dependency = mongoose.model('Dependency', DependencySchema);
