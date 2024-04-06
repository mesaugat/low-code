import React from 'react';
import useSWR from 'swr';
import { Typewriter } from 'react-simple-typewriter';

const SUGGEST_URL = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev/suggest';

const fetcher = (url) => fetch(url).then((res) => res.json());

const Suggestion = (props) => {
  const { repoUrl } = props;

  const { data: suggestedData, error, isLoading } = useSWR(`${SUGGEST_URL}?repo_url=${repoUrl}`, fetcher);

  if (isLoading) {
    return <div>Loading Suggestions....</div>;
  }

  if (error) {
    return <div>Opps something went wrong.</div>;
  }

  const suggestionText = suggestedData.suggestions;

  return (
    <div>
      <div className="whitespace-pre-line">
        <Typewriter words={[suggestionText]} typeSpeed={1} />
      </div>
    </div>
  );
};

export default Suggestion;
