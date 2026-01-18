'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg">
      <p className="text-sm text-gray-400">
        Mostrando página <span className="font-medium text-white">{page}</span> de{' '}
        <span className="font-medium text-white">{totalPages}</span>
        {' '}({total} itens)
      </p>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition"
            >
              1
            </button>
            {start > 2 && <span className="text-gray-500 px-1">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              p === page
                ? 'bg-brew-gold text-brew-black font-medium'
                : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-500 px-1">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
