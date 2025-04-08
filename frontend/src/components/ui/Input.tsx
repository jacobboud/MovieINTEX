export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-400 ${props.className || ''}`}
    />
  );
}
