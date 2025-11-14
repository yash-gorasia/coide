import React from "react";
import { FiPlay, FiAlertCircle, FiCheckCircle, FiClock, FiTerminal } from "react-icons/fi";

const OutputWindow = ({ outputDetails }) => {

    const getOutput = () => {
        let statusId = outputDetails?.status?.id;

        if (statusId === 6) {
            return (
                <div className="flex items-start space-x-2">
                    <FiAlertCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                    <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap break-words">
                        {atob(outputDetails?.compile_output)}
                    </pre>
                </div>
            );
        } else if (statusId === 3) {
            return (
                <div className="flex items-start space-x-2">
                    <FiCheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap break-words">
                        {atob(outputDetails.stdout) || "No Output"}
                    </pre>
                </div>
            );
        } else if (statusId === 5) {
            return (
                <div className="flex items-start space-x-2">
                    <FiClock className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <pre className="text-sm font-mono text-yellow-400 whitespace-pre-wrap break-words">
                        {"Time Limit Exceeded"}
                    </pre>
                </div>
            );
        } else {
            return (
                <div className="flex items-start space-x-2">
                    <FiAlertCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                    <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap break-words">
                        {atob(outputDetails?.stderr)}
                    </pre>
                </div>
            );
        }
    };

    const getStatusIcon = () => {
        let statusId = outputDetails?.status?.id;
        if (statusId === 3) return <FiCheckCircle className="w-4 h-4 text-green-400" />;
        if (statusId === 6) return <FiAlertCircle className="w-4 h-4 text-red-400" />;
        if (statusId === 5) return <FiClock className="w-4 h-4 text-yellow-400" />;
        return <FiTerminal className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="h-full bg-zinc-900 text-gray-200">
            <div className="h-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
                {/* Output Content */}
                <div className="h-full flex flex-col">
                    {outputDetails ? (
                        <div className="flex-1 p-4 overflow-y-auto">
                            {getOutput()}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <FiTerminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Run your code to see output here</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Status Bar */}
                    {outputDetails && (
                        <div className="border-t border-zinc-700/50 p-3 bg-zinc-800/30">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon()}
                                    <span className="text-gray-300">
                                        {outputDetails?.status?.description || "Unknown"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4 text-gray-400">
                                    {outputDetails?.time && (
                                        <span>⏱️ {outputDetails.time}s</span>
                                    )}
                                    {outputDetails?.memory && (
                                        <span>💾 {outputDetails.memory}KB</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutputWindow;
