export default function Spinner({ size = 'md' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${s} border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin`} />
    </div>
  );
}
