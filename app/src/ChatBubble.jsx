const ChatBubble = (props) => {
  const { children } = props;

  return (
    <div className="flex items-start gap-2.5">
      <img className="w-8 h-8 rounded-full" src="../logo.png" alt="LowCode Bot Logo" />
      <div className="flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">LowCode Bot</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{new Date().toLocaleString()}</span>
        </div>
        <div className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{children}</div>
      </div>
    </div>
  );
};

export default ChatBubble;
