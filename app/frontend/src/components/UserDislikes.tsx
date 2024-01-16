import React from 'react'

import { type components } from '../types/api.generated'

import BannedIngredient from './BannedIngredient'
import BannedTag from './BannedTag'

type UserBannedTags = components['schemas']['User']['bannedTags']
type UserBannedIngredients = components['schemas']['User']['bannedIngredients']

export interface UserPreferencesProps {
  userId: number
  bannedTags: UserBannedTags
  bannedIngredients: UserBannedIngredients
}

export default function UserPreferences (props: UserPreferencesProps): React.JSX.Element {
  return (
    <div>
      <h3>Dietary Restrictions</h3>
      <p>Types of food disallowed by your diet.</p>
      <ul className='list-inside list-disc'>
        {props.bannedTags.length === 0 && <p>No dietary restrictions.</p>}
        {props.bannedTags.map(tag => (
          <BannedTag
            key={tag.id}
            name={tag.name}
            description={tag.description}
          />
        ))}
      </ul>

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
