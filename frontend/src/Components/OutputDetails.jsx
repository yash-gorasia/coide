import React from "react";
import { FiCpu, FiClock, FiInfo } from "react-icons/fi";

const OutputDetails = ({ outputDetails }) => {
    const getStatusColor = () => {
        let statusId = outputDetails?.status?.id;
        if (statusId === 3) return "text-green-400 bg-green-400/10 border-green-400/20";
        if (statusId === 6) return "text-red-400 bg-red-400/10 border-red-400/20";
        if (statusId === 5) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    };

    return (
        <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
                <FiInfo className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-gray-300">Execution Details</h3>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getStatusColor()}`}>
                        {outputDetails?.status?.description || "Unknown"}
                    </span>
                </div>

                {outputDetails?.memory && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <FiCpu className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Memory:</span>
                        </div>
                        <span className="text-xs text-gray-300 font-mono bg-zinc-700/50 px-2 py-1 rounded">
                            {outputDetails.memory} KB
                        </span>
                    </div>
                )}

                {outputDetails?.time && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Time:</span>
                        </div>
                        <span className="text-xs text-gray-300 font-mono bg-zinc-700/50 px-2 py-1 rounded">
                            {outputDetails.time} s
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputDetails;
