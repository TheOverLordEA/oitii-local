"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Eye, CheckCircle, AlertCircle } from "lucide-react";

interface ApplyConfirmationCardProps {
  applicationId: string;
  jobTitle: string;
  company: string;
  location?: string | null;
  jobUrl: string;
  onConfirm?: (applicationId: string) => void;
  onCancel?: (applicationId: string) => void;
}

export function ApplyConfirmationCard({
  applicationId,
  jobTitle,
  company,
  location,
  jobUrl,
  onConfirm,
  onCancel,
}: ApplyConfirmationCardProps) {
  const [status, setStatus] = useState<"pending" | "submitting" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConfirm = async () => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/apply-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `Failed to submit application`);
      }

      setStatus("success");
      onConfirm?.(applicationId);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to apply");
    }
  };

  const handleCancel = () => {
    onCancel?.(applicationId);
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-4 my-2"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Application submitted successfully!</span>
        </div>
      </motion.div>
    );
  }

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-50 border border-red-200 rounded-2xl p-4 my-2"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">Application failed</span>
        </div>
        <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm my-2"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-zinc-900 text-sm">Confirm Application</h4>
          <p className="text-zinc-600 text-sm mt-0.5">
            Ready to apply for <span className="font-medium text-zinc-900">{jobTitle}</span> at{" "}
            <span className="font-medium text-zinc-900">{company}</span>?
          </p>
          {location && (
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1">
              <MapPin className="w-3 h-3" />
              {location}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
        <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <Eye className="w-3 h-3" />
          {company} &middot; {jobTitle}
        </span>
        <div className="flex-1" />
        <button
          onClick={handleCancel}
          disabled={status === "submitting"}
          className="px-3 py-1.5 text-zinc-600 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={status === "submitting"}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {status === "submitting" ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            "Confirm Apply"
          )}
        </button>
      </div>
    </motion.div>
  );
}
