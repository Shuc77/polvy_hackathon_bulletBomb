import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { toast } from '@/hooks/components/use-toast';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { DocEvents, MobileWatchLayout } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

export function bindDocEvents(): void {
  const watchCore = getWatchCore();
  const docStore = useDocStore();
  const layoutStore = useLayoutStore();

  watchCore.doc.eventEmitter.on(DocEvents.DocInfoChange, () => {
    docStore.syncDocStore();
  });

  watchCore.doc.eventEmitter.on(DocEvents.PaintAuthStatusChange, data => {
    // 竖屏不做双向白板
    if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait && isMobile) {
      return;
    }

    const msg = data.hasPaintAuth ? translate('doc.givePaint') : translate('doc.removePaint');
    toast.info(msg);

    if (isMobile) {
      if (data.hasPaintAuth) {
        watchCore.doc.enterPaintMode();
      } else {
        watchCore.doc.exitPaintMode();
      }
    }
  });
}
