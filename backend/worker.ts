
import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { Repo, FileRecord, Dependency } from './models.ts';
import { analyzeCode, generateArchitectureSummary } from './aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const git = simpleGit();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function startAnalysisWorker(repoId: string) {
  const repo = await Repo.findById(repoId);
  if (!repo) return;

  const tempPath = path.join(__dirname, 'temp', repoId);

  try {
    await Repo.findByIdAndUpdate(repoId, { status: 'processing' });

    if (fs.existsSync(tempPath)) await fs.remove(tempPath);
    await git.clone(repo.url, tempPath, ['--depth', '1']);

    const files = await walkDir(tempPath, tempPath);

    const codeFiles = files.filter(f => isCodeFile(f.name));
    const BATCH_SIZE = 5;

    for (let i = 0; i < codeFiles.length; i += BATCH_SIZE) {
      const batch = codeFiles.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} (${batch.length} files)`);

      await Promise.all(batch.map(async (file) => {
        try {
          const content = await fs.readFile(file.absPath, 'utf8');
          const analysis = await analyzeFile(content, file.name);

          await FileRecord.create({
            repoId,
            name: file.name,
            path: file.relPath,
            type: 'file',
            explanation: analysis.explanation,
            functions: analysis.functions,
            imports: analysis.imports,
            content: content.substring(0, 500)
          });

          for (const imp of analysis.imports || []) {
            await Dependency.create({
              repoId,
              sourceFile: file.relPath,
              targetFile: imp,
              type: 'import'
            });
          }
          console.log(`Successfully analyzed: ${file.name}`);
        } catch (fileErr) {
          console.error(`Failed to analyze ${file.name}:`, fileErr);
        }
      }));

      if (i + BATCH_SIZE < codeFiles.length) {
        console.log('Throttling for next batch...');
        await sleep(5000); // 5s delay between batches
      }
    }

    const architecture = await generateArchitectureSummaryWithEngine(repo.name, files.slice(0, 100));

    await Repo.findByIdAndUpdate(repoId, {
      status: 'completed',
      architecture
    });

    await fs.remove(tempPath);
  } catch (err) {
    console.error('Worker error:', err);
    await Repo.findByIdAndUpdate(repoId, { status: 'failed' });
  }
}

async function analyzeFile(content: string, filename: string) {
  return await analyzeCode(content, filename);
}

async function generateArchitectureSummaryWithEngine(repoName: string, files: any[]) {
  const folderStructure = files.map(f => f.relPath);
  return await generateArchitectureSummary(repoName, folderStructure);
}

async function walkDir(dir: string, rootDir: string, fileList: any[] = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (file === '.git' || file === 'node_modules') continue;
    const absPath = path.join(dir, file);
    const relPath = path.relative(rootDir, absPath);
    const stat = await fs.stat(absPath);
    if (stat.isDirectory()) {
      await walkDir(absPath, rootDir, fileList);
    } else {
      fileList.push({ name: file, absPath, relPath, type: 'file' });
    }
  }
  return fileList;
}

function isCodeFile(filename: string) {
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.cpp'];
  return exts.some(ext => filename.endsWith(ext));
}
