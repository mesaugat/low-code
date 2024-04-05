import faker from 'faker';
import fs from 'fs'


let repoToFileName = {};
// Function to generate a random file name with .py or .js extension


// Function to generate a random timestamp
function getRandomTimestamp() {
    return faker.date.recent().toISOString();
}


function getRandomNumberFiles() {
    return Math.floor(Math.random() * (20 - 10 + 1)) + 10;
}

// Function to generate fake GitHub URLs
function generateFakeGitHubURL() {
    const baseURL = 'https://github.com/';
    const username = faker.internet.userName();
    const repository = faker.lorem.slug();
    const d = Date.now();
    const ex = d % 2 == 0 ? '.js' : '.py'
    let files = [];
    for (let i = 0; i < getRandomNumberFiles(); i++) {
        const fileName = faker.system.fileName();
        files.push(fileName.split('.')[0] + ex);
    }
    const toRet = `${baseURL}${username}/${repository}`;
    repoToFileName[toRet] = files;
    return toRet;
}
// Generate random number between min and max (inclusive)
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate 100 sets of JSON data
let possibleUrls = [];
let possibleUsers = [];
for (let i = 0; i < 10; i++) {
    const url = generateFakeGitHubURL();
    possibleUrls.push(url);
    const user = faker.internet.userName();
    possibleUsers.push(user)
}
const dataSet = [];
for (let i = 0; i < 1000; i++) {
    let startLine = randomInRange(1, 1000);
    let endLine = randomInRange(startLine, 1000); // Ensure end line is greater than or equal to start line
    const thisRepo = faker.random.arrayElement(possibleUrls);
    const jsonData = {
        "id": faker.random.number(),
        "github_url": thisRepo,
        "repo": thisRepo.split('/')[4],
        "github_user": faker.random.arrayElement(possibleUsers),
        "github_branch": faker.git.branch(),
        "github_head": faker.git.commitSha(),
        "changed_file": faker.random.arrayElement(repoToFileName[thisRepo]),
        "change_reason": faker.random.arrayElement(['redo', 'undo']),
        "range_start_line": startLine,
        "range_end_line": endLine,
        "current_timestamp": getRandomTimestamp()
    };

    dataSet.push(jsonData);
}

let arr  = [];
for (let i =0; i < dataSet.length; i++){    
    const thisUrl = dataSet[i].github_url;
    fs.promises.writeFile(`./fake_data/data_${Date.now()}${i}.json`, JSON.stringify(dataSet[i], null, 2), err => console.log)
}

console.log(JSON.stringify(dataSet, null, 2));