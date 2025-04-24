import React from "react";

const OutputWindow = ({ outputDetails }) => {

    const getOutput = () => {
        let statusId = outputDetails?.status?.id;

        if (statusId === 6) {
            return (
                <pre className="px-4 py-2 text-sm font-mono text-red-400  rounded-md">
                    {atob(outputDetails?.compile_output)}
                </pre>
            );
        } else if (statusId === 3) {
            return (
                <pre className="px-4 py-2 text-sm font-mono text-green-400  rounded-md">
                    {atob(outputDetails.stdout) || "No Output"}
                </pre>
            );
        } else if (statusId === 5) {
            return (
                <pre className="px-4 py-2 text-sm font-mono text-yellow-400  rounded-md">
                    {"Time Limit Exceeded"}
                </pre>
            );
        } else {
            return (
                <pre className="px-4 py-2 text-sm font-mono text-red-400  rounded-md">
                    {atob(outputDetails?.stderr)}
                </pre>
            );
        }
    };

    return (
        <div className="p-4 bg-[#0f172a] rounded-lg shadow-lg">
            <h1 className="text-lg font-semibold text-gray-300 mb-3">
                <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    Output
                </span>
            </h1>
            <div className="w-full h-56 bg-[#1e293b] rounded-lg text-gray-200 text-sm overflow-y-auto p-4">
                {outputDetails ? getOutput() : <p className="text-gray-400">No output yet...</p>}
            </div>
        </div>
    );
};

export default OutputWindow;
