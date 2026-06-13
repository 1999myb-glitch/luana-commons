import { notFound } from 'next/navigation'
import { getPlayer } from '@/lib/futari-quest/constants'
import PersonClient from './PersonClient'

export default async function FutariQuestPersonPage({
  params,
}: {
  params: Promise<{ person: string }>
}) {
  const { person } = await params
  const player = getPlayer(person)
  if (!player) notFound()

  return <PersonClient player={player} />
}
