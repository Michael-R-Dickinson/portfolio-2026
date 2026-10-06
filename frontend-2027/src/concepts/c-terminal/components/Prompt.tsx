import { useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Props = {
  command: string
  /** Type the command in once on mount (skipped under reduced motion). */
  typed?: boolean
  /** Show a blinking cursor after the command. */
  cursor?: boolean
  as?: 'h1' | 'h2' | 'p'
  id?: string
}

// A shell prompt line: `michael@ubc:~$ <command>`. Used as section headers.
export function Prompt({ command, typed = false, cursor = false, as: Tag = 'h2', id }: Props) {
  const reduced = useReducedMotion()
  const animate = typed && !reduced
  const [n, setN] = useState(animate ? 0 : command.length)

  useEffect(() => {
    if (!animate) return
    let i = 0
    const t = window.setInterval(() => {
      i += 1
      setN(i)
      if (i >= command.length) window.clearInterval(t)
    }, 55)
    return () => window.clearInterval(t)
  }, [animate, command])

  const shown = animate ? command.slice(0, n) : command

  return (
    <Tag id={id} className="ct-prompt" aria-label={`$ ${command}`}>
      <span className="ct-prompt-host" aria-hidden>
        michael@ubc
      </span>
      <span className="ct-prompt-sep" aria-hidden>
        :~$
      </span>{' '}
      <span className="ct-prompt-cmd" aria-hidden>
        {shown}
      </span>
      {cursor && <span className="ct-cursor" aria-hidden />}
    </Tag>
  )
}
