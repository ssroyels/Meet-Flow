"use client";

import Image from "next/image";
import Link from "next/link";

interface Props {
  meetingName: string;
  duration: string;
  participants: number;
  endedAt: string;
  hostName?: string;
  onRejoin?: () => void;
}

export const CallEnded = ({
  meetingName,
  duration,
  participants,
  endedAt,
  hostName = "Host",
  onRejoin,
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-[#0A0A0A] text-white">
      
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-white/10 transition rounded-2xl mb-8"
      >
        <Image src="/logo.avif" width={36} height={36} alt="Logo" />
      </Link>

      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight">Call Ended</h2>
        <p className="text-white/60 text-lg mt-2">{meetingName}</p>
      </div>

      {/* Summary Card */}
      <div className="w-full max-w-lg bg-[#111214] p-6 rounded-2xl shadow-lg border border-white/5 backdrop-blur-lg">
        <h3 className="text-xl font-semibold mb-6">Meeting Summary</h3>

        <div className="space-y-4">
          {/* Row */}
          <SummaryRow label="Host" value={hostName} />

          <SummaryRow label="Duration" value={duration} />

          <SummaryRow label="Participants" value={participants.toString()} />

          <SummaryRow label="Ended At" value={endedAt} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-10">
        <Link
          href="/meetings"
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 transition rounded-full text-sm font-medium"
        >
          Back to Meetings
        </Link>

        {onRejoin && (
          <button
            onClick={onRejoin}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 transition rounded-full text-sm font-medium"
          >
            Rejoin
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------
   Summary Row Component
---------------------------------------------- */
const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
    <span className="text-white/60">{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);
