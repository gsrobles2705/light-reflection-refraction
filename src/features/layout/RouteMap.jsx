import { useMemo } from 'react'
import { ROUTE_STAGES } from '../../content/navigation.js'
import { useActiveSection } from '../../hooks/useActiveSection.js'
import { useScrolledDown } from '../../hooks/useScrolledDown.js'

/**
 * Bottom route bar for phones and tablets (from 900 px up the header carries the stages): the five stages with the
 * current one expanded to show the section being read. It hides while scrolling down and returns when scrolling up.
 * Hidden on the intro (nothing to orient yet) and while presenting.
 */
export default function RouteMap({ items }) {
  const sectionIds = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveSection(sectionIds)
  const hidden = useScrolledDown()
  const stageIndex = ROUTE_STAGES.findIndex((stage) => stage.sections.includes(activeId))
  if (stageIndex < 0) return null
  const stage = ROUTE_STAGES[stageIndex], label = items.find((item) => item.id === activeId).label
  const inStage = stage.sections.indexOf(activeId) + 1

  return (
    <div className={'rmap' + (hidden ? ' is-hidden' : '')} role="navigation" aria-label="Recorrido de la página">
      <ol>
        {ROUTE_STAGES.map((item, i) => {
          const on = i === stageIndex
          return (
            <li key={item.id} className={(on ? 'on ' : '') + (i < stageIndex ? 'done' : '')}>
              <a href={'#' + item.sections[0]} aria-current={on ? 'step' : undefined}
                aria-label={on ? `${i + 1}. ${item.label}: ${label}, ${inStage} de ${stage.sections.length}` : `${i + 1}. ${item.label}`}>
                <i aria-hidden="true">{i + 1}</i>
                <span aria-hidden="true"><b>{item.label}</b>{on && <small>{label} · {inStage}/{stage.sections.length}</small>}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
