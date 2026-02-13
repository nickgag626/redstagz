import { OfferForm } from './ui'

export default function OfferPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Propose a trade</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Put your offer in plain English. Include picks/players/etc. I’ll follow up if it’s interesting.
      </p>
      <div className="mt-6">
        <OfferForm />
      </div>
    </main>
  )
}
