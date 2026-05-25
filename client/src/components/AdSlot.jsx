export default function AdSlot({ label = 'Advertisement' }) {
  return (
    <div className="ad-card">
      <span>{label} slot · Add AdSense code after approval</span>
    </div>
  );
}
