/**
 * 拖动跟踪工具
 * 封装 touch 事件的追踪、delta 计算、滑动判定
 */
function createDrag() {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let active = false;

  return {
    /** 记录起点 */
    start(touch) {
      active = true;
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    },

    /** 计算拖动位移（px） */
    delta(touch, direction) {
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      return direction === 'horizontal' ? dx : dy;
    },

    /**
     * 计算拖动进度（-1 ~ 1），正值 = 向 next 拖动
     * @param {Object} touch
     * @param {string} direction
     * @param {number} containerSize
     */
    progress(touch, direction, containerSize) {
      if (!containerSize) return 0;
      const d = this.delta(touch, direction);
      return Math.max(-1, Math.min(1, -d / containerSize));
    },

    /**
     * 结束拖动，返回滑动判定
     * @returns {{ delta: number, velocity: number, swipe: number } | null}
     *   swipe: 1 = next, -1 = prev, 0 = 回弹
     */
    end(touch, direction, containerSize) {
      if (!active) return null;
      active = false;
      const delta = this.delta(touch, direction);
      const elapsed = Date.now() - startTime;
      const velocity = elapsed > 0 ? delta / elapsed : 0;

      let swipe = 0;
      if (delta < -containerSize * 0.3 || velocity < -0.4) {
        swipe = 1;
      } else if (delta > containerSize * 0.3 || velocity > 0.4) {
        swipe = -1;
      }

      return { delta, velocity, swipe };
    },

    isActive() {
      return active;
    },

    cancel() {
      active = false;
    },
  };
}

module.exports = { createDrag };
