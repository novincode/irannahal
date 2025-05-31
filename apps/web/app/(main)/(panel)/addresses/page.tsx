import React from 'react'
import { getAddresses } from '@actions/addresses/get'
import AddressesPageClient from './AddressesPageClient'

export default async function AddressesPage() {
  const addresses = await getAddresses()

  return <AddressesPageClient initialAddresses={addresses} />
}
