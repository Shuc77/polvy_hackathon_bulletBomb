/* eslint-disable import/first */
import '@polyv/polyv-ui/lib-admin/theme/iconfont.css';
export { default as PlvAdminIcon } from '@polyv/polyv-ui/lib-admin/icon';

import '@polyv/polyv-ui/lib-admin/theme/image-preview.css';
export { default as PlvImagePreview } from '@polyv/polyv-ui/lib-admin/image-preview';

import '@polyv/polyv-ui/lib-admin/theme/input-paste-image.css';
export { default as PlvInputPasteImage } from '@polyv/polyv-ui/lib-admin/input-paste-image';

import '@polyv/polyv-ui/lib-admin/theme/collapse-transition.css';
export { default as PlvCollapseTransition } from '@polyv/polyv-ui/lib-admin/collapse-transition';

import PlvPopperManager from '@polyv/polyv-ui/lib-admin/popper-manager';
PlvPopperManager.zIndex = 3000;
export { PlvPopperManager };

import '@polyv/polyv-ui/lib-admin/theme/pagination.css';
export { default as PlvPagination } from '@polyv/polyv-ui/lib-admin/pagination';
