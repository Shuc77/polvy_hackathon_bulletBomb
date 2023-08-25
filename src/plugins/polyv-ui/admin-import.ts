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

import '@polyv/polyv-ui/lib-admin/theme/slider.css';
export { default as PlvSlider } from '@polyv/polyv-ui/lib-admin/slider';

import '@polyv/polyv-ui/lib-admin/theme/row.css';
export { default as PlvRow } from '@polyv/polyv-ui/lib-admin/row';

import '@polyv/polyv-ui/lib-admin/theme/col.css';
export { default as PlvCol } from '@polyv/polyv-ui/lib-admin/col';

import '@polyv/polyv-ui/lib-admin/theme/tips.css';
export { default as PlvTips } from '@polyv/polyv-ui/lib-admin/tips';

import '@polyv/polyv-ui/lib-admin/theme/popper.css';
export { default as PlvPopper } from '@polyv/polyv-ui/lib-admin/popper';
