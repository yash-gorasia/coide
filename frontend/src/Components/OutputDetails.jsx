import React from "react";

const OutputDetails = ({ outputDetails }) => {
    return (
        <div className="p-4 bg-[#0f172a] rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-300 mb-3">
                <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    Execution Details
                </span>
            </h2>

            <div className="space-y-2 text-gray-400">
                <p className="text-sm">
                    <span className="font-semibold text-gray-300">Status:</span>{" "}
                    <span className="px-3 py-1 rounded-md bg-gray-800 text-gray-100">
                        {outputDetails?.status?.description || "Unknown"}
                    </span>
                </p>

                <p className="text-sm">
                    <span className="font-semibold text-gray-300">Memory Used:</span>{" "}
                    <span className="px-3 py-1 rounded-md bg-gray-800 text-gray-100">
                        {outputDetails?.memory ? `${outputDetails.memory} KB` : "N/A"}
                    </span>
                </p>

                <p className="text-sm">
                    <span className="font-semibold text-gray-300">Execution Time:</span>{" "}
                    <span className="px-3 py-1 rounded-md bg-gray-800 text-gray-100">
                        {outputDetails?.time ? `${outputDetails.time} s` : "N/A"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default OutputDetails;
