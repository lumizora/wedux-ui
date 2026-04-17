const { QrCode, Ecc } = require('../../libs/qrcodegen');

const ECL_MAP = {
  L: Ecc.LOW,
  M: Ecc.MEDIUM,
  Q: Ecc.QUARTILE,
  H: Ecc.HIGH,
};

Component({
  properties: {
    value: {
      type: String,
      value: '',
    },
    size: {
      type: Number,
      value: 160,
    },
    color: {
      type: String,
      value: '#000000',
    },
    backgroundColor: {
      type: String,
      value: '#FFFFFF',
    },
    errorCorrectionLevel: {
      type: String,
      value: 'M',
    },
    padding: {
      type: Number,
      value: 12,
    },
    iconSrc: {
      type: String,
      value: '',
    },
    iconSize: {
      type: Number,
      value: 40,
    },
    iconBackgroundColor: {
      type: String,
      value: '#FFFFFF',
    },
    iconBorderRadius: {
      type: Number,
      value: 4,
    },
  },

  data: {
    _canvasSize: 0,
    _tempImagePath: '',
  },

  lifetimes: {
    attached() {
      this._draw();
    },
  },

  observers: {
    'value, size, color, backgroundColor, errorCorrectionLevel, padding, iconSrc, iconSize, iconBackgroundColor, iconBorderRadius'() {
      this._draw();
    },
  },

  methods: {
    _draw() {
      const { value, size, padding } = this.data;
      if (!value) return;

      const canvasSize = size + padding * 2;
      // Reset image so canvas becomes visible for drawing
      this.setData({ _canvasSize: canvasSize, _tempImagePath: '' });

      wx.nextTick(() => {
        this.createSelectorQuery()
          .select('#qr-canvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0] || !res[0].node) return;

            const canvas = res[0].node;
            const dpr = wx.getWindowInfo().pixelRatio || 2;
            canvas.width = canvasSize * dpr;
            canvas.height = canvasSize * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            this._renderQr(canvas, ctx, canvasSize);
          });
      });
    },

    _renderQr(canvas, ctx, canvasSize) {
      const {
        value,
        size,
        color,
        backgroundColor,
        padding,
        errorCorrectionLevel,
        iconSrc,
        iconSize,
        iconBackgroundColor,
        iconBorderRadius,
      } = this.data;

      // Use HIGH error correction when icon is present
      const eclKey = iconSrc ? 'H' : errorCorrectionLevel || 'M';
      const ecl = ECL_MAP[eclKey] || ECL_MAP.M;

      let qr;
      try {
        qr = QrCode.encodeText(value, ecl);
      } catch (e) {
        console.warn('[w-qr-code] encode failed:', e.message);
        return;
      }

      const modules = qr.getModules();
      const moduleCount = qr.size;
      const cellSize = size / moduleCount;

      // Clear and fill background
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Draw modules
      ctx.fillStyle = color;
      for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
          if (modules[y][x]) {
            ctx.fillRect(
              padding + x * cellSize,
              padding + y * cellSize,
              Math.ceil(cellSize),
              Math.ceil(cellSize),
            );
          }
        }
      }

      // Draw icon or export immediately
      if (iconSrc) {
        this._drawIcon(canvas, ctx, canvasSize, iconSize, iconBackgroundColor, iconBorderRadius);
      } else {
        this._toImage(canvas);
      }
    },

    _drawIcon(canvas, ctx, canvasSize, iconSize, bgColor, borderRadius) {
      const { iconSrc } = this.data;
      const img = canvas.createImage();

      img.onload = () => {
        const iconPadding = 4;
        const bgSize = iconSize + iconPadding * 2;
        const bgX = (canvasSize - bgSize) / 2;
        const bgY = (canvasSize - bgSize) / 2;

        // Draw icon background with rounded corners
        ctx.fillStyle = bgColor;
        this._roundRect(ctx, bgX, bgY, bgSize, bgSize, borderRadius);
        ctx.fill();

        // Draw icon centered, maintain aspect ratio
        const ratio = Math.min(iconSize / img.width, iconSize / img.height);
        const drawW = img.width * ratio;
        const drawH = img.height * ratio;
        const drawX = (canvasSize - drawW) / 2;
        const drawY = (canvasSize - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        this._toImage(canvas);
      };

      img.onerror = () => {
        console.warn('[w-qr-code] icon load failed:', iconSrc);
      };

      img.src = iconSrc;
    },

    _toImage(canvas) {
      wx.canvasToTempFilePath(
        {
          canvas,
          success: (res) => {
            this.setData({ _tempImagePath: res.tempFilePath });
          },
        },
        this,
      );
    },

    _roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },

    onTap() {
      this.triggerEvent('click');
    },
  },
});
