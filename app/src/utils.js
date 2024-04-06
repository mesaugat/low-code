export const getPathFromNode = (props) => {
  const { url = '', isLeaf = false, nodeData } = props;
  console.log(nodeData);

  if (!nodeData?.children?.length) {
    return { url: `https://${nodeData.data.url}`, isLeaf: true, nodeData: null };
  }

  if (!nodeData?.parent) {
    return { url: url, isLeaf: false, nodeData: null };
  }

  return getPathFromNode({ url: [nodeData.data.name, url].join('/'), isLeaf: isLeaf, nodeData: nodeData.parent });
};
