import React from 'react'
import HeaderMenu from './HeaderMenu'

interface HeaderNavigationProps {
  className?: string
}

// Server component for rendering navigation menu
const HeaderNavigation: React.FC<HeaderNavigationProps> = async ({ className }) => {
  return (
    <nav className={`p-2 ${className || ''}`}>
      <div className="container flex">
        <HeaderMenu />
      </div>
    </nav>
  )
}

export default HeaderNavigation
