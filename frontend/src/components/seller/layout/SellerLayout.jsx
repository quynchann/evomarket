import React from 'react'
import { Outlet } from 'react-router-dom'
import SellerHeader from './SellerHeader'

export function SellerLayout() {
  return (
    <div className="flex h-dvh flex-col bg-linear-to-br from-orange-50 via-white to-red-50">
      <SellerHeader />
      <main className="h-svh w-full flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
