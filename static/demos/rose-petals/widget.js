import { initializeRoseWidget } from './rose.js';

function hideTarget(target, error) {
  console.error('Unable to load Rose Petals widget.', error);

  if (target) {
    target.hidden = true;
  }
}

export async function loadRosePetalsWidget(targetSelector, sourcePath = '/demos/rose-petals/') {
  const target = document.querySelector(targetSelector);

  try {
    if (!target) {
      throw new Error(`Rose Petals widget target not found: ${targetSelector}`);
    }

    const response = await fetch(sourcePath);
    if (!response.ok) {
      throw new Error(`Unable to fetch ${sourcePath}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rose = doc.querySelector('.rose');
    const dialog = doc.querySelector('#rose-confirm');

    if (!rose) {
      throw new Error(`Rose Petals widget markup missing .rose in ${sourcePath}`);
    }

    if (!dialog) {
      throw new Error(`Rose Petals widget markup missing #rose-confirm in ${sourcePath}`);
    }

    target.replaceChildren(rose.cloneNode(true), dialog.cloneNode(true));
    initializeRoseWidget(targetSelector);
  } catch (error) {
    hideTarget(target, error);
  }
}
