import React, { ReactElement } from 'react';

// Icon data for the module library item.
export const name      = 'is/module-example'; // Unique icon name (referenced by module.json moduleIcon).
export const viewBox   = '0 96 960 960'; // Adjust to match your SVG path.
export const component = (): ReactElement => (
  <path d="M114 838V710h491v128H114Zm0-198V512h733v128H114Zm0-198V314h733v128H114Z" />
); // SVG path only, without the <svg> wrapper tag.
