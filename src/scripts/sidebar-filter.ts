/**
 * Sidebar filtering for Finder-style windows.
 *
 * Markup contract:
 * - A container with `data-filter-root` holds everything.
 * - Sidebar buttons carry `data-filter="<value>"`; an empty value means "all".
 * - Filterable items carry `data-filter-tags="a|b|c"`.
 * - Optional `data-filter-section` wrappers hide when none of their items match.
 * - An optional `data-filter-empty` element shows when nothing matches.
 */
export function initFilters(scope: ParentNode) {
  scope.querySelectorAll<HTMLElement>('[data-filter-root]').forEach(setupFilter);
}

function setupFilter(root: HTMLElement) {
  if (root.dataset.filterReady) return;
  root.dataset.filterReady = 'true';

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-tags]'));
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-section]'));
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');

  const apply = (value: string) => {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));

    let visible = 0;
    items.forEach((item) => {
      const tags = (item.dataset.filterTags ?? '').split('|');
      const match = value === '' || tags.includes(value);
      item.hidden = !match;
      if (match) visible++;
    });

    sections.forEach((section) => {
      section.hidden = !section.querySelector('[data-filter-tags]:not([hidden])');
    });

    if (empty) empty.hidden = visible > 0;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.filter ?? ''));
  });
}
