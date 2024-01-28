import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import { type ApiError } from '../../types/ApiError'
import apiClient from '../../apiClient'
import { type components } from '../../types/api.generated'
import monitorOutcome from '../../utils/monitorOutcome'

import TagOption from './TagOption'

type Tag = components['schemas']['Tag']

export interface TagsOptionsProps {
  userId: number
  bannedTags: Tag[]
  setBannedTags: (bannedTags: Tag[]) => void
}

export default function TagsOptionsList (props: TagsOptionsProps): React.JSX.Element {
  const [allTags, setAllTags] = React.useState<Tag[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET('/tag/list')
      .then(
        monitorOutcome(setStatus)
      ).then(
        setAllTags
      ).catch((err: ApiError) => {
        console.error(err.message)
        setStatus('error')
      })
  }, [])

  if (status !== 'done') {
    return <LoadingSpinner status={status} />
  }

  const bannedTagIds = new Set(props.bannedTags.map(t => t.id))

  return (
    <ul>
      {allTags.map(tag => (
        <TagOption
          key={tag.id}
          name={tag.name}
          id={tag.id}
          description={tag.description}
          allowed={!bannedTagIds.has(tag.id)}
          // TODO: Set status on server
          onChange={status => {
            props.setBannedTags(
              status
                ? props.bannedTags.filter(t => t.id !== tag.id)
                : [...props.bannedTags, tag]
            )
          }}
        />
      ))}
    </ul>
  )
}
