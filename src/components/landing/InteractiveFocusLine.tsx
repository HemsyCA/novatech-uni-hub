export function InteractiveFocusLine() {
  return (
    <>
      {/* Static white line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-white to-transparent" />
    </>
  );
}
