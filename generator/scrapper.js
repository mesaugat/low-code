import { Octokit } from 'octokit';
import fetch from 'node-fetch';

const octokit = new Octokit({
  auth: process.env.AUTH_GITHUB_TOKEN,
  request: {
    fetch: fetch,
  },
});

async function run(repo_url, owner, repo) {
  const commits = await octokit.paginate('GET /repos/{owner}/{repo}/commits', {
    owner: owner,
    repo: repo,
    per_page: 100,
    since: '2023-01-01T00:00:00Z',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  console.log('Total Commits: ', commits.length);

  for (const commit of commits) {
    let sha = commit['sha'];
    let parents = commit['parents'];
    let base_branch = 'main';
    if (parents) {
      base_branch = parents[0]['sha'];
    }

    const details = await octokit.paginate('GET /repos/{owner}/{repo}/commits/{sha}', {
      owner: owner,
      repo: repo,
      sha: sha,
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    let events = [];
    for (const commit_details of details) {
      for (let f of commit_details['files']) {
        events.push({
          change_reason: f['status'],
          changed_file: f['filename'],
          is_dirty: 0,
          range_start_line: 0,
          range_end_line: 0,
          repo_branch: 'main',
          repo_head: base_branch,
          repo_url: repo_url,
          repo_user: commit['commit']['author']['name'],
          timestamp: commit['commit']['author']['date'],
        });
      }
    }

    if (events.length > 0) {
      try {
        await fetch('https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev/ingest', {
          method: 'POST',
          body: JSON.stringify(events),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
}

run('github.com/facebook/react.git', 'facebook', 'react');
