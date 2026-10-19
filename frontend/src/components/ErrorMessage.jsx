export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error" role="alert">
      <b>Something went wrong.</b> {message}
      {onRetry && <button className="pill" onClick={onRetry}>Try again</button>}
    </div>
  )
}
