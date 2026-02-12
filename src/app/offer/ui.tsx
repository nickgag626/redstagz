'use client'

import { useState } from 'react'

export function OfferForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [offerText, setOfferText] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)

    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName, email, offerText, message }),
    })

    if (!res.ok) {
      const text = await res.text()
      setStatus('error')
      setError(text || 'Failed to submit offer')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="font-semibold">Offer submitted.</div>
        <p className="mt-2 text-sm text-gray-600">I’ll take a look and get back to you.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Your name</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email (optional)</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Your offer (free text)</label>
        <textarea
          className="mt-1 min-h-[120px] w-full rounded-md border px-3 py-2"
          value={offerText}
          onChange={(e) => setOfferText(e.target.value)}
          required
          placeholder="Example: I’ll trade you X + Y for Player Z"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Notes (optional)</label>
        <textarea
          className="mt-1 min-h-[80px] w-full rounded-md border px-3 py-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {status === 'error' ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit offer'}
      </button>
    </form>
  )
}
