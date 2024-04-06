import React from 'react';
import useSWR from 'swr';

const SUGGEST_URL = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/dev/suggest';


export const fetcher = async (args) => {
  const [url, payload] = args;

  const options = {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, options).then((r) => r.json());
};

const Suggestion = (props) => {
  const { data } = props;

  const payloadData = {
    payload_json: data,
    prompt_text: 'Summarize this json data.',
  };

  const {data: suggestedData, isLoading } = useSWR([SUGGEST_URL, JSON.stringify(payloadData)], fetcher, {
    revalidateOnFocus: false,
  });

  const suggestionText = suggestedData?.outputs?.[0]?.text;

  if (isLoading) {
    return <div>Loading Suggestions....</div>;
  }

  return (
    <div>
      <div className="whitespace-pre-line">{suggestionText}</div>
    </div>
  )
};

export default Suggestion;
