import React from 'react'

import { type components } from '../../types/api.generated'

import IngredientOptionsList from './IngredientOptionsList'
import TagsOptionsList from './TagsOptionsList'

type Tag = components['schemas']['Tag']
type UserBannedIngredients = components['schemas']['User']['bannedIngredients']

export interface UserPreferencesProps {
  userId: number
  bannedTags: Tag[]
  setBannedTags: (bannedTags: Tag[]) => void
  bannedIngredients: UserBannedIngredients
  setBannedIngredients: (bannedIngredients: UserBannedIngredients) => void
}

export default function UserPreferences (props: UserPreferencesProps): React.JSX.Element {
  return (
    <div>
      <h3>Dietary Restrictions</h3>
      <p>Types of food allowed or disallowed by your diet.</p>
      <TagsOptionsList
        userId={props.userId}
        bannedTags={props.bannedTags}
        setBannedTags={props.setBannedTags}
      />

      <h3>Disliked Ingredients</h3>
      <p>Specific ingredients you don&apos;t like or can&apos;t eat.</p>
      <IngredientOptionsList
        bannedIngredients={props.bannedIngredients}
        setBannedIngredients={props.setBannedIngredients}
      />
    </div>
  )
}
