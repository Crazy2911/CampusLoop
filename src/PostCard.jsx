import PostImage from './PostImage'
import { Link } from 'react-router-dom'

function PostCard({ post }) {
  const isFix = post.type === 'fix'

  return (
    <article className="post-card flex min-w-0 flex-col rounded-xl border border-[#DEE5E0] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isFix
              ? 'bg-[#EEEEFC] text-[#484FC1]'
              : 'bg-[#E7F3EE] text-[#147765]'
          }`}
        >
          {isFix ? 'Fix my campus' : 'ReUse campus'}
        </span>

        <span className="rounded-full bg-[#F0F3F1] px-3 py-1 text-xs font-medium text-[#52645A]">
          {post.status}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold leading-snug break-words">
        {post.title}
      </h2>
      <PostImage
  src={post.imageUrl}
  alt={`Attached photo: ${post.title}`}
/>

      <p className="mt-2 text-sm leading-relaxed break-words text-[#596B62]">
        {post.description}
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">Location:</dt>
          <dd className="min-w-0 break-words text-[#596B62]">
            {post.location}
          </dd>
        </div>

        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">Category:</dt>
          <dd className="text-[#596B62]">{post.category}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <Link
          to={`/posts/${post.id}`}
          aria-label={`View details: ${post.title}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-semibold text-[#263F38] hover:underline"
        >
          View details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export default PostCard