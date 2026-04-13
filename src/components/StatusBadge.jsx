export default function StatusBadge({ value }) {
  const v = String(value || "").toLowerCase();
  const cls =
    v === "selesai" ? "bg-green-100 text-green-800 ring-green-300" :
    v === "siap_kirim" ? "bg-blue-100 text-blue-800 ring-blue-300" :
    v === "terkirim" ? "bg-emerald-100 text-emerald-800 ring-emerald-300" :
    "bg-yellow-100 text-yellow-800 ring-yellow-300";
  return (
  <span className={`px-2 py-1 rounded text-[11px] md:text-xs font-medium ring-1 ${cls}`}>
    {value || "-"}
  </span>
);
}
