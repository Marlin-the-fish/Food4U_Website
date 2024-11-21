'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React from 'react'
import Link from 'next/link'


// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>
          <Link href="/Authorization">Login</Link>
        </h1>
        <h1>
          <Link href="/User">Reserve A Table</Link>
        </h1>
      </div>
    </main>
  )
}
