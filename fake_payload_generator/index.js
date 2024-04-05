import path from "path";
import faker from "faker";
import fs from "fs/promises";

const repoToData = new Map();
const repoToFileName = {};

// Function to ensure a directory exists
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory ${dirPath} created successfully.`);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(`Error creating directory ${dirPath}:`, err);
    }
  }
}

// Function to generate a random timestamp
function getRandomTimestamp() {
  return faker.date.recent().toISOString();
}

function getRandomNumberFiles() {
  return Math.floor(Math.random() * (20 - 10 + 1)) + 10;
}

// Function to generate file names with .py or .js extensions
function generateFileNames() {
  const d = Date.now();
  const ex = d % 2 === 0 ? ".js" : ".py";
  let files = [];

  for (let i = 0; i < getRandomNumberFiles(); i++) {
    const fileName = faker.system.fileName();
    files.push(fileName.split(".")[0] + ex);
  }

  return files;
}

// Function to generate fake GitHub URLs
function generateFakeGitHubURL() {
  const baseURL = "https://github.com/";
  const username = faker.internet.userName();
  const repository = faker.lorem.slug();
  const toRet = `${baseURL}${username}/${repository}`;
  repoToFileName[toRet] = generateFileNames();
  return toRet;
}

// Generate random number between min and max (inclusive)
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate 1000 sets of JSON data
const possibleUrls = new Set();
for (let i = 0; i < 10; i++) {
  possibleUrls.add(generateFakeGitHubURL());
}

for (let i = 0; i < 1000; i++) {
  let startLine = randomInRange(1, 1000);
  let endLine = randomInRange(startLine, 1000); // Ensure end line is greater than or equal to start line

  const thisRepo = faker.random.arrayElement([...possibleUrls]);
  const repo = thisRepo.split("/")[4];
  const user = faker.internet.userName();

  const jsonData = {
    id: faker.datatype.number(),
    github_url: thisRepo,
    repo,
    github_user: user,
    github_branch: faker.git.branch(),
    github_head: faker.git.commitSha(),
    changed_file: faker.random.arrayElement(repoToFileName[thisRepo]),
    change_reason: faker.random.arrayElement(["redo", "undo"]),
    range_start_line: startLine,
    range_end_line: endLine,
    current_timestamp: getRandomTimestamp(),
  };

  if (!repoToData.has(repo)) {
    repoToData.set(repo, []);
  }
  repoToData.get(repo).push(jsonData);
}

const outputDir = "fake_data";
await ensureDirectory(outputDir);

for (const [repo, data] of repoToData.entries()) {
  const repoDir = path.join(outputDir, repo);
  await ensureDirectory(repoDir);
  const filePath = path.join(repoDir, `${repo}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`Data for repo ${repo} written to ${filePath}`);
}
