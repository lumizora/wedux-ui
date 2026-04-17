Component({
  properties: {
    content: {
      type: String,
      value: '',
    },
    fontSize: {
      type: Number,
      value: 14,
    },
    fontColor: {
      type: String,
      value: 'rgba(128, 128, 128, 0.15)',
    },
    fontWeight: {
      type: String,
      value: 'normal',
    },
    fontFamily: {
      type: String,
      value: 'sans-serif',
    },
    width: {
      type: Number,
      value: 120,
    },
    height: {
      type: Number,
      value: 64,
    },
    rotate: {
      type: Number,
      value: -22,
    },
    xGap: {
      type: Number,
      value: 0,
    },
    yGap: {
      type: Number,
      value: 0,
    },
    xOffset: {
      type: Number,
      value: 0,
    },
    yOffset: {
      type: Number,
      value: 0,
    },
    zIndex: {
      type: Number,
      value: 10,
    },
    image: {
      type: String,
      value: '',
    },
    imageWidth: {
      type: Number,
      value: 0,
    },
    imageHeight: {
      type: Number,
      value: 0,
    },
    imageOpacity: {
      type: Number,
      value: 1,
    },
    cross: {
      type: Boolean,
      value: false,
    },
    fullscreen: {
      type: Boolean,
      value: false,
    },
    lineHeight: {
      type: Number,
      value: 0,
    },
    selectable: {
      type: Boolean,
      value: true,
    },
    globalRotate: {
      type: Number,
      value: 0,
    },
  },

  data: {
    _bgStyle: '',
    _canvasW: 0,
    _canvasH: 0,
  },

  lifetimes: {
    attached() {
      this._draw();
    },
  },

  observers: {
    'content, fontSize, fontColor, fontWeight, fontFamily, width, height, rotate, xGap, yGap, xOffset, yOffset, image, imageWidth, imageHeight, imageOpacity, cross, lineHeight, globalRotate'() {
      this._draw();
    },
  },

  methods: {
    _draw() {
      const props = this.data;
      const content = props.content;
      const image = props.image;

      if (!content && !image) {
        this.setData({ _bgStyle: '' });
        return;
      }

      const dpr = wx.getWindowInfo().pixelRatio || 2;
      const cellW = props.width;
      const cellH = props.height;
      const xGap = props.xGap;
      const yGap = props.yGap;
      const patternW = cellW + xGap;
      const patternH = cellH + yGap;
      const canvasW = props.cross ? patternW * 2 : patternW;
      const canvasH = props.cross ? patternH * 2 : patternH;

      this.setData({
        _canvasW: canvasW,
        _canvasH: canvasH,
      });

      wx.nextTick(() => {
        const query = this.createSelectorQuery();
        query
          .select('#watermark-canvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0] || !res[0].node) return;

            const canvas = res[0].node;
            canvas.width = canvasW * dpr;
            canvas.height = canvasH * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            if (image) {
              this._drawImage(canvas, ctx, canvasW, canvasH, dpr, props);
            } else {
              this._drawText(ctx, canvasW, canvasH, props);
              this._export(canvas, canvasW, canvasH, dpr, props);
            }
          });
      });
    },

    _drawSingleMark(ctx, x, y, props) {
      const cellW = props.width;
      const cellH = props.height;
      const rotate = props.rotate;

      ctx.save();
      ctx.translate(x + cellW / 2, y + cellH / 2);
      ctx.rotate((rotate * Math.PI) / 180);

      const fontSize = props.fontSize;
      const lh = props.lineHeight || fontSize * 1.5;
      ctx.font = `${props.fontWeight} ${fontSize}px ${props.fontFamily}`;
      ctx.fillStyle = props.fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = props.content.split('\n');
      const totalH = lines.length * lh;
      const startY = -totalH / 2 + lh / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, 0, startY + i * lh);
      });

      ctx.restore();
    },

    _drawText(ctx, canvasW, canvasH, props) {
      const patternW = props.width + props.xGap;
      const patternH = props.height + props.yGap;

      this._drawSingleMark(ctx, 0, 0, props);

      if (props.cross) {
        this._drawSingleMark(ctx, patternW, patternH, props);
      }
    },

    _drawImage(canvas, ctx, canvasW, canvasH, dpr, props) {
      const img = canvas.createImage();
      img.onload = () => {
        let iw = props.imageWidth || img.width;
        let ih = props.imageHeight || img.height;
        if (!props.imageWidth && !props.imageHeight) {
          iw = img.width;
          ih = img.height;
        } else if (props.imageWidth && !props.imageHeight) {
          ih = (img.height / img.width) * iw;
        } else if (!props.imageWidth && props.imageHeight) {
          iw = (img.width / img.height) * ih;
        }

        const cellW = props.width;
        const cellH = props.height;
        const patternW = cellW + props.xGap;
        const patternH = cellH + props.yGap;

        const drawOne = (x, y) => {
          ctx.save();
          ctx.translate(x + cellW / 2, y + cellH / 2);
          ctx.rotate((props.rotate * Math.PI) / 180);
          ctx.globalAlpha = props.imageOpacity;
          ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
          ctx.restore();
        };

        drawOne(0, 0);
        if (props.cross) {
          drawOne(patternW, patternH);
        }

        this._export(canvas, canvasW, canvasH, dpr, props);
      };
      img.onerror = () => {
        console.warn('[w-watermark] image load failed:', props.image);
      };
      img.src = props.image;
    },

    _export(canvas, canvasW, canvasH, dpr, props) {
      const dataURL = canvas.toDataURL('image/png');
      const bgSize = `${canvasW}px ${canvasH}px`;
      const xOffset = props.xOffset;
      const yOffset = props.yOffset;
      const bgPos = `${xOffset}px ${yOffset}px`;

      let style =
        `background-image: url('${dataURL}');` +
        `background-size: ${bgSize};` +
        'background-repeat: repeat;' +
        `background-position: ${bgPos};`;

      if (props.globalRotate) {
        style += `transform: rotate(${props.globalRotate}deg);`;
      }

      this.setData({ _bgStyle: style });
    },
  },
});
