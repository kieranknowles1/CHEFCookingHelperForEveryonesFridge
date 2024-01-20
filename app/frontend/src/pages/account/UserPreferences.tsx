import React from 'react'

import { type components } from '../../types/api.generated'

import BannedIngredient from '../../components/BannedIngredient'
import TagsOptionsList from './TagsOptionsList'

type Tag = components['schemas']['Tag']
type UserBannedIngredients = components['schemas']['User']['bannedIngredients']

export interface UserPreferencesProps {
  userId: number
  bannedTags: Tag[]
  bannedIngredients: UserBannedIngredients
}

export default function UserPreferences (props: UserPreferencesProps): React.JSX.Element {
  return (
    <div>
      <h3>Dietary Restrictions</h3>
      <p>Types of food allowed or disallowed by your diet.</p>
      <TagsOptionsList userId={props.userId} bannedTags={props.bannedTags} />

      <h3>Disliked Ingredients</h3>
      <p>Specific ingredients you don&apos;t like or can&apos;t eat.</p>
      <ul className='list-inside list-disc'>
        {props.bannedIngredients.length === 0 && <p>No disliked ingredients.</p>}
        {props.bannedIngredients.map(ingredient => (
          <BannedIngredient
            key={ingredient.id}
            name={ingredient.name}
          />
        ))}
      </ul>
    </div>
  )
}
