import React from 'react'

import { type components } from '../types/api.generated'
import apiClient from '../apiClient'
import monitorStatus, { type ApiError } from '../utils/monitorStatus'

import LoadingSpinner, { type LoadingStatus } from './LoadingSpinner'
import TagOption from './TagOption'

type Tag = components['schemas']['Tag']

export interface TagsOptionsProps {
  userId: number
  bannedTags: Tag[]
}

export default function TagsOptions (props: TagsOptionsProps): React.JSX.Element {
  const [allTags, setAllTags] = React.useState<Tag[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET('/tag/list')
      .then(
        monitorStatus(setStatus)
      ).then(
        setAllTags
      ).catch((err: ApiError) => {
        console.error(err.message)
        setStatus('error')
      })
  }, [])

  // TODO: Probably want an endpoint that returns all tags and their status for a user
  // useState is a bit of a hack here
  // NOTE: React doesn't like making a variable number of states, so this has to come before the early return
  const [bannedTagIds, setBannedTagIds] = React.useState<Set<number>>(new Set(props.bannedTags.map(tag => tag.id)))

  if (status !== 'done') {
    return <LoadingSpinner status={status} />
  }

  return (
    <ul>
      {props.bannedTags.length === 0 && <p>No dietary restrictions.</p>}
      {allTags.map(tag => (
        <TagOption
          key={tag.id}
          name={tag.name}
          description={tag.description}
          allowed={!bannedTagIds.has(tag.id)}
          // TODO: Set status on server
          setAllowed={status => {
            // TODO: Setstate cleaner
            const newBannedTagIds = new Set(bannedTagIds)
            if (status) {
              newBannedTagIds.delete(tag.id)
            } else {
              newBannedTagIds.add(tag.id)
            }
            setBannedTagIds(newBannedTagIds)
          }}
        />
      ))}
    </ul>
  )
}
