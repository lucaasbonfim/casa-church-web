import * as Spinners from "react-spinners";

export default function Loader({
  type = "ClipLoader",
  color = "#ffffff",
  size = 35,
  speedMultiplier = 1,
  loading = true,
  className = "",
  ...props
}) {
  const SpinnerComponent = Spinners[type];

  if (!SpinnerComponent) {
    console.warn(`Loader "${type}" não encontrado no react-spinners`);
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <SpinnerComponent
        color={color}
        size={size}
        speedMultiplier={speedMultiplier}
        loading={loading}
        {...props}
      />
    </div>
  );
}
