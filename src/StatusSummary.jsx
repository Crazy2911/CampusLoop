function StatusSummary({ posts }) {
  const summaries = [
    {
      label: 'Open issues',
      count: posts.filter(
        (post) =>
          post.type === 'fix' &&
          ['Reported', 'In progress'].includes(post.status)
      ).length,
      description: 'Reported or in progress',
      accent: 'border-t-[#484FC1]',
      numberColor: 'text-[#484FC1]',
    },
    {
      label: 'Resolved issues',
      count: posts.filter(
        (post) =>
          post.type === 'fix' &&
          post.status === 'Resolved'
      ).length,
      description: 'Marked as resolved',
      accent: 'border-t-[#147765]',
      numberColor: 'text-[#147765]',
    },
    {
      label: 'Available items',
      count: posts.filter(
        (post) =>
          post.type === 'reuse' &&
          post.status === 'Available'
      ).length,
      description: 'Ready for someone new',
      accent: 'border-t-[#147765]',
      numberColor: 'text-[#147765]',
    },
    {
      label: 'Collected items',
      count: posts.filter(
        (post) =>
          post.type === 'reuse' &&
          post.status === 'Collected'
      ).length,
      description: 'Passed on to someone',
      accent: 'border-t-[#8A601C]',
      numberColor: 'text-[#8A601C]',
    },
  ]

  return (
    <section
      aria-labelledby="summary-heading"
      className="mt-6"
    >
      <div className="mb-3">
        <h2
          id="summary-heading"
          className="text-lg font-semibold text-[#263F38]"
        >
          Campus at a glance
        </h2>

        <p className="mt-1 text-sm text-[#596B62]">
          Counts across all posts on the board.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaries.map((summary) => (
          <div
            key={summary.label}
            className={`min-w-0 rounded-xl border border-[#DEE5E0] border-t-4 bg-white p-4 ${summary.accent}`}
          >
            <dt className="text-sm font-semibold text-[#435E50]">
              {summary.label}
            </dt>

            <dd
              className={`mt-2 text-3xl font-bold tabular-nums ${summary.numberColor}`}
            >
              {summary.count}
            </dd>

            <dd className="mt-2 text-sm leading-relaxed text-[#596B62]">
              {summary.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default StatusSummary